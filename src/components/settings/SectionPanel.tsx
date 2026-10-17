import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

/** How an open section comes in: forms slide in from the side; the lighter panels (shifts, summary, appearance, backup) rise a little. */
const entrance = {
  slide: { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, transition: { ease: EASE_OUT } },
  rise: { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } },
};

export default function SectionPanel({ variant, className, children }: {
  variant: keyof typeof entrance;
  className?: string;
  children: ReactNode;
}) {
  return <motion.div {...entrance[variant]} className={className}>{children}</motion.div>;
}
