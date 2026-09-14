export interface DistributionItem {
  label: string;
  value: number;
  color: string; // tailwind bg class e.g. "bg-blue-500"
}

export function DistributionBars({ items }: { items: DistributionItem[] }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  const total = items.reduce((s, i) => s + i.value, 0);

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.label}>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-medium text-slate-600">{item.label}</span>
            <span className="text-slate-500">
              {item.value}
              {total > 0 && (
                <span className="text-slate-400">
                  {" "}
                  · {Math.round((item.value / total) * 100)}%
                </span>
              )}
            </span>
          </div>
          <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full rounded-full ${item.color}`}
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
