import { motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { cn } from "../../lib/utils";

type Square = { id: number; x: number; y: number };

/** Grid of hairlines where random cells softly light up and fade. */
export function AnimatedGridPattern({
  size = 48,
  numSquares = 14,
  maxOpacity = 0.14,
  duration = 3,
  className,
}: {
  size?: number;
  numSquares?: number;
  maxOpacity?: number;
  duration?: number;
  className?: string;
}) {
  const id = useId();
  const ref = useRef<SVGSVGElement>(null);
  const reduce = useReducedMotion();
  const [dims, setDims] = useState({ w: 0, h: 0 });

  const randomSquare = useCallback(
    (sqId: number): Square => ({
      id: sqId,
      x: Math.floor((Math.random() * dims.w) / size),
      y: Math.floor((Math.random() * dims.h) / size),
    }),
    [dims, size],
  );

  const [squares, setSquares] = useState<Square[]>([]);

  useEffect(() => {
    if (dims.w && dims.h) {
      setSquares(Array.from({ length: numSquares }, (_, i) => randomSquare(i)));
    }
  }, [dims, numSquares, randomSquare]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) =>
      setDims({ w: entry.contentRect.width, h: entry.contentRect.height }),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const respawn = (sqId: number) =>
    setSquares((prev) => prev.map((s) => (s.id === sqId ? randomSquare(sqId) : s)));

  return (
    <svg
      ref={ref}
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
    >
      <defs>
        <pattern id={id} width={size} height={size} patternUnits="userSpaceOnUse">
          <path
            d={`M.5 ${size}V.5H${size}`}
            fill="none"
            stroke="var(--grid-line)"
            strokeWidth="1"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
      {!reduce &&
        squares.map((sq, i) => (
          <motion.rect
            key={`${sq.id}-${sq.x}-${sq.y}`}
            width={size - 1}
            height={size - 1}
            x={sq.x * size + 1}
            y={sq.y * size + 1}
            fill="var(--accent)"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, maxOpacity, 0] }}
            transition={{ duration, delay: (i % numSquares) * 0.25, ease: "easeInOut" }}
            onAnimationComplete={() => respawn(sq.id)}
          />
        ))}
    </svg>
  );
}
