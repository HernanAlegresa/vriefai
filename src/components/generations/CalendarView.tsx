"use client";

import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import type { OutputSection, SectionType, ContentItem } from "@/lib/parseOutput";

// ─── Constants ────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

const MONTH_LABELS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const WEEK_HEADERS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const CHIP_CONFIG: Partial<Record<SectionType, { bg: string; dot: string; label: string }>> = {
  reels:     { bg: "bg-indigo-50 text-indigo-700 border border-indigo-200",  dot: "bg-indigo-400",  label: "Reel" },
  carousels: { bg: "bg-teal-50 text-teal-700 border border-teal-200",        dot: "bg-teal-400",    label: "Carrusel" },
  stories:   { bg: "bg-amber-50 text-amber-700 border border-amber-200",     dot: "bg-amber-400",   label: "Historia" },
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface CalendarItem {
  item: ContentItem;
  type: SectionType;
}

export interface CalendarViewProps {
  sections: OutputSection[];
  briefMensual?: string;
  createdAt?: string;
  isLoading?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractMonthYear(
  brief: string,
  fallback?: string,
): { month: number; year: number } {
  if (brief) {
    const re = new RegExp(`(${MONTH_NAMES.join("|")})[^\\d]*(\\d{4})`, "i");
    const m = brief.match(re);
    if (m) {
      const idx = MONTH_NAMES.findIndex((n) => n === m[1].toLowerCase());
      if (idx !== -1) return { month: idx, year: parseInt(m[2]) };
    }
  }
  const d = fallback ? new Date(fallback) : new Date();
  return { month: d.getMonth(), year: d.getFullYear() };
}

function dayFromSuggestedDate(s: string): number | null {
  const m = s.match(/^(\d{1,2})\s+de/i);
  return m ? parseInt(m[1]) : null;
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function ItemModal({
  day,
  month,
  year,
  items,
  onClose,
}: {
  day: number;
  month: number;
  year: number;
  items: CalendarItem[];
  onClose: () => void;
}) {
  if (typeof document === "undefined") return null;

  const dateLabel = `${day} de ${MONTH_NAMES[month]} ${year}`;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-[#ede8e0] bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#ede8e0] px-6 py-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8b8498]">
              Programación
            </p>
            <p className="font-display text-xl font-bold text-[#171422]">
              {dateLabel}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[#8b8498] transition-colors hover:bg-[#f0ede8] hover:text-[#171422]"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 3l10 10M13 3L3 13"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div
          className="overflow-y-auto px-6 py-5"
          style={{ maxHeight: "calc(80vh - 76px)" }}
        >
          <div className="space-y-4">
            {items.map(({ item, type }, idx) => {
              const cfg = CHIP_CONFIG[type];
              return (
                <div
                  key={`modal-${type}-${item.id}-${idx}`}
                  className="rounded-xl border border-[#ede8e0] p-4"
                >
                  <div className="mb-3">
                    {cfg && (
                      <span
                        className={cn(
                          "rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em]",
                          cfg.bg,
                        )}
                      >
                        {cfg.label} {item.index + 1}
                      </span>
                    )}
                  </div>
                  <div className="prose-studio max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {item.content}
                    </ReactMarkdown>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>,
    document.body,
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function CalendarView({
  sections,
  briefMensual = "",
  createdAt,
  isLoading,
}: CalendarViewProps) {
  const [modalDay, setModalDay] = useState<number | null>(null);
  const [unscheduledOpen, setUnscheduledOpen] = useState(false);

  const { month, year } = useMemo(
    () => extractMonthYear(briefMensual, createdAt),
    [briefMensual, createdAt],
  );

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const { dayMap, unscheduled } = useMemo(() => {
    const map = new Map<number, CalendarItem[]>();
    const unsched: CalendarItem[] = [];

    for (const section of sections) {
      if (section.type === "strategy") continue;
      for (const item of section.items) {
        const calItem: CalendarItem = { item, type: section.type };
        if (item.suggestedDate) {
          const day = dayFromSuggestedDate(item.suggestedDate);
          if (day !== null && day >= 1 && day <= daysInMonth) {
            const prev = map.get(day) ?? [];
            map.set(day, [...prev, calItem]);
          } else {
            unsched.push(calItem);
          }
        } else {
          unsched.push(calItem);
        }
      }
    }

    return { dayMap: map, unscheduled: unsched };
  }, [sections, daysInMonth]);

  // Grid: week starts on Monday (Spanish convention)
  const firstDayJs = new Date(year, month, 1).getDay(); // 0=Sun
  const startOffset = (firstDayJs + 6) % 7; // Mon=0 … Sun=6
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;

  const modalItems = modalDay !== null ? (dayMap.get(modalDay) ?? []) : [];

  return (
    <div className="px-6 py-6 md:px-8 md:py-8">
      {/* Month label */}
      <p className="mb-5 text-sm font-semibold text-[#625d6d]">
        {MONTH_LABELS[month]} {year}
      </p>

      {/* Calendar grid */}
      <div className="overflow-hidden rounded-xl border border-[#ede8e0]">
        {/* Week headers */}
        <div className="grid grid-cols-7 border-b border-[#ede8e0] bg-[#faf8f4]">
          {WEEK_HEADERS.map((h) => (
            <div
              key={h}
              className="py-2 text-center text-[10px] font-semibold uppercase tracking-[0.1em] text-[#8b8498]"
            >
              {h}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {Array.from({ length: totalCells }).map((_, cellIdx) => {
            const day = cellIdx - startOffset + 1;
            const isValidDay = day >= 1 && day <= daysInMonth;
            const items = isValidDay ? (dayMap.get(day) ?? []) : [];
            const hasItems = items.length > 0;
            const isClickable = isValidDay && hasItems && !isLoading;
            const isLastRow = cellIdx >= totalCells - 7;
            const isLastCol = (cellIdx + 1) % 7 === 0;

            return (
              <div
                key={cellIdx}
                onClick={() => isClickable && setModalDay(day)}
                className={cn(
                  "min-h-[72px] border-b border-r border-[#ede8e0] p-1.5 md:min-h-[84px] md:p-2",
                  isLastRow && "border-b-0",
                  isLastCol && "border-r-0",
                  !isValidDay && "bg-[#faf8f4]",
                  isClickable &&
                    "cursor-pointer transition-colors duration-100 hover:bg-[#faf8f4]",
                )}
              >
                {isValidDay && (
                  <>
                    <p
                      className={cn(
                        "mb-1 text-xs font-medium leading-none",
                        hasItems ? "text-[#171422]" : "text-[#c4bfba]",
                      )}
                    >
                      {day}
                    </p>
                    <div className="space-y-0.5">
                      {items.slice(0, 3).map(({ item, type }, i) => {
                        const cfg = CHIP_CONFIG[type];
                        return cfg ? (
                          <div
                            key={`chip-${i}`}
                            className={cn(
                              "flex items-center gap-1 truncate rounded px-1 py-px text-[9px] font-semibold leading-tight md:text-[10px]",
                              cfg.bg,
                            )}
                          >
                            <span
                              className={cn(
                                "h-1.5 w-1.5 shrink-0 rounded-full",
                                cfg.dot,
                              )}
                            />
                            <span className="truncate">
                              {cfg.label} {item.index + 1}
                            </span>
                          </div>
                        ) : null;
                      })}
                      {items.length > 3 && (
                        <p className="pl-1 text-[9px] text-[#8b8498]">
                          +{items.length - 3} más
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Unscheduled items */}
      {unscheduled.length > 0 && (
        <div className="mt-5 rounded-xl border border-[#ede8e0]">
          <button
            onClick={() => setUnscheduledOpen((p) => !p)}
            className="flex w-full cursor-pointer items-center justify-between px-4 py-3.5 text-sm font-medium text-[#625d6d] transition-colors hover:text-[#171422]"
          >
            <span>Sin fecha asignada ({unscheduled.length})</span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              className={cn(
                "transition-transform duration-200",
                unscheduledOpen && "rotate-180",
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
            {unscheduledOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="space-y-3 border-t border-[#ede8e0] px-4 py-4">
                  {unscheduled.map(({ item, type }, idx) => {
                    const cfg = CHIP_CONFIG[type];
                    return (
                      <div
                        key={`unsched-${idx}`}
                        className="rounded-lg border border-[#ede8e0] p-3"
                      >
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          {cfg && (
                            <span
                              className={cn(
                                "rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em]",
                                cfg.bg,
                              )}
                            >
                              {cfg.label} {item.index + 1}
                            </span>
                          )}
                        </div>
                        <div className="prose-studio max-w-none text-sm">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {item.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Modal — rendered via portal so it escapes any overflow:hidden ancestor */}
      <AnimatePresence>
        {modalDay !== null && (
          <ItemModal
            day={modalDay}
            month={month}
            year={year}
            items={modalItems}
            onClose={() => setModalDay(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
