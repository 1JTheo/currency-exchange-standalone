import { useEffect, useMemo, useRef, useState } from "react";
import { fetchHistory, HistoryPoint, Range } from "../lib/api";
import { formatDate, formatRate } from "../lib/currencies";

const RANGES: Range[] = ["7D", "1M", "3M", "1Y"];
const W = 640;
const H = 220;
const PAD = { top: 16, right: 8, bottom: 24, left: 8 };

export default function RateChart({ from, to }: { from: string; to: string }) {
  const [range, setRange] = useState<Range>("1M");
  const [points, setPoints] = useState<HistoryPoint[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [hover, setHover] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    setHover(null);
    fetchHistory(from, to, range)
      .then((p) => {
        if (cancelled) return;
        setPoints(p);
        setStatus(p.length > 1 ? "ready" : "error");
      })
      .catch(() => !cancelled && setStatus("error"));
    return () => {
      cancelled = true;
    };
  }, [from, to, range]);

  const geo = useMemo(() => {
    if (points.length < 2) return null;
    const rates = points.map((p) => p.rate);
    let min = Math.min(...rates);
    let max = Math.max(...rates);
    if (min === max) {
      min *= 0.995;
      max *= 1.005;
    }
    const pad = (max - min) * 0.12;
    min -= pad;
    max += pad;
    const x = (i: number) => PAD.left + (i / (points.length - 1)) * (W - PAD.left - PAD.right);
    const y = (v: number) => PAD.top + (1 - (v - min) / (max - min)) * (H - PAD.top - PAD.bottom);
    const xy = points.map((p, i) => [x(i), y(p.rate)] as const);
    const line = xy.map(([a, b], i) => `${i ? "L" : "M"}${a.toFixed(1)},${b.toFixed(1)}`).join(" ");
    const area = `${line} L${xy[xy.length - 1][0].toFixed(1)},${H - PAD.bottom} L${xy[0][0].toFixed(1)},${H - PAD.bottom} Z`;
    return { xy, line, area };
  }, [points]);

  const first = points[0]?.rate;
  const last = points[points.length - 1]?.rate;
  const change = first && last ? ((last - first) / first) * 100 : 0;
  const up = change >= 0;
  const shown = hover !== null ? points[hover] : points[points.length - 1];

  const onMove = (e: React.PointerEvent) => {
    if (!geo || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    let best = 0;
    geo.xy.forEach(([x], i) => {
      if (Math.abs(x - px) < Math.abs(geo.xy[best][0] - px)) best = i;
    });
    setHover(best);
  };

  return (
    <section className="card p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <p className="eyebrow mb-1">
            {from} → {to}
          </p>
          {status === "ready" && shown ? (
            <>
              <p className="font-display text-3xl leading-none tabular-nums">{formatRate(shown.rate)}</p>
              <p className="text-sm text-muted mt-1.5">
                {formatDate(shown.date)}
                {hover === null && (
                  <span className={`ml-2 font-semibold ${up ? "text-up" : "text-down"}`}>
                    {up ? "▲" : "▼"} {Math.abs(change).toFixed(2)}% · {range}
                  </span>
                )}
              </p>
            </>
          ) : (
            <div className="h-[58px] w-40 rounded-lg skeleton" />
          )}
        </div>
        <div className="flex gap-1 p-1 rounded-full bg-ink/[0.05]" role="tablist">
          {RANGES.map((r) => (
            <button
              key={r}
              role="tab"
              aria-selected={range === r}
              onClick={() => setRange(r)}
              className={`px-3 h-8 rounded-full text-sm font-semibold transition-colors ${
                range === r ? "bg-card shadow-sm text-ink" : "text-muted hover:text-ink"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        {status === "loading" && <div className="absolute inset-0 rounded-2xl skeleton" />}
        {status === "error" && (
          <div className="h-[220px] grid place-items-center text-center text-sm text-muted">
            History isn’t available for this pair right now.
          </div>
        )}
        {status !== "error" && (
          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            className={`w-full h-auto touch-none select-none transition-opacity ${status === "loading" ? "opacity-0" : "opacity-100"}`}
            onPointerMove={onMove}
            onPointerLeave={() => setHover(null)}
          >
            <defs>
              <linearGradient id="fill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="rgb(var(--accent))" stopOpacity="0.22" />
                <stop offset="100%" stopColor="rgb(var(--accent))" stopOpacity="0" />
              </linearGradient>
            </defs>
            {geo && (
              <>
                <path d={geo.area} fill="url(#fill)" />
                <path d={geo.line} fill="none" stroke="rgb(var(--accent))" strokeWidth="2.25" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                {hover !== null && (
                  <>
                    <line x1={geo.xy[hover][0]} x2={geo.xy[hover][0]} y1={PAD.top} y2={H - PAD.bottom} stroke="rgb(var(--ink))" strokeOpacity="0.2" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
                    <circle cx={geo.xy[hover][0]} cy={geo.xy[hover][1]} r="5" fill="rgb(var(--card))" stroke="rgb(var(--accent))" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
                  </>
                )}
                <text x={PAD.left} y={H - 4} className="fill-muted" fontSize="12">
                  {formatDate(points[0].date, { day: "numeric", month: "short" })}
                </text>
                <text x={W - PAD.right} y={H - 4} textAnchor="end" className="fill-muted" fontSize="12">
                  {formatDate(points[points.length - 1].date, { day: "numeric", month: "short" })}
                </text>
              </>
            )}
          </svg>
        )}
      </div>
    </section>
  );
}
