import React from "react";
import { motion, useReducedMotion } from "framer-motion";

const MotionDiv = motion.div;

const transitionByVariant = {
  forward: {
    initial: { opacity: 0, x: 36, scale: 0.985, filter: "blur(10px)" },
    animate: { opacity: 1, x: 0, scale: 1, filter: "blur(0px)" },
    exit: { opacity: 0, x: -24, scale: 0.992, filter: "blur(8px)" },
  },
  backward: {
    initial: { opacity: 0, x: -36, scale: 0.985, filter: "blur(10px)" },
    animate: { opacity: 1, x: 0, scale: 1, filter: "blur(0px)" },
    exit: { opacity: 0, x: 24, scale: 0.992, filter: "blur(8px)" },
  },
};

export function PageTransition({
  children,
  className = "",
  variant = "forward",
}) {
  const prefersReducedMotion = useReducedMotion();
  const transitionState =
    transitionByVariant[variant] || transitionByVariant.forward;

  if (prefersReducedMotion) {
    return (
      <MotionDiv
        className={className}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
      >
        {children}
      </MotionDiv>
    );
  }

  return (
    <MotionDiv
      className={className}
      initial={transitionState.initial}
      animate={transitionState.animate}
      exit={transitionState.exit}
      transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </MotionDiv>
  );
}

export default PageTransition;
