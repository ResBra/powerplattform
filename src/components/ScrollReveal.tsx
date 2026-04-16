"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  width?: "fit-content" | "100%";
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  distance?: number;
  duration?: number;
}

export default function ScrollReveal({
  children,
  width = "100%",
  delay = 0.1,
  direction = "up",
  distance = 30,
  duration = 0.8
}: ScrollRevealProps) {
  
  const getInitialPosition = () => {
    switch (direction) {
      case "up": return { y: distance, x: 0 };
      case "down": return { y: -distance, x: 0 };
      case "left": return { y: 0, x: distance };
      case "right": return { y: 0, x: -distance };
      default: return { y: distance, x: 0 };
    }
  };

  return (
    <div style={{ position: "relative", width, overflow: "visible" }}>
      <motion.div
        variants={{
          hidden: { opacity: 0, ...getInitialPosition() },
          visible: { opacity: 1, y: 0, x: 0 }
        }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        transition={{ 
          duration, 
          delay, 
          ease: [0.22, 1, 0.36, 1], // Custom cubic bezier for a premium feel
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
