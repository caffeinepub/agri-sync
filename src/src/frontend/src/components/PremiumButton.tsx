import { motion, HTMLMotionProps } from 'framer-motion';
import { ButtonHTMLAttributes, forwardRef, useState } from 'react';
import { Loader2, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type PremiumButtonVariant = 'glow' | 'bounce' | 'ripple' | 'pulse' | 'scale';

interface PremiumButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  variant?: PremiumButtonVariant;
  isLoading?: boolean;
  isSuccess?: boolean;
  isError?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
}

export const PremiumButton = forwardRef<HTMLButtonElement, PremiumButtonProps>(
  (
    {
      variant = 'scale',
      isLoading = false,
      isSuccess = false,
      isError = false,
      onClick,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || isLoading) return;

      // Ripple effect
      if (variant === 'ripple') {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const id = Date.now();
        setRipples((prev) => [...prev, { x, y, id }]);
        setTimeout(() => {
          setRipples((prev) => prev.filter((r) => r.id !== id));
        }, 600);
      }

      onClick?.(e);
    };

    const getAnimationProps = (): HTMLMotionProps<'button'> => {
      const baseProps = {
        whileTap: !disabled && !isLoading ? { scale: 0.97 } : {},
        transition: { duration: 0.2 },
      };

      switch (variant) {
        case 'glow':
          return {
            ...baseProps,
            whileHover: !disabled && !isLoading ? { boxShadow: '0 0 20px var(--glow-color, rgba(var(--primary), 0.5))' } : {},
            animate: {
              boxShadow: isSuccess
                ? '0 0 20px rgba(34, 197, 94, 0.5)'
                : isError
                ? '0 0 20px rgba(239, 68, 68, 0.5)'
                : undefined,
            },
          };

        case 'bounce':
          return {
            ...baseProps,
            whileHover: !disabled && !isLoading ? { y: -4 } : {},
            transition: { type: 'spring', stiffness: 400, damping: 10 },
          };

        case 'ripple':
          return baseProps;

        case 'pulse':
          return {
            ...baseProps,
            whileHover: !disabled && !isLoading
              ? {
                  scale: [1, 1.03, 1],
                  transition: { repeat: Infinity, duration: 0.8 },
                }
              : {},
          };

        case 'scale':
        default:
          return {
            ...baseProps,
            whileHover: !disabled && !isLoading ? { scale: 1.05 } : {},
          };
      }
    };

    const buttonClasses = cn(
      'relative overflow-hidden',
      'px-6 py-3 rounded-lg font-medium',
      'transition-colors duration-200',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      isSuccess && 'bg-success text-success-foreground hover:bg-success/90',
      isError && 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      !isSuccess && !isError && 'bg-primary text-primary-foreground hover:bg-primary/90',
      className
    );

    return (
      <motion.button
        ref={ref}
        {...(getAnimationProps() as any)}
        onClick={handleClick}
        disabled={disabled || isLoading}
        className={buttonClasses}
        {...props}
      >
        {/* Ripple effects */}
        {variant === 'ripple' &&
          ripples.map((ripple) => (
            <motion.span
              key={ripple.id}
              className="absolute rounded-full bg-white/30 pointer-events-none"
              style={{
                left: ripple.x,
                top: ripple.y,
                width: 0,
                height: 0,
                transform: 'translate(-50%, -50%)',
              }}
              initial={{ width: 0, height: 0, opacity: 1 }}
              animate={{
                width: 300,
                height: 300,
                opacity: 0,
              }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          ))}

        {/* Content */}
        <span className="relative flex items-center justify-center gap-2">
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          {isSuccess && !isLoading && (
            <motion.span
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <Check className="w-4 h-4" />
            </motion.span>
          )}
          {isError && !isLoading && (
            <motion.span
              initial={{ scale: 0, rotate: 180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <X className="w-4 h-4" />
            </motion.span>
          )}
          {children}
        </span>
      </motion.button>
    );
  }
);

PremiumButton.displayName = 'PremiumButton';
