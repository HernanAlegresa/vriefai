"use client";

import { AnimatePresence, motion } from "framer-motion";
import { scaleIn } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Status = "success" | "error" | "info";

interface StatusBannerProps {
  show: boolean;
  status?: Status;
  message: string;
  className?: string;
}

const styles: Record<Status, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  error: "border-red-200 bg-red-50 text-red-700",
  info: "border-[#ded8cf] bg-white text-[#625d6d]",
};

export function StatusBanner({
  show,
  status = "success",
  message,
  className,
}: StatusBannerProps) {
  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div
          key={message}
          variants={scaleIn}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium shadow-sm",
            styles[status],
            className
          )}
        >
          {status === "success" && (
            <motion.span
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 420, damping: 18 }}
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path
                  d="M2 5l2.2 2.2L8 3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.span>
          )}
          {status === "error" && (
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              !
            </span>
          )}
          {status === "info" && (
            <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-[#171422]" />
          )}
          <span>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
