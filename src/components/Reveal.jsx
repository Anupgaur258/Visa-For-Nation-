import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
// Reveal once on entry so sections animate smoothly without flickering on scroll.
// from: 'up' | 'left' | 'right' | 'zoom'
const START = { up: { y: 36 }, left: { x: -80 }, right: { x: 80 }, zoom: { scale: 0.92 } };
export default function Reveal({ children, delay = 0, as = 'div', from = 'up', className = '', ...rest }) {
  const Tag = useMemo(() => (typeof as === 'string' ? motion[as] : motion.create(as)), [as]);
  const shouldReduceMotion = useReducedMotion();
  const start = START[from] || START.up;
  return (
    <Tag className={className} initial={shouldReduceMotion ? false : { opacity: 0, x: start.x || 0, y: start.y || 0, scale: start.scale || 1 }} whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.12 }} transition={{ duration: shouldReduceMotion ? 0 : 0.65, delay: shouldReduceMotion ? 0 : delay / 1000, ease: [0.2, 0.7, 0.2, 1] }}
      {...rest}>{children}</Tag>
  );
}
