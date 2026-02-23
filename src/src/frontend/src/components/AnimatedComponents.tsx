import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { growFromBottom, scaleBounce, fadeIn } from '@/lib/animations';
import { cn } from '@/lib/utils';

// AnimatedCard - grows from bottom with organic feel
interface AnimatedCardProps extends HTMLMotionProps<'div'> {
  delay?: number;
}

export function AnimatedCard({ children, className, delay = 0, ...props }: AnimatedCardProps) {
  return (
    <motion.div
      initial={growFromBottom.initial}
      animate={growFromBottom.animate}
      exit={growFromBottom.exit}
      transition={{ duration: 0.5, delay, ease: [0.65, 0.0, 0.35, 1] }}
      className={cn('rounded-xl', className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// GrowingButton - bounces on interaction
interface GrowingButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'default' | 'primary' | 'secondary' | 'ghost';
}

export function GrowingButton({
  children,
  className,
  variant = 'default',
  ...props
}: GrowingButtonProps) {
  const baseStyles = 'px-6 py-3 rounded-full font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2';
  
  const variantStyles = {
    default: 'bg-card text-card-foreground border border-border hover:bg-muted',
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
    ghost: 'hover:bg-muted text-foreground',
  };

  return (
    <motion.button
      whileHover={scaleBounce.whileHover}
      whileTap={scaleBounce.whileTap}
      className={cn(baseStyles, variantStyles[variant], className)}
      {...props}
    >
      {children}
    </motion.button>
  );
}

// FloatingElement - gentle floating animation
interface FloatingElementProps extends HTMLMotionProps<'div'> {
  duration?: number;
  yOffset?: number;
}

export function FloatingElement({
  children,
  className,
  duration = 6,
  yOffset = 10,
  ...props
}: FloatingElementProps) {
  return (
    <motion.div
      animate={{
        y: [0, -yOffset, 0],
        x: [0, 5, 0, -5, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// PageTransition - smooth page entrance
interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      initial={fadeIn.initial}
      animate={fadeIn.animate}
      exit={fadeIn.exit}
      transition={{ duration: 0.3 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// StaggeredList - children animate in sequence
interface StaggeredListProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function StaggeredList({ children, className, staggerDelay = 0.1 }: StaggeredListProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={{
        animate: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggeredItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      variants={{
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.4, ease: [0.65, 0.0, 0.35, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// SeedGrowthLoader - growing animation for loading states
export function SeedGrowthLoader({ className }: { className?: string }) {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ 
        scale: [0, 1.2, 1],
        rotate: 0,
      }}
      transition={{
        duration: 0.6,
        ease: [0.65, 0.0, 0.35, 1],
        repeat: Infinity,
        repeatDelay: 0.5,
      }}
      className={cn('text-primary', className)}
    >
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="20" cy="20" r="18" fill="currentColor" opacity="0.2" />
        <path
          d="M20 4C20 4 15 12 15 20C15 24.4183 16.5804 27 20 27C23.4196 27 25 24.4183 25 20C25 12 20 4 20 4Z"
          fill="currentColor"
        />
      </svg>
    </motion.div>
  );
}

// OrganicContainer - rounded, soft container with entrance animation
interface OrganicContainerProps extends HTMLMotionProps<'div'> {
  delay?: number;
}

export function OrganicContainer({ children, className, delay = 0, ...props }: OrganicContainerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay, ease: [0.65, 0.0, 0.35, 1] }}
      className={cn('rounded-3xl bg-card p-6 shadow-lg', className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
