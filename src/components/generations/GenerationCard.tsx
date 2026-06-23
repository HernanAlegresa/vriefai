"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Generation } from "@/lib/types";
import { formatDate } from "@/lib/utils";

interface GenerationCardProps {
  generation: Generation;
  brandColor?: string;
  onDelete?: () => void;
}

export function GenerationCard({
  generation,
  brandColor = "#4f7eff",
  onDelete,
}: GenerationCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [armedDelete, setArmedDelete] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  function handleDeleteClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (armedDelete) {
      clearTimeout(resetTimer.current);
      onDelete?.();
    } else {
      setArmedDelete(true);
      resetTimer.current = setTimeout(() => setArmedDelete(false), 2500);
    }
  }

  const formats = [
    { key: "R", count: generation.cantReels, label: "Reels" },
    { key: "C", count: generation.cantCarruseles, label: "Carruseles" },
    { key: "H", count: generation.cantHistorias, label: "Historias" },
  ];

  return (
    <div className="bg-[#0a0c1b] border border-white/6 hover:border-white/10 rounded-2xl overflow-hidden transition-colors duration-200">
      {/* Header row */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/2 transition-colors"
      >
        <div className="flex items-center gap-4 min-w-0">
          {/* Date */}
          <div className="shrink-0">
            <p className="text-sm font-semibold text-[#a8b3cc]">
              {formatDate(generation.createdAt)}
            </p>
            {generation.briefMensual && (
              <p className="text-xs text-[#3a4060] font-mono truncate max-w-[220px] mt-0.5">
                {generation.briefMensual.split("\n")[0].slice(0, 80)}
                {generation.briefMensual.length > 80 ? "…" : ""}
              </p>
            )}
          </div>

          {/* Format badges */}
          <div className="hidden sm:flex items-center gap-1.5">
            {formats.map(({ key, count }) => (
              <span
                key={key}
                className="text-[11px] px-2 py-0.5 rounded-md font-semibold"
                style={
                  key === "R"
                    ? {
                        background: `${brandColor}15`,
                        border: `1px solid ${brandColor}25`,
                        color: brandColor,
                      }
                    : {
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: "#4a5064",
                      }
                }
              >
                {count}
                {key}
              </span>
            ))}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 ml-3 shrink-0">
          {onDelete && (
            <button
              onClick={handleDeleteClick}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                armedDelete
                  ? "text-red-400 bg-red-950/40"
                  : "text-[#3a4060] hover:text-red-400 hover:bg-red-950/20"
              }`}
              title={armedDelete ? "Confirmar eliminación" : "Eliminar"}
            >
              {armedDelete ? (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2 6l3 3 5-5"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M1.5 3h9M4 3V2h4v1M5 5.5v3M7 5.5v3M2.5 3l.7 6.5h5.6L9.5 3H2.5Z"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          )}

          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-[#3a4060]"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M2 5l5 5 5-5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>
        </div>
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-6 pt-3 border-t border-white/5">
              {generation.briefMensual && (
                <div
                  className="mb-5 p-4 rounded-xl"
                  style={{
                    background: `${brandColor}08`,
                    border: `1px solid ${brandColor}18`,
                  }}
                >
                  <p
                    className="text-[10px] font-semibold uppercase tracking-widest mb-2"
                    style={{ color: `${brandColor}80` }}
                  >
                    Brief del mes
                  </p>
                  <p className="text-sm text-[#7880a8] whitespace-pre-wrap font-mono leading-relaxed">
                    {generation.briefMensual}
                  </p>
                </div>
              )}
              <div className="prose-studio">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {generation.output}
                </ReactMarkdown>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
