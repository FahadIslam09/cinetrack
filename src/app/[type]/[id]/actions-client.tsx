"use client";

import { useState } from "react";
import { Plus, Star, Check } from "lucide-react";
import { NormalizedMedia } from "@/lib/media/normalize";
import { QuickAddModal } from "@/components/quick-add/quick-add-modal";

interface MediaDetailsActionsProps {
  media: NormalizedMedia;
  initialLog?: any;
}

export function MediaDetailsActions({
  media,
  initialLog,
}: MediaDetailsActionsProps) {
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [log, setLog] = useState(initialLog);

  return (
    <>
      <div className="flex items-center gap-2 pt-2 max-w-md">
        <button
          type="button"
          onClick={() => setIsQuickAddOpen(true)}
          className="flex-1 h-11 bg-[#3B9EFF] text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-2 shadow-md hover:bg-[#5AAFFF] active:scale-95 transition-all"
        >
          {log?.status ? (
            <>
              <Check className="w-4 h-4 text-white" />
              <span className="capitalize">{log.status.replace("_", " ")}</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>Add to Library</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => setIsQuickAddOpen(true)}
          className="h-11 px-5 bg-[#1A2330] text-[#F5F7FA] rounded-lg font-semibold text-sm flex items-center justify-center gap-1.5 hover:bg-[#1D2734] border border-white/[0.08] active:scale-95 transition-all"
        >
          <Star className="w-4 h-4 text-[#F5C84B]" />
          <span>{log?.rating ? `${log.rating}★` : "Rate"}</span>
        </button>
      </div>

      <QuickAddModal
        media={media}
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        initialLog={log}
        onSuccess={() => {
          // Window reload or revalidate
          window.location.reload();
        }}
      />
    </>
  );
}
