"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import type { Generation } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

interface GenerationCardProps {
  generation: Generation;
  brandColor?: string;
  selected?: boolean;
  compact?: boolean;
  onSelect?: () => void;
  onDelete?: () => void;
}

const MONTH_NAMES = [
  "enero","febrero","marzo","abril","mayo","junio",
  "julio","agosto","septiembre","octubre","noviembre","diciembre",
];
const MONTH_LABELS = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
];

function extractMonthLabel(brief: string, fallback: string): string {
  if (brief) {
    const re = new RegExp(`(${MONTH_NAMES.join("|")})[^\\d]*(\\d{4})`, "i");
    const m = brief.match(re);
    if (m) {
      const idx = MONTH_NAMES.findIndex((n) => n === m[1].toLowerCase());
      if (idx !== -1) return `${MONTH_LABELS[idx]} ${m[2]}`;
    }
    let lastIdx = -1;
    let result: string | null = null;
    for (const [i, name] of MONTH_NAMES.entries()) {
      const idx = brief.toLowerCase().lastIndexOf(name);
      if (idx > lastIdx) { lastIdx = idx; result = MONTH_LABELS[i]; }
    }
    if (result) return result;
  }
  const d = new Date(fallback);
  return `${MONTH_LABELS[d.getMonth()]} ${d.getFullYear()}`;
}

const FORMAT_CONFIG = {
  reels:      { classes: "bg-indigo-50 text-indigo-700 border border-indigo-200" },
  carruseles: { classes: "bg-teal-50 text-teal-700 border border-teal-200" },
  historias:  { classes: "bg-amber-50 text-amber-700 border border-amber-200" },
} as const;

export function GenerationCard({
  generation,
  brandColor = "#4f7eff",
  selected = false,
  compact = false,
  onSelect,
  onDelete,
}: GenerationCardProps) {
  const [armedDelete, setArmedDelete] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

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
    { key: "reels" as const,      count: generation.cantReels,      label: "Reels" },
    { key: "carruseles" as const,  count: generation.cantCarruseles,  label: "Carruseles" },
    { key: "historias" as const,   count: generation.cantHistorias,   label: "Historias" },
  ];

  const monthLabel = extractMonthLabel(generation.briefMensual, generation.createdAt);

  return (
    <motion.div
      whileHover={{ y: compact ? 0 : -1 }}
      transition={{ duration: 0.16 }}
      className={cn(
        "overflow-hidden rounded-xl border bg-white transition-all duration-200",
        compact ? "rounded-xl" : "rounded-2xl",
        selected
          ? "border-[#4f7eff]/40 shadow-lg shadow-[#4f7eff]/10"
          : "border-[#e5ded5] hover:border-[#d6cfc6] hover:shadow-sm",
        armedDelete && "border-red-300 shadow-red-100"
      )}
    >
      <div
        className={cn(
          "flex items-start gap-2",
          compact ? "px-3 py-3" : "gap-3 px-4 pt-4"
        )}
      >
        <button
          type="button"
          onClick={onSelect}
          className="min-w-0 flex-1 cursor-pointer text-left"
        >
          <div className="mb-1.5 flex items-center gap-2">
            <span
              className={cn("rounded-full", compact ? "h-2 w-2" : "h-2.5 w-2.5")}
              style={{ background: selected ? brandColor : `${brandColor}80` }}
            />
            <p
              className={cn(
                "font-semibold text-[#171422]",
                compact ? "text-[13px]" : "text-sm"
              )}
            >
              {formatDate(generation.createdAt)}
            </p>
          </div>

          <p
            className={cn(
              "font-medium text-[#625d6d]",
              compact ? "text-[12px]" : "text-xs"
            )}
          >
            {monthLabel}
          </p>

          <div
            className={cn(
              "mt-2.5 flex flex-wrap items-center gap-1",
              compact ? "gap-1" : "gap-1.5"
            )}
          >
            {formats.map(({ key, count, label }) => (
              <span
                key={key}
                className={cn(
                  "rounded-full font-semibold",
                  compact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]",
                  FORMAT_CONFIG[key].classes
                )}
                title={label}
              >
                {count} {label}
              </span>
            ))}
            {selected && (
              <span className="ml-auto text-[10px] font-semibold text-[#4f7eff]">
                En lectura
              </span>
            )}
          </div>
        </button>

        {onDelete && (
          <button
            type="button"
            onClick={handleDeleteClick}
            className={cn(
              "flex shrink-0 cursor-pointer items-center justify-center rounded-lg transition-all",
              compact ? "h-7 w-7" : "h-8 w-8 rounded-xl",
              armedDelete
                ? "bg-red-50 text-red-600"
                : "text-[#a39bad] hover:bg-red-50 hover:text-red-600"
            )}
            title={armedDelete ? "Confirmar eliminación" : "Eliminar"}
          >
            {armedDelete ? (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M1.5 3h9M4 3V2h4v1M5 5.5v3M7 5.5v3M2.5 3l.7 6.5h5.6L9.5 3H2.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
}
