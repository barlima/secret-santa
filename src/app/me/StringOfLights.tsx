/**
 * Waiting-room string of lights (Waiting.dc.html): one bulb per person up to
 * MAX_BULBS, lit in proportion to how many have joined. Pure SVG, no state.
 */
const WIDTH = 358;
const HEIGHT = 64;
const MIN_BULBS = 6;
const MAX_BULBS = 12;
const DROP = 13; // bulb centre hangs this far below the wire
const COLORS = ["var(--color-bulb-red)", "var(--color-gold)", "var(--color-pine-light)"];

/** The wire is two quadratic swags: y = 10 + 100·t·(1 − t) across each half. */
function wireY(x: number): number {
  const half = WIDTH / 2;
  const t = (x % half) / half;
  return 10 + 100 * t * (1 - t);
}

export function StringOfLights({ joined, total, label }: { joined: number; total: number; label: string }) {
  const count = Math.min(MAX_BULBS, Math.max(MIN_BULBS, total));
  let lit = total > 0 ? Math.round((joined / total) * count) : 0;
  if (joined > 0) lit = Math.max(lit, 1);
  if (joined < total) lit = Math.min(lit, count - 1);

  const bulbs = Array.from({ length: count }, (_, i) => {
    const x = (WIDTH * (i + 0.5)) / count;
    return { x, y: wireY(x) + DROP, on: i < lit, color: COLORS[i % COLORS.length] };
  });

  return (
    <svg
      role="img"
      aria-label={label}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="block h-auto w-full"
    >
      <path
        d={`M0 10 Q ${WIDTH / 4} 60 ${WIDTH / 2} 10 Q ${(WIDTH * 3) / 4} 60 ${WIDTH} 10`}
        fill="none"
        stroke="var(--color-wire)"
        strokeWidth={2}
      />
      {bulbs.map((b, i) =>
        b.on ? (
          <g key={i}>
            <circle cx={b.x} cy={b.y} r={14} fill={b.color} opacity={0.3} className="bulb-glow" style={{ animationDelay: `${(i % 4) * 0.6}s` }} />
            <rect x={b.x - 3} y={b.y - 13} width={6} height={5} rx={1} fill="var(--color-socket)" />
            <ellipse cx={b.x} cy={b.y} rx={6} ry={9} fill={b.color} />
          </g>
        ) : (
          <g key={i}>
            <rect x={b.x - 3} y={b.y - 13} width={6} height={5} rx={1} fill="var(--color-socket-off)" />
            <ellipse
              cx={b.x}
              cy={b.y}
              rx={6}
              ry={9}
              fill="var(--color-bulb-off)"
              stroke="var(--color-socket-off)"
              strokeWidth={1.5}
            />
          </g>
        ),
      )}
    </svg>
  );
}
