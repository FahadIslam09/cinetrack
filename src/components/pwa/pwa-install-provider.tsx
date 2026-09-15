"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { InstallPwaModal } from "./install-pwa-modal";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

interface PwaInstallContextType {
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  isInstallModalOpen: boolean;
  isPostRegister: boolean;
  openInstallModal: (isPostRegister?: boolean) => void;
  closeInstallModal: () => void;
  triggerInstall: () => Promise<boolean>;
}

const PwaInstallContext = createContext<PwaInstallContextType | null>(null);

const STORAGE_KEY_DISMISSED = "cinetrack_pwa_dismissed_v1";
const SESSION_KEY_REGISTERED = "cinetrack_just_registered";

export function PwaInstallProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isPostRegister, setIsPostRegister] = useState(false);

  useEffect(() => {
    // 1. Check if already running in standalone / PWA mode
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes("android-app://");

    setIsInstalled(isStandalone);

    // 2. Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice =
      /iphone|ipad|ipod/.test(userAgent) ||
      (window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1);
    setIsIOS(isIosDevice);

    // 3. Listen for native browser beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      setIsInstallModalOpen(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // 4. If iOS and not standalone, it's installable via Safari
    if (isIosDevice && !isStandalone) {
      setIsInstallable(true);
    }

    // 5. Check if user just registered (sessionStorage flag or URL param)
    const checkPostRegister = () => {
      if (isStandalone) return;
      const justRegistered = sessionStorage.getItem(SESSION_KEY_REGISTERED);
      const urlParams = new URLSearchParams(window.location.search);
      const registeredParam = urlParams.get("registered") === "true";

      if (justRegistered === "true" || registeredParam) {
        sessionStorage.removeItem(SESSION_KEY_REGISTERED);
        const dismissed = localStorage.getItem(STORAGE_KEY_DISMISSED);
        if (!dismissed) {
          // Slight delay so the user transitions into the app smoothly
          const timer = setTimeout(() => {
            setIsPostRegister(true);
            setIsInstallModalOpen(true);
          }, 1200);
          return () => clearTimeout(timer);
        }
      }
    };

    checkPostRegister();

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const openInstallModal = useCallback((postRegister = false) => {
    setIsPostRegister(postRegister);
    setIsInstallModalOpen(true);
  }, []);

  const closeInstallModal = useCallback(() => {
    setIsInstallModalOpen(false);
    if (isPostRegister) {
      // Remember dismissal so post-register doesn't pop up again
      try {
        localStorage.setItem(STORAGE_KEY_DISMISSED, Date.now().toString());
      } catch {}
    }
  }, [isPostRegister]);

  const triggerInstall = useCallback(async (): Promise<boolean> => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === "accepted") {
          setIsInstalled(true);
          setIsInstallable(false);
          setDeferredPrompt(null);
          setIsInstallModalOpen(false);
          return true;
        }
      } catch (err) {
        console.error("PWA install error:", err);
      }
    }
    return false;
  }, [deferredPrompt]);

  return (
    <PwaInstallContext.Provider
      value={{
        isInstallable,
        isInstalled,
        isIOS,
        isInstallModalOpen,
        isPostRegister,
        openInstallModal,
        closeInstallModal,
        triggerInstall,
      }}
    >
      {children}
      <InstallPwaModal
        isOpen={isInstallModalOpen}
        onClose={closeInstallModal}
        onInstall={triggerInstall}
        hasNativePrompt={!!deferredPrompt}
        isIOS={isIOS}
        isInstalled={isInstalled}
        isPostRegister={isPostRegister}
      />
    </PwaInstallContext.Provider>
  );
}

export function usePwaInstall() {
  const context = useContext(PwaInstallContext);
  if (!context) {
    throw new Error("usePwaInstall must be used within a PwaInstallProvider");
  }
  return context;
}
