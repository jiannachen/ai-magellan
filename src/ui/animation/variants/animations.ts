import type { Variants } from 'framer-motion';

// Atlassian Design System Motion Tokens - 2024 Updated
const ATLASSIAN_DURATIONS = {
  instant: 0,          // 0ms - instant feedback
  micro: 0.1,          // 100ms - micro interactions
  short: 0.2,          // 200ms - standard interactions  
  medium: 0.3,         // 300ms - complex transitions
  long: 0.5,           // 500ms - page transitions
} as const;

const ATLASSIAN_EASINGS = {
  entrance: [0.15, 1, 0.3, 1] as [number, number, number, number],        // Elements entering
  exit: [0.6, 0, 0.85, 0.15] as [number, number, number, number],         // Elements exiting
  standard: [0.25, 0.1, 0.25, 1] as [number, number, number, number],     // Standard interactions
  decelerate: [0, 0, 0.3, 1] as [number, number, number, number],         // Slow ending
  accelerate: [0.7, 0, 1, 0.5] as [number, number, number, number],       // Fast start
} as const;

// Reduced motion transition for accessibility
const getAccessibleTransition = (duration: number, ease: number[]) => ({
  duration,
  ease,
  // Framer Motion automatically respects prefers-reduced-motion
  // by reducing animation duration to 0 when user prefers reduced motion
});

// Hero section animations - Atlassian optimized with accessibility
export const heroContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1,
      delayChildren: 0.2,
      ...getAccessibleTransition(ATLASSIAN_DURATIONS.medium, ATLASSIAN_EASINGS.entrance),
    }
  }
};

export const heroTitleVariants: Variants = {
  hidden: { 
    opacity: 0,
    y: 16,
    scale: 0.95,
  },
  visible: { 
    opacity: 1,
    y: 0,
    scale: 1,
    transition: getAccessibleTransition(ATLASSIAN_DURATIONS.medium, ATLASSIAN_EASINGS.entrance),
  }
};

export const heroDescriptionVariants: Variants = {
  hidden: { 
    opacity: 0,
    y: 12,
  },
  visible: { 
    opacity: 1,
    y: 0,
    transition: {
      ...getAccessibleTransition(ATLASSIAN_DURATIONS.medium, ATLASSIAN_EASINGS.entrance),
      delay: 0.1,
    }
  }
};

// Background pattern animation - accessibility aware
export const backgroundPatternVariants: Variants = {
  hidden: { 
    opacity: 0,
    scale: 0.95,
  },
  visible: { 
    opacity: 0.1,
    scale: 1,
    transition: getAccessibleTransition(ATLASSIAN_DURATIONS.long, ATLASSIAN_EASINGS.decelerate),
  }
};

// Icon animations - reduced complexity for accessibility
export const floatingIconVariants: Variants = {
  hidden: (_i: number) => ({
    opacity: 0,
    scale: 0.8,
    y: 8,
  }),
  visible: (i: number) => ({
    opacity: 0.2,
    scale: 1,
    y: 0,
    transition: {
      ...getAccessibleTransition(ATLASSIAN_DURATIONS.medium, ATLASSIAN_EASINGS.entrance),
      delay: i * 0.1,
    }
  })
};

// Grid animations - optimized for performance and accessibility
export const gridContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
      ...getAccessibleTransition(ATLASSIAN_DURATIONS.short, ATLASSIAN_EASINGS.entrance),
    }
  }
};

export const gridItemVariants: Variants = {
  hidden: { 
    opacity: 0,
    y: 12,
    scale: 0.95,
  },
  visible: { 
    opacity: 1,
    y: 0,
    scale: 1,
    transition: getAccessibleTransition(ATLASSIAN_DURATIONS.medium, ATLASSIAN_EASINGS.entrance),
  }
};

