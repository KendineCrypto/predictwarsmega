"use client";

// ── Internal viewBox dimensions ─────────────────────────────────────────────
// SVG uses width="100%" so it scales to any container.
// All coordinate math uses these constants.
const VW     = 600;  // viewBox width
const MIN_PX_RANGE = 2.0; // at least $2 visible range (prevents micro-zoom)

interface SparklineProps {
  data:          number[];
  height?:       number;   // viewBox + CSS height (px), default 200
  upColor?:      string;
  downColor?:    string;
  entryPrice?:   number;   // when set: draw a dashed horizontal lock line
}

// Smooth cubic-bezier path through equidistant data points
function smoothPath(pts: [number, number][]): string {
  if (pts.length < 2) return "";
  let d = `M ${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    const p0  = pts[i - 1];
    const p1  = pts[i];
    const cpx = ((p0[0] + p1[0]) / 2).toFixed(1);
    d += ` C ${cpx},${p0[1].toFixed(1)} ${cpx},${p1[1].toFixed(1)} ${p1[0].toFixed(1)},${p1[1].toFixed(1)}`;
  }
  return d;
}

function fmt2(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function Sparkline({
  data,
  height    = 200,
  upColor   = "#90D79F",
  downColor = "#F5949D",
  entryPrice,
}: SparklineProps) {
  if (!data || data.length < 2) {
    return (
      <div className="w-full flex items-center justify-center" style={{ height }}>
        <span className="text-mega-muted/30 font-mono text-xs animate-pulse">Fetching live data…</span>
      </div>
    );
  }

  // ── Price range ──────────────────────────────────────────────────────────
  let dataMin = Math.min(...data);
  let dataMax = Math.max(...data);
  // Always include entryPrice in the visible range
  if (entryPrice !== undefined && entryPrice > 0) {
    dataMin = Math.min(dataMin, entryPrice);
    dataMax = Math.max(dataMax, entryPrice);
  }

  // Enforce minimum visible range
  const center   = (dataMin + dataMax) / 2;
  const halfRange = Math.max((dataMax - dataMin) / 2, MIN_PX_RANGE / 2);
  // Extra 10% padding so the line never kisses the top/bottom edge
  const visMin = center - halfRange * 1.1;
  const visMax = center + halfRange * 1.1;
  const range  = visMax - visMin;

  const pad = 8; // px padding top & bottom inside viewBox
  const toY = (v: number) =>
    height - pad - ((v - visMin) / range) * (height - pad * 2);

  // ── Data → SVG points ────────────────────────────────────────────────────
  const pts: [number, number][] = data.map((v, i) => [
    (i / (data.length - 1)) * VW,
    toY(v),
  ]);

  const lastPt = pts[pts.length - 1];
  const isUp   = data[data.length - 1] >= data[0];
  const color  = isUp ? upColor : downColor;

  const gradLine = "sg_line";
  const gradFill = "sg_fill";

  // ── Entry price ──────────────────────────────────────────────────────────
  const yEntry = entryPrice !== undefined && entryPrice > 0 ? toY(entryPrice) : null;
  const entryAboveCurrent = entryPrice !== undefined && entryPrice > data[data.length - 1];

  return (
    <svg
      viewBox={`0 0 ${VW} ${height}`}
      width="100%"
      height={height}
      preserveAspectRatio="none"
      style={{ display: "block", overflow: "visible" }}
    >
      <defs>
        {/* Line gradient: fades in from left */}
        <linearGradient id={gradLine} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor={color} stopOpacity="0.1" />
          <stop offset="20%"  stopColor={color} stopOpacity="0.7" />
          <stop offset="100%" stopColor={color} stopOpacity="1"   />
        </linearGradient>
        {/* Area fill gradient: top→transparent */}
        <linearGradient id={gradFill} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity="0.35" />
          <stop offset="60%"  stopColor={color} stopOpacity="0.07" />
          <stop offset="100%" stopColor={color} stopOpacity="0"    />
        </linearGradient>
      </defs>

      {/* Subtle horizontal grid dashes */}
      {[0.2, 0.4, 0.6, 0.8].map((f) => (
        <line
          key={f}
          x1="0"  y1={height * f}
          x2={VW} y2={height * f}
          stroke="rgba(255,255,255,0.025)"
          strokeWidth="1"
          strokeDasharray="4 14"
        />
      ))}

      {/* Area fill */}
      <path
        d={`${smoothPath(pts)} L ${VW},${height} L 0,${height} Z`}
        fill={`url(#${gradFill})`}
      />

      {/* Price line */}
      <path
        d={smoothPath(pts)}
        fill="none"
        stroke={`url(#${gradLine})`}
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* ── Entry price lock line ─────────────────────────────────────────── */}
      {yEntry !== null && entryPrice !== undefined && (
        <>
          {/* Dashed line across full width */}
          <line
            x1="0"  y1={yEntry}
            x2={VW} y2={yEntry}
            stroke="#F5AF94"
            strokeWidth="1.5"
            strokeDasharray="9 6"
            opacity="0.85"
          />

          {/* Pin triangle on the left */}
          <polygon
            points={`0,${yEntry - 6} 14,${yEntry} 0,${yEntry + 6}`}
            fill="#F5AF94"
            opacity="0.9"
          />

          {/* Price label on the right */}
          <rect
            x={VW - 126}
            y={yEntry - 13}
            width={122}
            height={18}
            rx="4"
            fill="#19191A"
            opacity="0.75"
          />
          <text
            x={VW - 8}
            y={yEntry + 5}
            textAnchor="end"
            fill="#F5AF94"
            fontSize="12"
            fontFamily="monospace"
            fontWeight="700"
            opacity="0.95"
          >
            ENTRY ${fmt2(entryPrice)}
          </text>

          {/* Small dot where entry price meets right edge */}
          <circle
            cx={VW}
            cy={yEntry}
            r="4"
            fill="#F5AF94"
            opacity="0.9"
          />

          {/* Delta label: current vs entry (top-left badge) */}
          {data.length > 0 && (() => {
            const diff   = data[data.length - 1] - entryPrice;
            const sign   = diff >= 0 ? "+" : "";
            const clr    = diff >= 0 ? "#90D79F" : "#F5949D";
            return (
              <g>
                <rect x="8" y="8" width="110" height="20" rx="4" fill="#19191A" opacity="0.7" />
                <text
                  x="14"
                  y="22"
                  fill={clr}
                  fontSize="12"
                  fontFamily="monospace"
                  fontWeight="700"
                >
                  {sign}{fmt2(diff)} from entry
                </text>
              </g>
            );
          })()}
        </>
      )}

      {/* Live dot at last price ──────────────────────────────────────────── */}
      {/* Outer pulsing ring */}
      <circle cx={lastPt[0]} cy={lastPt[1]} r="6" fill={color} opacity="0.15">
        <animate attributeName="r"       values="6;14;6"     dur="2.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.15;0;0.15" dur="2.5s" repeatCount="indefinite" />
      </circle>
      {/* Inner solid dot */}
      <circle cx={lastPt[0]} cy={lastPt[1]} r="4"   fill={color} />
      <circle cx={lastPt[0]} cy={lastPt[1]} r="1.8" fill="white" opacity="0.9" />

      {/* Current price label next to live dot (shown only when no entry line) */}
      {yEntry === null && data.length > 0 && (
        <text
          x={lastPt[0] + 10}
          y={lastPt[1] + 5}
          fill={color}
          fontSize="11"
          fontFamily="monospace"
          fontWeight="700"
          opacity="0.8"
        >
          ${fmt2(data[data.length - 1])}
        </text>
      )}
    </svg>
  );
}
