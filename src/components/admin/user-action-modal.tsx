"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Ban, CheckCircle2, Loader2, X } from "lucide-react";
import { updateUserStatus } from "@/actions/admin";

export type UserAdminAction = "suspend" | "ban" | "restore";

interface UserActionModalProps {
  open: boolean;
  action: UserAdminAction | null;
  userId: string;
  userName: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export function UserActionModal({
  open,
  action,
  userId,
  userName,
  onClose,
  onSuccess,
}: UserActionModalProps) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleClose = useCallback(() => {
    if (isPending) return;
    setReason("");
    setError(null);
    onClose();
  }, [isPending, onClose]);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isPending) handleClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, isPending, handleClose]);

  if (!open || !action) return null;

  const config = {
    suspend: {
      title: "Suspend Account",
      description: `Suspending @${userName} will immediately terminate their active sessions and restrict their access until unsuspended.`,
      icon: AlertTriangle,
      iconBg: "bg-amber-50 text-amber-600",
      btnBg: "bg-amber-600 hover:bg-amber-700 text-white",
      confirmLabel: "Suspend Account",
      targetStatus: "suspended" as const,
      requiresReason: false,
      placeholder: "e.g. Inappropriate behavior, spam reviews, or under investigation...",
    },
    ban: {
      title: "Ban User",
      description: `Banning @${userName} is a permanent disciplinary action. All active sessions will be revoked and subsequent logins will be rejected.`,
      icon: Ban,
      iconBg: "bg-rose-50 text-rose-600",
      btnBg: "bg-rose-600 hover:bg-rose-700 text-white",
      confirmLabel: "Ban User",
      targetStatus: "banned" as const,
      requiresReason: false,
      placeholder: "e.g. Terms of service violation, repeated abuse, malicious activity...",
    },
    restore: {
      title: "Restore Account",
      description: `Restoring @${userName} will reinstate full access to their library, reviews, and sign-in capability.`,
      icon: CheckCircle2,
      iconBg: "bg-emerald-50 text-emerald-600",
      btnBg: "bg-emerald-600 hover:bg-emerald-700 text-white",
      confirmLabel: "Restore Account",
      targetStatus: "active" as const,
      requiresReason: false,
      placeholder: "e.g. Appeal approved, suspension period resolved (optional)...",
    },
  }[action];

  const Icon = config.icon;

  const handleConfirm = () => {
    setError(null);
    startTransition(async () => {
      const res = await updateUserStatus({
        userId,
        status: config.targetStatus,
        reason: reason.trim() || undefined,
      });

      if (res.error) {
        setError(res.error);
      } else {
        handleClose();
        if (onSuccess) onSuccess();
        router.refresh();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="relative w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 overflow-hidden">
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          disabled={isPending}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Icon */}
        <div className="flex items-start gap-3.5">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${config.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="min-w-0 pr-6">
            <h3 className="text-base font-bold text-slate-900">{config.title}</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {config.description}
            </p>
          </div>
        </div>

        {/* Reason / Moderation Note input */}
        <div className="mt-5">
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Reason / Moderation Note{" "}
            <span className="font-normal text-slate-400">(logged to audit trail)</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={isPending}
            rows={3}
            maxLength={500}
            placeholder={config.placeholder}
            className="w-full text-xs text-slate-900 placeholder:text-slate-400 bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
          />
          <div className="text-[11px] text-slate-400 text-right mt-1">
            {reason.length}/500
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
            {error}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 mt-6 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={handleClose}
            disabled={isPending}
            className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isPending}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-60 ${config.btnBg}`}
          >
            {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {config.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
