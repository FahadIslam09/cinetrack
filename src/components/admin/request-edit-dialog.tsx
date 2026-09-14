"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil } from "lucide-react";
import { updateFeatureRequest } from "@/actions/admin";

export function RequestEditDialog({
  id,
  status,
  priority,
  adminNotes,
}: {
  id: string;
  status: string;
  priority: string;
  adminNotes: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [sStatus, setStatus] = useState(status);
  const [sPriority, setPriority] = useState(priority);
  const [sNotes, setNotes] = useState(adminNotes || "");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const save = () => {
    startTransition(async () => {
      setError(null);
      const res = await updateFeatureRequest({
        id,
        status: sStatus,
        priority: sPriority,
        adminNotes: sNotes,
      });
      if (res && "error" in res && res.error) {
        setError(res.error);
      } else {
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
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
      >
        <Pencil className="w-3.5 h-3.5" />
        Edit
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-md rounded-xl bg-white border border-slate-200 shadow-xl p-5 max-h-[90vh] overflow-y-auto">
            <h3 className="text-sm font-semibold text-slate-900">Update request</h3>

            <div className="space-y-4 mt-4">
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1.5">Status</label>
                <select
                  value={sStatus}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm text-slate-700 focus:outline-none focus:border-blue-400 cursor-pointer"
                >
                  {[
                    ["new", "New"],
                    ["under_review", "Under Review"],
                    ["planned", "Planned"],
                    ["in_progress", "In Progress"],
                    ["completed", "Completed"],
                    ["declined", "Declined"],
                  ].map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1.5">Priority</label>
                <select
                  value={sPriority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm text-slate-700 focus:outline-none focus:border-blue-400 cursor-pointer"
                >
                  {[
                    ["low", "Low"],
                    ["medium", "Medium"],
                    ["high", "High"],
                  ].map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1.5">Internal notes</label>
                <textarea
                  value={sNotes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="Notes visible only to admins…"
                  className="w-full p-3 rounded-lg border border-slate-200 text-sm text-slate-700 focus:outline-none focus:border-blue-400 resize-none"
                />
              </div>

              {error && <p className="text-xs text-rose-600">{error}</p>}
            </div>

            <div className="flex items-center justify-end gap-2 mt-5">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={save}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-white transition-colors cursor-pointer disabled:opacity-60"
              >
                {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
