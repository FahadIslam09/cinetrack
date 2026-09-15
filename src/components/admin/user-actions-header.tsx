"use client";

import { useState } from "react";
import Link from "next/link";
import { ShieldCheck, AlertTriangle, Ban, CheckCircle2, ExternalLink } from "lucide-react";
import { UserActionModal, type UserAdminAction } from "./user-action-modal";

interface UserActionsHeaderProps {
  userId: string;
  username: string;
  role: string;
  status: "active" | "suspended" | "banned";
  isCurrentAdmin?: boolean;
}

export function UserActionsHeader({
  userId,
  username,
  role,
  status,
  isCurrentAdmin,
}: UserActionsHeaderProps) {
  const [modalAction, setModalAction] = useState<UserAdminAction | null>(null);

  const isProtected = role === "admin" || isCurrentAdmin;

  return (
    <>
      <div className="flex items-center gap-2 flex-wrap">
        {isProtected ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Protected Account</span>
          </div>
        ) : (
          <>
            {status === "active" && (
              <>
                <button
                  type="button"
                  onClick={() => setModalAction("suspend")}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Suspend
                </button>
                <button
                  type="button"
                  onClick={() => setModalAction("ban")}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Ban className="w-3.5 h-3.5" />
                  Ban User
                </button>
              </>
            )}

            {status === "suspended" && (
              <>
                <button
                  type="button"
                  onClick={() => setModalAction("restore")}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Restore Account
                </button>
                <button
                  type="button"
                  onClick={() => setModalAction("ban")}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Ban className="w-3.5 h-3.5" />
                  Ban User
                </button>
              </>
            )}

            {status === "banned" && (
              <button
                type="button"
                onClick={() => setModalAction("restore")}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Unban / Restore
              </button>
            )}
          </>
        )}

        <Link
          href={`/${username}`}
          target="_blank"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          View Profile
        </Link>
      </div>

      <UserActionModal
        open={modalAction !== null}
        action={modalAction}
        userId={userId}
        userName={username}
        onClose={() => setModalAction(null)}
      />
    </>
  );
}
