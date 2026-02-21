export const motionPresets = {
  frameFade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.5, ease: "easeOut" }
  },

  frameSlideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { duration: 0.5, ease: "easeOut" }
  },

  frameSlideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.5, ease: "easeOut" }
  },

  frameSlideLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.5, ease: "easeOut" }
  },

  frameSlideRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    transition: { duration: 0.5, ease: "easeOut" }
  },

  frameScaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.5, ease: "easeOut" }
  },

  frameStaggerChildren: {
    animate: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  },

  staggerChild: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 }
  },

  frameHoverLift: {
    whileHover: { y: -8, scale: 1.02 },
    transition: { duration: 0.3 }
  },

  frameGlowPulse: {
    animate: {
      boxShadow: [
        "0 0 20px rgba(68, 179, 255, 0.2), inset 0 0 20px rgba(68, 179, 255, 0.05)",
        "0 0 40px rgba(68, 179, 255, 0.35), inset 0 0 30px rgba(68, 179, 255, 0.1)",
        "0 0 20px rgba(68, 179, 255, 0.2), inset 0 0 20px rgba(68, 179, 255, 0.05)"
      ]
    },
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  },

  pageEnter: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.4 }
  },

  containerVariants: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1
      }
    }
  },

  itemVariants: {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  },

  tabVariants: {
    enter: {
      y: 10,
      opacity: 0
    },
    center: {
      zIndex: 1,
      y: 0,
      opacity: 1
    },
    exit: {
      zIndex: 0,
      y: -10,
      opacity: 0
    }
  },

  tabTransition: {
    type: "spring",
    stiffness: 300,
    damping: 30
  }
};

export type MotionPreset = keyof typeof motionPresets;
