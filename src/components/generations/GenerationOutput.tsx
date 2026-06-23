"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-8"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <p className="text-[11px] font-semibold text-[#3a4060] uppercase tracking-widest">
            Programación generada
          </p>
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-1.5 text-xs text-[#4f7eff] bg-[#4f7eff]/10 border border-[#4f7eff]/20 px-2.5 py-1 rounded-full"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#4f7eff] animate-pulse" />
                Generando
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {!isLoading && output && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs transition-colors px-3 py-1.5 rounded-lg border border-white/6 hover:bg-white/4"
            style={{ color: copied ? "#10b981" : "#4a5064" }}
          >
            {copied ? (
              <>
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
              </>
            ) : (
              <>
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
                Copiar texto
              </>
            )}
          </button>
        )}
      </div>

      {/* Output content */}
      <div className="bg-[#0a0c1b] border border-white/6 rounded-2xl p-6 md:p-8 overflow-auto max-h-[75vh]">
        {isLoading ? (
          <pre className="whitespace-pre-wrap text-sm text-[#7880a8] font-mono leading-relaxed">
            {output}
            <span className="inline-block w-2 h-[1.1em] bg-[#4f7eff]/60 ml-0.5 align-text-bottom animate-pulse rounded-sm" />
          </pre>
        ) : (
          <div className="prose-studio">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{output}</ReactMarkdown>
          </div>
        )}
      </div>
    </motion.div>
  );
}
