import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/** Fades content in from a soft blur as it enters the viewport. */
export function BlurFade({
  children,
  delay = 0,
  y = 10,
  className,
  inView = true,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  /** When false, animates on mount instead of on scroll. */
  inView?: boolean;
}) {
  const reduce = useReducedMotion();
  const hidden = reduce
    ? { opacity: 1 }
    : { opacity: 0, y, filter: "blur(8px)" };
  const visible = { opacity: 1, y: 0, filter: "blur(0px)" };
  const transition = { duration: 0.7, delay, ease: [0.2, 0.7, 0.2, 1] as const };

  return inView ? (
    <motion.div
      className={className}
      initial={hidden}
      whileInView={visible}
      viewport={{ once: true, margin: "-40px" }}
      transition={transition}
    >
      {children}
    </motion.div>
  ) : (
    <motion.div
      className={className}
      initial={hidden}
      animate={visible}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}
