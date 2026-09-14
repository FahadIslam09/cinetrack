"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, X } from "lucide-react";
import { updateFeatureRequest } from "@/actions/admin";
import { CustomDropdown, type DropdownOption } from "@/components/ui/custom-dropdown";

const STATUS_OPTIONS: DropdownOption[] = [
  { id: "new", label: "New", dot: "bg-blue-500" },
  { id: "under_review", label: "Under Review", dot: "bg-amber-500" },
  { id: "planned", label: "Planned", dot: "bg-violet-500" },
  { id: "in_progress", label: "In Progress", dot: "bg-sky-500" },
  { id: "completed", label: "Completed", dot: "bg-emerald-500" },
  { id: "declined", label: "Declined", dot: "bg-slate-400" },
];

const PRIORITY_OPTIONS: DropdownOption[] = [
  { id: "low", label: "Low", dot: "bg-slate-400" },
  { id: "medium", label: "Medium", dot: "bg-amber-500" },
  { id: "high", label: "High", dot: "bg-rose-500" },
];

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
          <div className="relative w-full max-w-md rounded-2xl bg-white border border-slate-200/90 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <h3 className="text-base font-semibold text-slate-900">Update request</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 mt-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Status</label>
                <CustomDropdown
                  variant="light"
                  value={sStatus}
                  onChange={setStatus}
                  options={STATUS_OPTIONS}
                  menuWidth="w-full"
                  buttonClassName="h-10 text-sm font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Priority</label>
                <CustomDropdown
                  variant="light"
                  value={sPriority}
                  onChange={setPriority}
                  options={PRIORITY_OPTIONS}
                  menuWidth="w-full"
                  buttonClassName="h-10 text-sm font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Internal notes</label>
                <textarea
                  value={sNotes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="Notes visible only to admins…"
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none font-sans"
                />
              </div>

              {error && <p className="text-xs text-rose-600">{error}</p>}
            </div>

            <div className="flex items-center justify-end gap-2.5 mt-6 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={save}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-white transition-colors cursor-pointer disabled:opacity-60 shadow-sm"
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
