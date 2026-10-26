import { useMemo } from 'react';
import { motion } from 'framer-motion';
// Scroll animation that replays every time the block enters the viewport.
// from: 'up' | 'left' | 'right' | 'zoom'
const START = { up: { y: 36 }, left: { x: -80 }, right: { x: 80 }, zoom: { scale: 0.92 } };
export default function Reveal({ children, delay = 0, as = 'div', from = 'up', className = '', ...rest }) {
  const Tag = useMemo(() => (typeof as === 'string' ? motion[as] : motion.create(as)), [as]);
  return (
    <Tag className={className} initial={{ opacity: 1, x: 0, y: 0, scale: 1 }} whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once: false, amount: 0.15 }} transition={{ duration: 0.7, delay: delay / 1000, ease: [0.2, 0.7, 0.2, 1] }}
      {...rest}>{children}</Tag>
  );
}
