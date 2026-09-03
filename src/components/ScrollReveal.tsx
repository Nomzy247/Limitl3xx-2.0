import { motion } from 'motion/react';
import { ReactNode } from 'react';
import { fluidSpring } from './SystemManager';

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  key?: string | number;
}

export default function ScrollReveal({ children }: ScrollRevealProps) {
  return (
    <div className="w-full">
      {children}
    </div>
  );
}
