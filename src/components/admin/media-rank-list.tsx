import Link from "next/link";
import { Film } from "lucide-react";

export interface MediaRankItem {
  id: string;
  title: string;
  posterPath: string | null;
  mediaType: string;
  count: number;
}

export function MediaRankList({ items }: { items: MediaRankItem[] }) {
  if (items.length === 0) return null;
  const max = Math.max(1, ...items.map((i) => i.count));

  return (
    <ul className="space-y-2.5">
      {items.map((item, idx) => (
        <li key={item.id} className="flex items-center gap-3">
          <span className="w-5 text-xs font-semibold text-slate-400 text-right shrink-0">
            {idx + 1}
          </span>
          <div className="w-9 h-12 rounded-md overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
            {item.posterPath ? (
              <img
                src={item.posterPath}
                alt={item.title}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300">
                <Film className="w-4 h-4" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <Link
              href={`/${item.mediaType}/${item.id.split(":").pop()}`}
              className="text-sm font-medium text-slate-800 hover:text-blue-600 transition-colors truncate block"
            >
              {item.title}
            </Link>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] uppercase tracking-wide text-slate-400">
                {item.mediaType}
              </span>
              <div className="flex-1 h-1 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-500"
                  style={{ width: `${(item.count / max) * 100}%` }}
                />
              </div>
            </div>
          </div>
          <span className="text-sm font-semibold text-slate-700 shrink-0">
            {item.count}
          </span>
        </li>
      ))}
    </ul>
  );
}
