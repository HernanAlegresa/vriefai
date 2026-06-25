"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import type { ContentItem } from "@/lib/types";
import { CalendarView } from "./CalendarView";

interface GenerationViewerProps {
  output: string;
  contentItems: ContentItem[];
  briefMensual?: string;
  createdAt?: string;
}

function StrategyView({ content }: { content: string }) {
  return (
    <div className="px-6 py-7 md:px-8 md:py-8">
      <div className="mx-auto max-w-[70ch] prose-studio">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </div>
    </div>
  );
}

export function GenerationViewer({
  output,
  contentItems,
  briefMensual,
  createdAt,
}: GenerationViewerProps) {
  const [strategyOpen, setStrategyOpen] = useState(false);

  const strategyContent = useMemo(() => {
    if (!output) return null;
    const parts = output.split(/^(?=## )/m);
    for (const part of parts) {
      const heading = part.match(/^## (.+)/)?.[1]?.trim() ?? "";
      const upper = heading.toUpperCase();
      if (upper.includes("PLANIF") || upper.includes("ESTRATEG")) {
        return part.split("\n").slice(1).join("\n").trim();
      }
    }
    return null;
  }, [output]);

  return (
    <>
      {strategyContent && (
        <div className="border-b border-[#ede8e0]">
          <button
            onClick={() => setStrategyOpen((p) => !p)}
            className="flex w-full cursor-pointer items-center justify-between px-6 py-3.5 text-sm font-medium text-[#625d6d] transition-colors hover:text-[#171422]"
          >
            <span className="flex items-center gap-2">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
                <path d="M2 3.5h11M2 7.5h8M2 11.5h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Ver estrategia
            </span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              className={cn("transition-transform duration-200", strategyOpen && "rotate-180")}
            >
              <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <AnimatePresence initial={false}>
            {strategyOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden border-t border-[#ede8e0]"
              >
                <StrategyView content={strategyContent} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <CalendarView
        contentItems={contentItems}
        briefMensual={briefMensual}
        createdAt={createdAt}
      />
    </>
  );
}
