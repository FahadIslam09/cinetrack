"use client";

import { useState, useEffect } from "react";
import { X, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2, KeyRound } from "lucide-react";
import { changePassword } from "@/actions/account";
import { useScrollLock } from "@/hooks/use-scroll-lock";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  isGoogleOnly: boolean;
  onSuccess?: () => void;
}

export function ChangePasswordModal({
  isOpen,
  onClose,
  isGoogleOnly,
  onSuccess,
}: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useScrollLock(isOpen);

  useEffect(() => {
    if (isOpen) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowCurrent(false);
      setShowNew(false);
      setShowConfirm(false);
      setError(null);
      setSuccessMessage(null);
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

  const isLengthValid = newPassword.length >= 8;
  const isMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const canSubmit =
    isLengthValid &&
    isMatch &&
    (isGoogleOnly || currentPassword.length > 0) &&
    !isSubmitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    setError(null);

    const res = await changePassword({
      currentPassword: isGoogleOnly ? undefined : currentPassword,
      newPassword,
    });

    setIsSubmitting(false);

    if (res.error) {
      setError(res.error);
    } else if (res.success) {
      setSuccessMessage(res.message || "Password updated successfully.");
      if (onSuccess) onSuccess();
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

        {successMessage ? (
          /* Success View */
          <div className="flex flex-col items-center text-center py-2 space-y-4 animate-in fade-in duration-300">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-[#F5F7FA]">
                {isGoogleOnly ? "Password Created" : "Password Updated"}
              </h3>
              <p className="text-xs text-[#A8B0BD] mt-1.5 leading-relaxed max-w-xs mx-auto">
                {successMessage}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full h-10 rounded-xl bg-[#3B9EFF] hover:bg-[#5AAFFF] text-white text-xs font-semibold transition-all cursor-pointer shadow-sm active:scale-98 mt-2"
            >
              Done
            </button>
          </div>
        ) : (
          /* Form View */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#3B9EFF]/10 border border-[#3B9EFF]/20 text-[#3B9EFF] flex items-center justify-center shrink-0">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#F5F7FA]">
                  {isGoogleOnly ? "Set a Password" : "Change Password"}
                </h3>
                <p className="text-xs text-[#A8B0BD] mt-0.5">
                  {isGoogleOnly
                    ? "Add a password to sign in via email in addition to Google."
                    : "Update your password to keep your account secure."}
                </p>
              </div>
            </div>

            {/* Current Password Field (Only for users who already have a password) */}
            {!isGoogleOnly && (
              <div className="space-y-1.5 pt-1">
                <label
                  htmlFor="current-password"
                  className="text-xs font-semibold text-[#A8B0BD] block"
                >
                  Current password
                </label>
                <div className="relative">
                  <input
                    id="current-password"
                    type={showCurrent ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => {
                      setCurrentPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    required
                    autoComplete="current-password"
                    placeholder="Enter current password"
                    className="w-full h-11 pl-3.5 pr-10 rounded-xl bg-[#0F141D] border border-white/[0.08] focus:border-[#3B9EFF]/60 text-sm text-[#F5F7FA] placeholder-[#6F7886] outline-none focus:ring-1 focus:ring-[#3B9EFF]/40 transition-all font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent((prev) => !prev)}
                    aria-label={showCurrent ? "Hide current password" : "Show current password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6F7886] hover:text-[#A8B0BD] p-1 cursor-pointer transition-colors"
                  >
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* New Password Field */}
            <div className="space-y-1.5">
              <label htmlFor="new-password" className="text-xs font-semibold text-[#A8B0BD] block">
                New password
              </label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  required
                  autoComplete="new-password"
                  placeholder="Minimum 8 characters"
                  className="w-full h-11 pl-3.5 pr-10 rounded-xl bg-[#0F141D] border border-white/[0.08] focus:border-[#3B9EFF]/60 text-sm text-[#F5F7FA] placeholder-[#6F7886] outline-none focus:ring-1 focus:ring-[#3B9EFF]/40 transition-all font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((prev) => !prev)}
                  aria-label={showNew ? "Hide new password" : "Show new password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6F7886] hover:text-[#A8B0BD] p-1 cursor-pointer transition-colors"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Requirement Hint */}
              <div className="text-[11px] pt-0.5">
                {newPassword.length > 0 ? (
                  isLengthValid ? (
                    <span className="text-emerald-400 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      8 or more characters
                    </span>
                  ) : (
                    <span className="text-amber-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Must be at least 8 characters ({8 - newPassword.length} more needed)
                    </span>
                  )
                ) : (
                  <span className="text-[#6F7886]">Must be at least 8 characters</span>
                )}
              </div>
            </div>

            {/* Confirm New Password Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="confirm-password"
                className="text-xs font-semibold text-[#A8B0BD] block"
              >
                Confirm new password
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  required
                  autoComplete="new-password"
                  placeholder="Re-enter new password"
                  className="w-full h-11 pl-3.5 pr-10 rounded-xl bg-[#0F141D] border border-white/[0.08] focus:border-[#3B9EFF]/60 text-sm text-[#F5F7FA] placeholder-[#6F7886] outline-none focus:ring-1 focus:ring-[#3B9EFF]/40 transition-all font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((prev) => !prev)}
                  aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6F7886] hover:text-[#A8B0BD] p-1 cursor-pointer transition-colors"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Match Hint */}
              {confirmPassword.length > 0 && (
                <div className="text-[11px] pt-0.5">
                  {isMatch ? (
                    <span className="text-emerald-400 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Passwords match
                    </span>
                  ) : (
                    <span className="text-amber-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Passwords do not match
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Error Banner */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-3">
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
                    <span>Updating…</span>
                  </>
                ) : (
                  <span>{isGoogleOnly ? "Create Password" : "Update Password"}</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
