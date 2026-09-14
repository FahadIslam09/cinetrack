"use client";

import { useState, useEffect } from "react";
import { X, Mail, CheckCircle2, AlertCircle, Loader2, Send } from "lucide-react";
import { changeEmail } from "@/actions/account";
import { useScrollLock } from "@/hooks/use-scroll-lock";

interface ChangeEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentEmail: string;
  onSuccess?: (newEmail: string) => void;
}

export function ChangeEmailModal({
  isOpen,
  onClose,
  currentEmail,
  onSuccess,
}: ChangeEmailModalProps) {
  const [newEmail, setNewEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ email: string; message: string } | null>(null);

  useScrollLock(isOpen);

  useEffect(() => {
    if (isOpen) {
      setNewEmail("");
      setError(null);
      setSuccessInfo(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting) onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isFormatValid = emailRegex.test(newEmail.trim());
  const isSameAsCurrent = newEmail.trim().toLowerCase() === currentEmail.toLowerCase();
  const canSubmit = isFormatValid && !isSameAsCurrent && !isSubmitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    setError(null);

    const res = await changeEmail(newEmail.trim());

    setIsSubmitting(false);

    if (res.error) {
      setError(res.error);
    } else if (res.success) {
      setSuccessInfo({
        email: res.email || newEmail.trim(),
        message: res.message || "Verification link sent to your new email address.",
      });
      if (onSuccess && res.email) {
        onSuccess(res.email);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0A0D14]/80 backdrop-blur-md transition-opacity"
        onClick={isSubmitting ? undefined : onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md rounded-3xl bg-[#151C27] border border-white/[0.08] shadow-2xl p-6 sm:p-7 z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-5 right-5 p-1.5 rounded-xl text-[#6F7886] hover:text-[#F5F7FA] hover:bg-white/[0.04] transition-colors cursor-pointer disabled:opacity-40"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {successInfo ? (
          /* Success Confirmation View */
          <div className="flex flex-col items-center text-center py-2 space-y-4 animate-in fade-in duration-300">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-[#F5F7FA]">Confirmation Link Sent</h3>
              <p className="text-xs text-[#A8B0BD] mt-1.5 leading-relaxed max-w-xs mx-auto">
                We sent a verification email to{" "}
                <span className="font-semibold text-white">{successInfo.email}</span>.
              </p>
            </div>

            <div className="w-full rounded-xl bg-[#0F141D] border border-white/[0.06] p-3.5 text-left text-xs text-[#A8B0BD] space-y-1.5 leading-relaxed">
              <div className="font-semibold text-[#F5F7FA] flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#3B9EFF]" />
                <span>Next steps</span>
              </div>
              <p>
                Open your inbox and click the verification link. Your email will be updated once verified. You can continue using CineTrack in the meantime.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full h-10 rounded-xl bg-[#3B9EFF] hover:bg-[#5AAFFF] text-white text-xs font-semibold transition-all cursor-pointer shadow-sm active:scale-98"
            >
              Done
            </button>
          </div>
        ) : (
          /* Input Form */
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#3B9EFF]/10 border border-[#3B9EFF]/20 text-[#3B9EFF] flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#F5F7FA]">Change Email Address</h3>
                <p className="text-xs text-[#A8B0BD] mt-0.5">
                  Update the email associated with your CineTrack account.
                </p>
              </div>
            </div>

            {/* Current Email Info */}
            <div className="rounded-xl bg-[#0F141D] border border-white/[0.06] p-3 space-y-1">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-[#6F7886] block">
                Current email
              </span>
              <span className="text-sm font-medium text-[#F5F7FA] font-mono break-all block">
                {currentEmail}
              </span>
            </div>

            {/* New Email Input */}
            <div className="space-y-1.5">
              <label htmlFor="new-email" className="text-xs font-semibold text-[#A8B0BD] block">
                New email address
              </label>
              <div className="relative">
                <input
                  id="new-email"
                  type="email"
                  value={newEmail}
                  onChange={(e) => {
                    setNewEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="name@example.com"
                  required
                  autoFocus
                  autoComplete="email"
                  className="w-full h-11 px-3.5 rounded-xl bg-[#0F141D] border border-white/[0.08] focus:border-[#3B9EFF]/60 text-sm text-[#F5F7FA] placeholder-[#6F7886] outline-none focus:ring-1 focus:ring-[#3B9EFF]/40 transition-all font-sans"
                />
              </div>

              {/* Status Hint */}
              {newEmail.length > 0 && (
                <div className="text-[11px] pt-1">
                  {isSameAsCurrent ? (
                    <span className="text-amber-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Must be different from your current email.
                    </span>
                  ) : !isFormatValid ? (
                    <span className="text-[#6F7886]">
                      Enter a valid email format (e.g. name@domain.com).
                    </span>
                  ) : (
                    <span className="text-emerald-400 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Valid email address.
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Security Notice */}
            <p className="text-[11px] text-[#6F7886] leading-relaxed">
              A verification link will be sent to the new address to confirm ownership before the change takes effect.
            </p>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="h-10 px-4 rounded-xl border border-white/[0.08] text-xs font-semibold text-[#A8B0BD] hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!canSubmit}
                className="h-10 px-5 rounded-xl bg-[#3B9EFF] hover:bg-[#5AAFFF] disabled:opacity-40 disabled:hover:bg-[#3B9EFF] text-white text-xs font-semibold inline-flex items-center gap-2 transition-all cursor-pointer shadow-sm active:scale-98"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Sending verification…</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Verification</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
