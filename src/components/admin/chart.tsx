"use client";

import { useRef, useState, useEffect, useCallback } from "react";

export interface ChartPoint {
  label: string;
  value: number;
}

interface ChartProps {
  data: ChartPoint[];
  type?: "line" | "area" | "bar";
  color?: string;
  height?: number;
  formatValue?: (v: number) => string;
}

const PAD = { top: 14, right: 12, bottom: 26, left: 34 };

export function Chart({
  data,
  type = "line",
  color = "#2563EB",
  height = 220,
  formatValue = (v) => String(v),
}: ChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => setWidth(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const innerW = Math.max(0, width - PAD.left - PAD.right);
  const innerH = height - PAD.top - PAD.bottom;

  const max = Math.max(1, ...data.map((d) => d.value));
  const niceMax = niceCeil(max);

  const xFor = useCallback(
    (i: number) =>
      data.length <= 1
        ? PAD.left + innerW / 2
        : PAD.left + (i / (data.length - 1)) * innerW,
    [data.length, innerW]
  );

  const yFor = (v: number) =>
    PAD.top + innerH - (v / niceMax) * innerH;

  const onMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect || data.length === 0) return;
    const x = e.clientX - rect.left;
    const rel = Math.min(1, Math.max(0, (x - PAD.left) / innerW));
    const idx = Math.round(rel * (data.length - 1));
    setHover(idx);
  };

  const linePath = data
    .map((d, i) => `${i === 0 ? "M" : "L"} ${xFor(i)} ${yFor(d.value)}`)
    .join(" ");

  const areaPath =
    data.length > 0
      ? `${linePath} L ${xFor(data.length - 1)} ${PAD.top + innerH} L ${xFor(
          0
        )} ${PAD.top + innerH} Z`
      : "";

  const yTicks = Array.from(
    new Set(
      niceMax <= 3
        ? Array.from({ length: niceMax + 1 }, (_, i) => i)
        : Array.from({ length: 4 }, (_, i) => Math.round((niceMax / 3) * i))
    )
  );

  const barWidth = data.length > 0 ? Math.min(36, (innerW / data.length) * 0.6) : 0;

  const hoverPoint = hover !== null ? data[hover] : null;

  return (
    <div
      ref={containerRef}
      className="relative w-full select-none"
      style={{ height }}
      onMouseMove={onMove}
      onMouseLeave={() => setHover(null)}
    >
      <svg width="100%" height={height} className="block">
        {/* gridlines + y labels */}
        {yTicks.map((t, idx) => (
          <g key={`ytick-${t}-${idx}`}>
            <line
              x1={PAD.left}
              x2={PAD.left + innerW}
              y1={yFor(t)}
              y2={yFor(t)}
              stroke="#EEF2F7"
              strokeWidth={1}
            />
            <text
              x={PAD.left - 8}
              y={yFor(t) + 3.5}
              textAnchor="end"
              fontSize={10}
              fill="#94A3B8"
            >
              {t}
            </text>
          </g>
        ))}

        {/* x labels (up to 6) */}
        {data.map((d, i) => {
          const step = Math.max(1, Math.ceil(data.length / 6));
          if (i % step !== 0 && i !== data.length - 1) return null;
          return (
            <text
              key={i}
              x={xFor(i)}
              y={height - 8}
              textAnchor="middle"
              fontSize={10}
              fill="#94A3B8"
            >
              {d.label}
            </text>
          );
        })}

        {type === "bar" ? (
          data.map((d, i) => (
            <rect
              key={i}
              x={xFor(i) - barWidth / 2}
              y={yFor(d.value)}
              width={barWidth}
              height={Math.max(0, PAD.top + innerH - yFor(d.value))}
              rx={3}
              fill={hover === i ? color : color}
              opacity={hover === i ? 1 : 0.75}
            />
          ))
        ) : (
          <>
            {type === "area" && <path d={areaPath} fill={color} opacity={0.1} />}
            <path
              d={linePath}
              fill="none"
              stroke={color}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {data.map((d, i) => (
              <circle
                key={i}
                cx={xFor(i)}
                cy={yFor(d.value)}
                r={hover === i ? 4 : 2.5}
                fill="#fff"
                stroke={color}
                strokeWidth={2}
              />
            ))}
          </>
        )}

        {/* hover crosshair */}
        {hover !== null && hoverPoint && (
          <line
            x1={xFor(hover)}
            x2={xFor(hover)}
            y1={PAD.top}
            y2={PAD.top + innerH}
            stroke="#CBD5E1"
            strokeDasharray="3 3"
            strokeWidth={1}
          />
        )}
      </svg>

      {hover !== null && hoverPoint && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 shadow-sm"
          style={{
            left: xFor(hover),
            top: Math.max(0, yFor(hoverPoint.value) - 46),
          }}
        >
          <div className="text-[10px] font-medium text-slate-400 whitespace-nowrap">
            {hoverPoint.label}
          </div>
          <div className="text-sm font-bold text-slate-900">
            {formatValue(hoverPoint.value)}
          </div>
        </div>
      )}
    </div>
  );
}

function niceCeil(v: number) {
  if (v <= 0) return 1;
  const exp = Math.floor(Math.log10(v));
  const base = Math.pow(10, exp);
  const frac = v / base;
  const niceFrac = frac <= 1 ? 1 : frac <= 2 ? 2 : frac <= 5 ? 5 : 10;
  return niceFrac * base;
}
