"use client";

import React, { useEffect, useState } from "react";
import {
  Download,
  X,
  Sparkles,
  Zap,
  Film,
  WifiOff,
  CheckCircle2,
  Share2,
  PlusSquare,
  ArrowRight,
  Laptop,
  Smartphone,
} from "lucide-react";
import { LogoIcon } from "@/components/ui/logo-icon";
import { useScrollLock } from "@/hooks/use-scroll-lock";

interface InstallPwaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstall: () => Promise<boolean>;
  hasNativePrompt: boolean;
  isIOS: boolean;
  isInstalled: boolean;
  isPostRegister: boolean;
}

export function InstallPwaModal({
  isOpen,
  onClose,
  onInstall,
  hasNativePrompt,
  isIOS,
  isInstalled,
  isPostRegister,
}: InstallPwaModalProps) {
  const [isInstalling, setIsInstalling] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  useScrollLock(isOpen);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (hasNativePrompt) {
      setIsInstalling(true);
      try {
        const installed = await onInstall();
        if (installed) {
          setInstalledSuccess(true);
          setTimeout(() => {
            onClose();
          }, 1500);
        }
      } finally {
        setIsInstalling(false);
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pwa-modal-title"
    >
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-[480px] my-auto rounded-3xl bg-[#151C27]/95 border border-white/[0.12] shadow-[0_24px_70px_rgba(0,0,0,0.8)] backdrop-blur-2xl ring-1 ring-black/40 overflow-hidden text-center z-10 animate-in zoom-in-95 duration-200 flex flex-col">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-[#3B9EFF]/20 blur-3xl pointer-events-none -z-10" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-[#A8B0BD] hover:text-[#F5F7FA] flex items-center justify-center transition-colors cursor-pointer z-20"
          aria-label="Close install modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content Container */}
        <div className="p-6 sm:p-8 flex flex-col items-center">
          {/* Logo Badge with Glowing Rings */}
          <div className="relative mb-5">
            <div className="absolute inset-0 rounded-2xl bg-[#3B9EFF]/25 blur-xl animate-pulse" />
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#1E293B] to-[#0F141D] border border-[#3B9EFF]/40 shadow-xl flex items-center justify-center p-3 sm:p-4">
              <LogoIcon className="w-full h-full" size={56} priority />
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-[#3B9EFF] text-[10px] font-extrabold uppercase tracking-widest text-white shadow-md shadow-[#3B9EFF]/30 flex items-center gap-1 whitespace-nowrap">
              <Sparkles className="w-2.5 h-2.5" />
              <span>Official App</span>
            </div>
          </div>

          {/* Heading */}
          <h2
            id="pwa-modal-title"
            className="text-xl sm:text-2xl font-extrabold text-[#F5F7FA] tracking-tight mb-2 mt-1"
          >
            {isInstalled
              ? "CineTrack is Installed"
              : isPostRegister
              ? "Welcome! Install CineTrack"
              : "Install CineTrack App"}
          </h2>

          <p className="text-xs sm:text-[13px] text-[#A8B0BD] leading-relaxed max-w-sm mb-6">
            {isInstalled
              ? "You already have the app installed on your device for instant cinematic tracking."
              : isPostRegister
              ? "Your account is ready! Install the app on your device for fast, one-tap access anytime."
              : "Get the full-screen cinematic app with zero browser bars, instant launch, and offline library access."}
          </p>

          {/* Feature Highlights Grid */}
          {!isInstalled && (
            <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5 mb-6 text-left">
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex sm:flex-col items-center sm:items-start gap-3 sm:gap-1.5">
                <div className="w-8 h-8 rounded-xl bg-[#3B9EFF]/10 border border-[#3B9EFF]/20 text-[#3B9EFF] flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#F5F7FA]">Instant Launch</h3>
                  <p className="text-[11px] text-[#6F7886] leading-tight">One tap from dock or home screen</p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex sm:flex-col items-center sm:items-start gap-3 sm:gap-1.5">
                <div className="w-8 h-8 rounded-xl bg-[#3B9EFF]/10 border border-[#3B9EFF]/20 text-[#3B9EFF] flex items-center justify-center shrink-0">
                  <Film className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#F5F7FA]">Cinematic Mode</h3>
                  <p className="text-[11px] text-[#6F7886] leading-tight">Full-screen with zero browser bars</p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex sm:flex-col items-center sm:items-start gap-3 sm:gap-1.5">
                <div className="w-8 h-8 rounded-xl bg-[#3B9EFF]/10 border border-[#3B9EFF]/20 text-[#3B9EFF] flex items-center justify-center shrink-0">
                  <WifiOff className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#F5F7FA]">Offline Cache</h3>
                  <p className="text-[11px] text-[#6F7886] leading-tight">Browse saved library without internet</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Area: Native Prompt or iOS Instructions */}
          {isInstalled ? (
            <div className="w-full flex flex-col gap-2">
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>App is running or already installed</span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-bold text-[#F5F7FA] transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          ) : isIOS ? (
            /* iOS Safari Step-by-Step Guidance */
            <div className="w-full flex flex-col gap-3">
              <div className="p-4 rounded-2xl bg-[#0F141D]/90 border border-white/[0.08] text-left space-y-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#3B9EFF] flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>How to install on iOS / Safari:</span>
                </div>

                <div className="space-y-2.5 text-xs text-[#CBD5E1]">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#3B9EFF]/15 text-[#3B9EFF] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <span>
                      Tap the <strong className="text-[#F5F7FA]">Share</strong> icon{" "}
                      <Share2 className="w-3.5 h-3.5 inline text-[#3B9EFF] -mt-0.5 mx-0.5" /> in Safari&apos;s bottom toolbar.
                    </span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#3B9EFF]/15 text-[#3B9EFF] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </span>
                    <span>
                      Scroll down and select <strong className="text-[#F5F7FA]">Add to Home Screen</strong>{" "}
                      <PlusSquare className="w-3.5 h-3.5 inline text-[#3B9EFF] -mt-0.5 mx-0.5" />.
                    </span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#3B9EFF]/15 text-[#3B9EFF] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </span>
                    <span>
                      Tap <strong className="text-[#F5F7FA]">Add</strong> in the top-right corner to finish.
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-[#3B9EFF] hover:bg-[#5AAFFF] text-xs font-bold text-white transition-colors cursor-pointer shadow-lg shadow-[#3B9EFF]/20"
              >
                Got It, Thanks!
              </button>
            </div>
          ) : hasNativePrompt ? (
            /* Chrome / Android / Edge Native Prompt Trigger */
            <div className="w-full flex flex-col gap-2.5">
              <button
                type="button"
                onClick={handleInstallClick}
                disabled={isInstalling || installedSuccess}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#3B9EFF] to-[#2563EB] hover:from-[#5AAFFF] hover:to-[#3B82F6] text-white text-xs sm:text-sm font-bold transition-all shadow-lg shadow-[#3B9EFF]/25 hover:shadow-[#3B9EFF]/40 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {installedSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>App Installed Successfully!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Install CineTrack App</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 text-xs text-[#A8B0BD] hover:text-[#F5F7FA] transition-colors cursor-pointer font-medium"
              >
                Maybe Later
              </button>
            </div>
          ) : (
            /* Browser without direct beforeinstallprompt (e.g. desktop Firefox, Safari Mac, or already prompt expired) */
            <div className="w-full flex flex-col gap-3">
              <div className="p-3.5 rounded-2xl bg-[#0F141D]/90 border border-white/[0.08] text-xs text-[#CBD5E1] text-left flex items-start gap-2.5">
                <Laptop className="w-4 h-4 text-[#3B9EFF] shrink-0 mt-0.5" />
                <span>
                  To install in this browser, click the <strong className="text-[#F5F7FA]">Install icon</strong> in your browser&apos;s address bar or select <strong className="text-[#F5F7FA]">Install CineTrack</strong> from your browser menu.
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-[#3B9EFF] hover:bg-[#5AAFFF] text-xs font-bold text-white transition-colors cursor-pointer"
              >
                Got It
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
