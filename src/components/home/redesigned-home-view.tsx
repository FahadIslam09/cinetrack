"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Compass, Library, X, Send, CheckCircle2 } from "lucide-react";
import { AppHeader } from "@/components/navigation/app-header";
import { BottomNav } from "@/components/navigation/bottom-nav";

interface RedesignedHomeViewProps {
  user: {
    email?: string;
    avatarUrl?: string;
    username?: string;
  } | null;
}

export function RedesignedHomeView({ user }: RedesignedHomeViewProps) {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsFeedbackOpen(false);
    };
    if (isFeedbackOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFeedbackOpen]);

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;

    // Persist locally so feedback isn't lost
    try {
      const existing = JSON.parse(
        localStorage.getItem("cinetrack_home_ideas") || "[]"
      );
      existing.push({
        text: feedbackText.trim(),
        user: user?.username || user?.email || "anonymous",
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem("cinetrack_home_ideas", JSON.stringify(existing));
    } catch {
      // ignore storage errors
    }

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFeedbackText("");
      setIsFeedbackOpen(false);
    }, 1800);
  };

  return (
    <div className="relative flex flex-col w-full min-h-[100dvh] bg-[#0F141D] text-[#F5F7FA] overflow-x-hidden selection:bg-[#3B9EFF]/20 selection:text-white">
      {/* Existing App Navigation Header */}
      <AppHeader user={user} />

      {/* Subtle Ambient Radial Glow in background (no harsh gradients, very restrained) */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-60"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 45%, rgba(59, 158, 255, 0.035), transparent 70%)",
        }}
        aria-hidden="true"
      />

      {/* Main Viewport Container: Centered vertically and horizontally without forcing scroll */}
      <main className="relative z-10 flex-1 flex flex-col justify-between items-center w-full pt-[70px] pb-20 md:pb-6 px-4 sm:px-6">
        {/* Top Spacer for Optical Balance */}
        <div className="w-full flex-1 max-h-16 sm:max-h-24" aria-hidden="true" />

        {/* Central Editorial Content Cluster */}
        <div className="w-full max-w-xl mx-auto flex flex-col items-center text-center my-auto transition-all duration-700 ease-out">
          {/* Subtle "Next Version" Status Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-[11px] font-medium text-[#A8B0BD] tracking-wider uppercase mb-5 sm:mb-6 shadow-xs select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3B9EFF] animate-pulse" />
            <span>Next version · In planning</span>
          </div>

          {/* Primary Editorial Headline */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-semibold text-[#F5F7FA] tracking-[-0.025em] leading-[1.2] max-w-[540px]">
            We’re still figuring out what belongs here.
          </h1>

          {/* Refined Minimal Divider */}
          <div
            className="w-10 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-4 sm:my-5"
            aria-hidden="true"
          />

          {/* Supporting Text */}
          <p className="text-sm sm:text-[15px] text-[#A8B0BD] leading-relaxed max-w-[460px] font-normal">
            The Home page is currently being redesigned. We’re working on a
            better way to bring everything together in the next version.
          </p>

          {/* Subtle Interactive Invitation */}
          <div className="mt-4 sm:mt-5 text-xs sm:text-[13px] text-[#6F7886] flex items-center justify-center gap-1.5 flex-wrap">
            <span>Have an idea for what should be here?</span>
            <button
              type="button"
              onClick={() => setIsFeedbackOpen(true)}
              className="text-[#3B9EFF] hover:text-[#5AAFFF] font-medium underline underline-offset-4 decoration-[#3B9EFF]/30 hover:decoration-[#3B9EFF] transition-colors cursor-pointer"
            >
              Let us know.
            </button>
          </div>

          {/* Subtle Utility Pathing: Quiet jump links to Discover and My Library */}
          <div className="flex items-center justify-center gap-2.5 sm:gap-3 mt-8 sm:mt-10">
            <Link
              href="/discover"
              className="h-9 px-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.07] hover:border-white/[0.14] text-xs font-medium text-[#A8B0BD] hover:text-[#F5F7FA] transition-all flex items-center gap-2 cursor-pointer active:scale-98"
            >
              <Compass className="w-3.5 h-3.5 text-[#3B9EFF]" />
              <span>Explore Discover</span>
            </Link>

            <Link
              href="/library"
              className="h-9 px-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.07] hover:border-white/[0.14] text-xs font-medium text-[#A8B0BD] hover:text-[#F5F7FA] transition-all flex items-center gap-2 cursor-pointer active:scale-98"
            >
              <Library className="w-3.5 h-3.5 text-[#22C55E]" />
              <span>Open Library</span>
            </Link>
          </div>
        </div>

        {/* Bottom Optical Balancing Space */}
        <div className="w-full flex-1 max-h-16 sm:max-h-24" aria-hidden="true" />

        {/* Minimal Quiet Bottom Footnote (Restrained, no huge footer block) */}
        <footer className="w-full text-center py-3 select-none">
          <p className="text-[11px] text-[#6F7886]/60 tracking-wider">
            CineTrack · Editorial Curation
          </p>
        </footer>
      </main>

      {/* Interactive Feedback Modal for "Let us know." */}
      {isFeedbackOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-md bg-[#151C27] border border-white/[0.1] rounded-2xl p-5 sm:p-6 shadow-2xl relative"
            role="dialog"
            aria-modal="true"
            aria-labelledby="feedback-dialog-title"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsFeedbackOpen(false)}
              className="absolute top-4 right-4 text-[#6F7886] hover:text-white p-1 rounded-lg hover:bg-white/[0.06] transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>

            {isSubmitted ? (
              <div className="py-8 flex flex-col items-center justify-center text-center gap-2.5">
                <CheckCircle2 className="w-8 h-8 text-[#22C55E] animate-in zoom-in-50 duration-300" />
                <h3 className="text-base font-semibold text-[#F5F7FA]">
                  Idea Received
                </h3>
                <p className="text-xs text-[#A8B0BD] max-w-xs">
                  Thank you — your suggestion has been recorded for the next Home
                  page design.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitFeedback} className="flex flex-col gap-4">
                <h3 id="feedback-dialog-title" className="text-sm font-semibold text-[#F5F7FA]">
                  What should live here?
                </h3>

                <p className="text-xs text-[#A8B0BD] leading-relaxed">
                  Have a specific feature, layout, or shelf you want to see on
                  the Home page? Share your thoughts directly with the design team.
                </p>

                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="e.g. A daily curated double-feature, friend activity radar, or minimal release calendar..."
                  rows={4}
                  autoFocus
                  className="w-full p-3 rounded-xl bg-[#0F141D] border border-white/[0.08] focus:border-[#3B9EFF]/50 text-xs text-[#F5F7FA] placeholder-[#6F7886] resize-none outline-none focus:ring-1 focus:ring-[#3B9EFF]/40 transition-all font-sans"
                />

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsFeedbackOpen(false)}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#A8B0BD] hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!feedbackText.trim()}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#3B9EFF] hover:bg-[#5AAFFF] disabled:opacity-40 disabled:hover:bg-[#3B9EFF] text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Idea</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
