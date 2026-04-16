"use client";

import React from "react";
import { motion } from "framer-motion";
import { fadeIn, staggerContainer } from "@/lib/animations";

interface MotionPageProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * A layout wrapper that applies entrance animations to its children.
 * Uses the centralized motion system for consistent staging.
 */
export const MotionPage: React.FC<MotionPageProps> = ({ 
  children, 
  className = "" 
}) => {
  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className={className}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return (
            <motion.div variants={fadeIn} className="will-change-[opacity,transform]">
              {child}
            </motion.div>
          );
        }
        return child;
      })}
    </motion.div>
  );
};

export default MotionPage;
