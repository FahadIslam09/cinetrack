"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

interface ShareProfileButtonProps {
  username: string;
  className?: string;
}

export function ShareProfileButton({
  username,
  className = "",
}: ShareProfileButtonProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleShare = async () => {
    const profileUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/${username}`
        : `https://cinetrack.xyz/${username}`;

    try {
      if (
        typeof navigator !== "undefined" &&
        navigator.clipboard &&
        navigator.clipboard.writeText
      ) {
        await navigator.clipboard.writeText(profileUrl);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = profileUrl;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }

      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2200);
    } catch (err) {
      console.error("Failed to copy profile link:", err);
    }
  };

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={handleShare}
        className={`p-2 rounded-lg border transition-all duration-150 active:scale-95 cursor-pointer ${
          isCopied
            ? "bg-[#22C55E]/15 border-[#22C55E]/50 text-[#22C55E] shadow-sm shadow-[#22C55E]/20"
            : "bg-white/[0.06] hover:bg-white/[0.1] border-white/[0.08] text-white hover:border-white/[0.15]"
        } ${className}`}
        title={isCopied ? "Copied!" : "Share Profile"}
        aria-label="Share Profile"
      >
        {isCopied ? (
          <Check className="w-4 h-4 text-[#22C55E] animate-in zoom-in-75 duration-150" />
        ) : (
          <Share2 className="w-4 h-4" />
        )}
      </button>

      {/* Floating feedback tooltip */}
      {isCopied && (
        <div
          role="status"
          className="absolute -bottom-8 right-0 px-2 py-0.5 rounded-md bg-[#151C27] border border-[#22C55E]/40 text-[#22C55E] text-[10px] font-bold shadow-xl shadow-black/60 whitespace-nowrap z-30 animate-in fade-in slide-in-from-top-1 duration-150 pointer-events-none flex items-center gap-1"
        >
          <Check className="w-3 h-3" />
          <span>Profile link copied!</span>
        </div>
      )}
    </div>
  );
}