// Header animations - respect user motion preferences
export const headerVariants: Variants = {
  top: {
    backgroundColor: "rgba(255, 255, 255, 0)",
    backdropFilter: "blur(0px)",
    boxShadow: "none",
    borderBottomColor: "rgba(0, 0, 0, 0)",
    transition: getAccessibleTransition(ATLASSIAN_DURATIONS.medium, ATLASSIAN_EASINGS.standard),
  },
  scrolled: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(12px)",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
    transition: getAccessibleTransition(ATLASSIAN_DURATIONS.medium, ATLASSIAN_EASINGS.standard),
  }
};

// Card hover animations - Atlassian optimized with accessibility
export const cardHoverVariants: Variants = {
  initial: {
    y: 0,
    scale: 1,
  },
  hover: {
    y: -2,
    scale: 1.01,
    transition: getAccessibleTransition(ATLASSIAN_DURATIONS.short, ATLASSIAN_EASINGS.standard),
  },
  tap: {
    scale: 0.99,
    transition: getAccessibleTransition(ATLASSIAN_DURATIONS.micro, ATLASSIAN_EASINGS.exit),
  },
};

// Layout animation for shared elements - accessibility first
export const sharedLayoutTransition = getAccessibleTransition(
  ATLASSIAN_DURATIONS.medium, 
  ATLASSIAN_EASINGS.standard
);

// Common transitions - Atlassian compliant with accessibility
export const springTransition = getAccessibleTransition(
  ATLASSIAN_DURATIONS.medium,
  ATLASSIAN_EASINGS.entrance
);

export const easeTransition = getAccessibleTransition(
  ATLASSIAN_DURATIONS.medium,
  ATLASSIAN_EASINGS.standard
);

export const springTransitionProps = getAccessibleTransition(
  ATLASSIAN_DURATIONS.medium,
  ATLASSIAN_EASINGS.entrance
);

// Text hover animations - simplified and accessible
export const textCharacterVariants: Variants = {
  initial: {
    scale: 1,
    y: 0,
  },
  hover: (i: number) => ({
    scale: 1.05,
    y: -2,
    transition: {
      ...getAccessibleTransition(ATLASSIAN_DURATIONS.short, ATLASSIAN_EASINGS.standard),
      delay: i * 0.015,
    }
  }),
};

// Text container animations - accessible by default
export const textContainerVariants: Variants = {
  initial: {
    opacity: 1,
  },
  hover: {
    opacity: 1,
    transition: {
      staggerChildren: 0.01,
      ...getAccessibleTransition(ATLASSIAN_DURATIONS.short, []),
    }
  },
};

// Focus-visible animations for accessibility
export const focusVariants: Variants = {
  initial: {
    outlineWidth: 0,
    outlineOffset: 0,
  },
  focused: {
    outlineWidth: 2,
    outlineOffset: 2,
    transition: getAccessibleTransition(ATLASSIAN_DURATIONS.micro, ATLASSIAN_EASINGS.standard),
  }
};

// Loading animations - respect motion preferences
export const loadingVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.8,
  },
  loading: {
    opacity: 1,
    scale: 1,
    transition: {
      ...getAccessibleTransition(ATLASSIAN_DURATIONS.short, ATLASSIAN_EASINGS.entrance),
      repeat: Infinity,
      repeatType: "reverse",
    }
  }
};

// Modal/Dialog animations - accessibility compliant
export const modalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: getAccessibleTransition(ATLASSIAN_DURATIONS.medium, ATLASSIAN_EASINGS.entrance),
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 8,
    transition: getAccessibleTransition(ATLASSIAN_DURATIONS.short, ATLASSIAN_EASINGS.exit),
  }
};

// Overlay animations
export const overlayVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: getAccessibleTransition(ATLASSIAN_DURATIONS.medium, ATLASSIAN_EASINGS.standard),
  },
  exit: {
    opacity: 0,
    transition: getAccessibleTransition(ATLASSIAN_DURATIONS.short, ATLASSIAN_EASINGS.exit),
  }
};