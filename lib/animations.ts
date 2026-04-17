import { Variants } from "framer-motion";
import { motionTokens } from "./motion";

/**
 * Reusable animation variants using centralized motion tokens.
 */

// Simple fade-in with a slight slide up
export const fadeIn: Variants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: motionTokens.transitions.default,
  },
  exit: {
    opacity: 0,
    y: 10,
    transition: {
      duration: motionTokens.durations.fast,
      ease: "easeIn",
    },
  },
};

// Container to stagger child animations
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

// Standardized card hover effect
export const scaleHover: Variants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.05,
    transition: motionTokens.transitions.hover,
  },
  tap: {
    scale: 0.98,
    transition: motionTokens.transitions.hover,
  },
};

// Modal transitions (Backdrop and Content)
export const modalVariants = {
  backdrop: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  } as Variants,
  content: {
    initial: { opacity: 0, scale: 0.9, y: 20 },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: motionTokens.transitions.modal,
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      y: 20,
      transition: {
        duration: motionTokens.durations.fast,
      },
    },
  } as Variants,
};

// Full page transitions
export const pageTransition: Variants = {
  initial: { opacity: 0, x: -10 },
  animate: {
    opacity: 1,
    x: 0,
    transition: motionTokens.transitions.page,
  },
  exit: {
    opacity: 0,
    x: 10,
    transition: {
      duration: motionTokens.durations.normal,
    },
  },
};
