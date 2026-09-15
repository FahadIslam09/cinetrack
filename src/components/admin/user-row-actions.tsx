"use client";

import { useState } from "react";
import { AlertTriangle, Ban, CheckCircle2 } from "lucide-react";
import { UserActionModal, type UserAdminAction } from "./user-action-modal";

interface UserRowActionsProps {
  userId: string;
  username: string;
  role: string;
  status: "active" | "suspended" | "banned";
  isCurrentAdmin?: boolean;
}

export function UserRowActions({
  userId,
  username,
  role,
  status,
  isCurrentAdmin,
}: UserRowActionsProps) {
  const [action, setAction] = useState<UserAdminAction | null>(null);

  if (role === "admin" || isCurrentAdmin) {
    return <span className="text-[11px] text-slate-400 font-medium italic">Protected</span>;
  }

  return (
    <>
      <div className="flex items-center gap-1.5 justify-end" onClick={(e) => e.stopPropagation()}>
        {status === "active" && (
          <>
            <button
              type="button"
              title="Suspend User"
              onClick={() => setAction("suspend")}
              className="p-1.5 rounded-md text-amber-600 hover:bg-amber-50 border border-transparent hover:border-amber-200 transition-colors cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              title="Ban User"
              onClick={() => setAction("ban")}
              className="p-1.5 rounded-md text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
            >
              <Ban className="w-3.5 h-3.5" />
            </button>
          </>
        )}

        {status === "suspended" && (
          <>
            <button
              type="button"
              title="Restore Account"
              onClick={() => setAction("restore")}
              className="p-1.5 rounded-md text-emerald-600 hover:bg-emerald-50 border border-transparent hover:border-emerald-200 transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              title="Ban User"
              onClick={() => setAction("ban")}
              className="p-1.5 rounded-md text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
            >
              <Ban className="w-3.5 h-3.5" />
            </button>
          </>
        )}

        {status === "banned" && (
          <button
            type="button"
            title="Unban / Restore Account"
            onClick={() => setAction("restore")}
            className="p-1.5 rounded-md text-emerald-600 hover:bg-emerald-50 border border-transparent hover:border-emerald-200 transition-colors cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <UserActionModal
        open={action !== null}
        action={action}
        userId={userId}
        userName={username}
        onClose={() => setAction(null)}
      />
    </>
  );
}
