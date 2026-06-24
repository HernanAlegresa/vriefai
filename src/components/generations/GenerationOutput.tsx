"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeUp, fadeUpTransition } from "@/lib/motion";
import { GenerationViewer } from "./GenerationViewer";

interface GenerationOutputProps {
  output: string;
  isLoading: boolean;
}

export function GenerationOutput({ output, isLoading }: GenerationOutputProps) {
  const [copied, setCopied] = useState(false);

  if (!output && !isLoading) return null;

  async function handleCopy() {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  }

  return (
    <motion.div
      initial={fadeUp.initial}
      animate={fadeUp.animate}
      transition={fadeUpTransition}
      className="mt-8"
    >
      {/* Header row */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8b8498]">
            Programación generada
          </p>
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-1.5 rounded-full border border-[#ded8cf] bg-white px-2.5 py-1 text-xs text-[#625d6d]"
              >
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#171422]" />
                Generando
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {!isLoading && output && (
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCopy}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#d8d2ca] bg-white px-3 py-1.5 text-xs transition-colors hover:bg-[#faf8f4]"
            style={{ color: copied ? "#10b981" : "#645f72" }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {copied ? (
                <motion.span
                  key="copied"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="flex items-center gap-1.5"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2 6l3 3 5-5"
                      stroke="#10b981"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Copiado
                </motion.span>
              ) : (
                <motion.span
                  key="copy"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="flex items-center gap-1.5"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <rect
                      x="4.5"
                      y="4.5"
                      width="6"
                      height="6"
                      rx="1"
                      stroke="currentColor"
                      strokeWidth="1.2"
                    />
                    <path
                      d="M7.5 4.5V2.5A1 1 0 006.5 1.5h-4A1 1 0 001.5 2.5v4A1 1 0 002.5 7.5H4.5"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                  </svg>
                  Copiar todo
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        )}
      </div>

      {/* Viewer card */}
      <div className="overflow-hidden rounded-2xl border border-[#ded8cf] bg-white shadow-sm">
        <GenerationViewer output={output} isLoading={isLoading} />
      </div>
    </motion.div>
  );
}
