/**
 * Centralized motion tokens for the MovieSearch design system.
 * These values ensure consistency in timing and feel across the application.
 */

export const motionTokens = {
  // Duration scale (seconds)
  durations: {
    fast: 0.15,
    normal: 0.3,
    slow: 0.6,
  },

  // Easing presets
  easings: {
    // Premium smooth cubic-bezier (often called "standard easing")
    smooth: [0.4, 0, 0.2, 1],
    // Natural physics-based spring for playful interactions
    spring: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
    // Gentle spring for larger modal transitions
    gentle: {
      type: "spring",
      stiffness: 260,
      damping: 26,
    },
  },

  // Semantic transition presets
  transitions: {
    default: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
    hover: {
      type: "spring",
      stiffness: 400,
      damping: 25,
    },
    modal: {
      type: "spring",
      stiffness: 260,
      damping: 26,
    },
    page: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1],
    },
  },
} as const;

export type MotionTokens = typeof motionTokens;
