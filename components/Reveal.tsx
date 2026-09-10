'use client';

import { ReactNode } from 'react';
import { motion, Variants } from 'framer-motion';

const offsets = {
  up: { y: 40 },
  down: { y: -40 },
  left: { x: 40 },
  right: { x: -40 },
  fade: {},
  scale: {},
} as const;

type Direction = keyof typeof offsets;

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: Direction;
  amount?: number;
  once?: boolean;
}

export default function Reveal({
  children,
  className = '',
  delay = 0,
  duration = 0.6,
  direction = 'up',
  amount = 0.2,
  once = true,
}: RevealProps) {
  const offset = offsets[direction];

  const initial =
    direction === 'scale'
      ? { opacity: 0, scale: 0.9 }
      : { opacity: 0, ...offset };

  const animate =
    direction === 'scale'
      ? { opacity: 1, scale: 1 }
      : { opacity: 1, x: 0, y: 0 };

  return (
    <motion.div
      className={className}
      initial={initial}
      whileInView={animate}
      viewport={{ once, amount }}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               Stagger Animation                            */
/* -------------------------------------------------------------------------- */

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

export const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 28,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  amount?: number;
  once?: boolean;
}

export function StaggerContainer({
  children,
  className = '',
  amount = 0.15,
  once = true,
}: StaggerContainerProps) {
  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount }}
    >
      {children}
    </motion.div>
  );
}

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
}

export function StaggerItem({
  children,
  className = '',
}: StaggerItemProps) {
  return (
    <motion.div className={className} variants={itemVariants} >
      {children}
    </motion.div>
  );
}