"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Ban, CheckCircle2 } from "lucide-react";
import { ConfirmDialog } from "./confirm-dialog";
import { setUserSuspended } from "@/actions/admin";

export function SuspendButton({
  userId,
  suspended,
}: {
  userId: string;
  suspended: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const confirm = () => {
    startTransition(async () => {
      const res = await setUserSuspended(userId, !suspended);
      if (res && "success" in res) {
        setOpen(false);
        router.refresh();
      }
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
          suspended
            ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            : "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
        }`}
      >
        {suspended ? <CheckCircle2 className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
        {suspended ? "Unsuspend" : "Suspend"}
      </button>

      <ConfirmDialog
        open={open}
        title={suspended ? "Unsuspend account" : "Suspend account"}
        description={
          suspended
            ? "This will restore the user's access to CineTrack."
            : "The user will be unable to sign in or interact until unsuspended. This can be reversed."
        }
        confirmLabel={suspended ? "Unsuspend" : "Suspend"}
        destructive={!suspended}
        loading={isPending}
        onConfirm={confirm}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
