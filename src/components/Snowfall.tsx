import type { CSSProperties } from "react";

/**
 * Slow, sparse snowfall behind a screen (all participant screens in the
 * mockups). Pure CSS; flakes rest as static dots with reduced motion.
 * Positions come from a fixed table, so server and client render the same.
 */
const FLAKES: Array<{ left: number; size: number; duration: number; delay: number; drift: number; restY: number }> = [
  { left: 4, size: 6, duration: 19, delay: -2, drift: 14, restY: 8 },
  { left: 12, size: 4, duration: 23, delay: -11, drift: -10, restY: 38 },
  { left: 19, size: 5, duration: 17, delay: -6, drift: 8, restY: 72 },
  { left: 27, size: 3, duration: 25, delay: -17, drift: 12, restY: 18 },
  { left: 34, size: 5, duration: 21, delay: -3, drift: -14, restY: 55 },
  { left: 41, size: 4, duration: 18, delay: -13, drift: 10, restY: 88 },
  { left: 48, size: 6, duration: 24, delay: -8, drift: -8, restY: 30 },
  { left: 55, size: 3, duration: 20, delay: -15, drift: 16, restY: 64 },
  { left: 62, size: 5, duration: 22, delay: -1, drift: -12, restY: 12 },
  { left: 69, size: 4, duration: 19, delay: -9, drift: 9, restY: 46 },
  { left: 76, size: 6, duration: 26, delay: -19, drift: -16, restY: 80 },
  { left: 83, size: 3, duration: 18, delay: -5, drift: 11, restY: 24 },
  { left: 89, size: 5, duration: 23, delay: -12, drift: -9, restY: 60 },
  { left: 95, size: 4, duration: 21, delay: -7, drift: 13, restY: 94 },
  { left: 8, size: 3, duration: 27, delay: -21, drift: 7, restY: 50 },
  { left: 51, size: 4, duration: 28, delay: -24, drift: -11, restY: 4 },
  { left: 73, size: 3, duration: 26, delay: -14, drift: 10, restY: 34 },
  { left: 30, size: 4, duration: 29, delay: -26, drift: -7, restY: 92 },
];

export function Snowfall({ tone }: { tone: "light" | "dark" }) {
  const color = tone === "dark" ? "rgb(255 255 255 / 0.32)" : "rgb(200 213 205 / 0.7)";

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
      {FLAKES.map((f, i) => (
        <span
          key={i}
          className="snowflake"
          style={
            {
              left: `${f.left}%`,
              width: f.size,
              height: f.size,
              background: color,
              "--duration": `${f.duration}s`,
              "--delay": `${f.delay}s`,
              "--drift": `${f.drift}px`,
              "--rest-y": `${f.restY}vh`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
