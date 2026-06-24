"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import {
  parseGenerationOutput,
  type OutputSection,
} from "@/lib/parseOutput";
import { CalendarView } from "./CalendarView";

interface GenerationViewerProps {
  output: string;
  briefMensual?: string;
  createdAt?: string;
  isLoading?: boolean;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StreamingCursor() {
  return (
    <span className="ml-0.5 inline-block h-[1.05em] w-[7px] animate-pulse rounded-sm bg-[#4f7eff]/55 align-text-bottom" />
  );
}

function StrategyView({
  section,
  isStreaming,
}: {
  section: OutputSection;
  isStreaming: boolean;
}) {
  return (
    <div className="px-6 py-7 md:px-8 md:py-8">
      <div className="mx-auto max-w-[70ch] prose-studio">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {section.content}
        </ReactMarkdown>
        {isStreaming && <StreamingCursor />}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function GenerationViewer({
  output,
  briefMensual,
  createdAt,
  isLoading,
}: GenerationViewerProps) {
  const sections = useMemo(() => parseGenerationOutput(output), [output]);
  const [strategyOpen, setStrategyOpen] = useState(false);

  // Pre-parse: stream raw text until first ## heading appears
  if (sections.length === 0) {
    if (!output && !isLoading) return null;
    return (
      <div className="px-6 py-6 md:px-8">
        <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-[#5f5a6b]">
          {output}
          {isLoading && <StreamingCursor />}
        </pre>
      </div>
    );
  }

  const strategySection = sections.find((s) => s.type === "strategy");
  const isStrategyStreaming =
    !!isLoading && sections[sections.length - 1].type === "strategy";

  return (
    <>
      {/* Collapsible strategy block */}
      {strategySection && (
        <div className="border-b border-[#ede8e0]">
          <button
            onClick={() => setStrategyOpen((p) => !p)}
            className="flex w-full cursor-pointer items-center justify-between px-6 py-3.5 text-sm font-medium text-[#625d6d] transition-colors hover:text-[#171422]"
          >
            <span className="flex items-center gap-2">
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M2 3.5h11M2 7.5h8M2 11.5h5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              Ver estrategia
              {isStrategyStreaming && (
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#4f7eff]" />
              )}
            </span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              className={cn(
                "transition-transform duration-200",
                strategyOpen && "rotate-180",
              )}
            >
              <path
                d="M3 5l4 4 4-4"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
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
                <StrategyView
                  section={strategySection}
                  isStreaming={isStrategyStreaming}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Calendar as main view */}
      <CalendarView
        sections={sections}
        briefMensual={briefMensual}
        createdAt={createdAt}
        isLoading={isLoading}
      />
    </>
  );
}
