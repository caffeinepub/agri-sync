// Animation constants and reusable variants for Framer Motion

export const SPRING_CONFIGS = {
  gentle: { type: 'spring' as const, stiffness: 100, damping: 15 },
  bouncy: { type: 'spring' as const, stiffness: 300, damping: 20 },
  soft: { type: 'spring' as const, stiffness: 80, damping: 12 },
};

export const EASING = {
  natural: [0.25, 0.46, 0.45, 0.94],
  wind: [0.4, 0.0, 0.2, 1],
  organic: [0.65, 0.0, 0.35, 1],
};

export const DURATIONS = {
  fast: 0.2,
  normal: 0.3,
  slow: 0.5,
  slowest: 0.8,
};

// Grow from bottom - products appearing
export const growFromBottom = {
  initial: { opacity: 0, y: 40, scale: 0.9 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -20, scale: 0.95 },
};

// Float and sway - decorative elements
export const floatAndSway = {
  animate: {
    y: [0, -10, 0],
    x: [0, 5, 0, -5, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Scale bounce - buttons
export const scaleBounce = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 },
};

// Slide from left - page transitions
export const slideFromLeft = {
  initial: { opacity: 0, x: -50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 50 },
};

// Slide from right
export const slideFromRight = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
};

// Fade in
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

// Stagger children
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

// Seed to plant growth - loading
export const seedGrowth = {
  initial: { scale: 0, rotate: -180 },
  animate: { 
    scale: [0, 1.2, 1],
    rotate: 0,
    transition: {
      duration: 0.6,
      ease: EASING.organic,
    },
  },
};

// Ripple effect for buttons (keyframes)
export const rippleKeyframes = `
  @keyframes ripple {
    0% {
      transform: scale(0);
      opacity: 0.5;
    }
    100% {
      transform: scale(4);
      opacity: 0;
    }
  }
`;

// Shimmer loading effect
export const shimmer = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};
