"use client";

import { motion } from "framer-motion";

interface LoadingStateProps {
  label?: string;
  className?: string;
}

export function LoadingState({
  label = "Cargando...",
  className = "h-64",
}: LoadingStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className={`flex flex-col items-center justify-center gap-4 ${className}`}
    >
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((index) => (
          <motion.span
            key={index}
            className="h-2 w-2 rounded-full bg-[#171422]"
            animate={{
              opacity: [0.25, 1, 0.25],
              y: [0, -5, 0],
              scale: [0.85, 1, 0.85],
            }}
            transition={{
              duration: 0.85,
              repeat: Infinity,
              delay: index * 0.14,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      <p className="text-sm font-medium text-[#8b8498]">{label}</p>
    </motion.div>
  );
}
