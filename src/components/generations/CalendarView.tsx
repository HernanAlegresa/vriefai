"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import type { ContentItem } from "@/lib/types";
import { supabase } from "@/lib/supabase";

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

const CHIP_CONFIG: Record<ContentItem["type"], { bg: string; dot: string; label: string }> = {
  reel:     { bg: "bg-indigo-50 text-indigo-700 border border-indigo-200", dot: "bg-indigo-400",  label: "Reel" },
  carousel: { bg: "bg-teal-50 text-teal-700 border border-teal-200",       dot: "bg-teal-400",    label: "Carrusel" },
  story:    { bg: "bg-amber-50 text-amber-700 border border-amber-200",    dot: "bg-amber-400",   label: "Historia" },
};

const TYPE_OPTIONS: { value: ContentItem["type"]; label: string }[] = [
  { value: "reel",     label: "Reel" },
  { value: "carousel", label: "Carrusel" },
  { value: "story",    label: "Historia" },
];

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CalendarViewProps {
  contentItems: ContentItem[];
  briefMensual?: string;
  createdAt?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractMonthYear(brief: string, fallback?: string): { month: number; year: number } {
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
  const iso = s.match(/^\d{4}-\d{2}-(\d{2})$/);
  if (iso) return parseInt(iso[1]);
  const legacy = s.match(/^(\d{1,2})\s+de/i);
  return legacy ? parseInt(legacy[1]) : null;
}

// ─── Item modal ───────────────────────────────────────────────────────────────

interface ItemModalProps {
  day: number;
  month: number;
  year: number;
  items: ContentItem[];
  onItemUpdate: (updated: ContentItem) => void;
  onItemDelete: (id: string) => void;
  onClose: () => void;
}

function ItemModal({ day, month, year, items, onItemUpdate, onItemDelete, onClose }: ItemModalProps) {
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [form, setForm] = useState({ title: "", date: "", type: "reel" as ContentItem["type"], body: "" });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, setSaving] = useState(false);

  if (typeof document === "undefined") return null;

  const dateLabel = `${day} de ${MONTH_NAMES[month]} ${year}`;

  function startEdit(item: ContentItem) {
    setEditingItem(item);
    setForm({ title: item.title, date: item.suggestedDate ?? "", type: item.type, body: item.body });
    setConfirmDelete(false);
  }

  function cancelEdit() {
    setEditingItem(null);
    setConfirmDelete(false);
  }

  async function handleSave() {
    if (!editingItem || saving) return;
    setSaving(true);
    const patch = {
      title: form.title.trim() || editingItem.title,
      suggested_date: form.date || null,
      type: form.type,
      body: form.body,
      edited: true,
    };
    const { error } = await supabase.from("content_items").update(patch).eq("id", editingItem.id);
    if (!error) {
      onItemUpdate({
        ...editingItem,
        title: patch.title,
        suggestedDate: patch.suggested_date,
        type: patch.type,
        body: patch.body,
        edited: true,
      });
      onClose();
    } else {
      console.error("[edit] update failed:", error.message);
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!editingItem) return;
    const { error } = await supabase.from("content_items").delete().eq("id", editingItem.id);
    if (!error) {
      onItemDelete(editingItem.id);
      onClose();
    } else {
      console.error("[edit] delete failed:", error.message);
    }
  }

  const cfg = editingItem ? CHIP_CONFIG[editingItem.type] : null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
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
        className="relative z-10 max-h-[88vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-[#ede8e0] bg-white shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-[#ede8e0] px-6 py-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8b8498]">
              {editingItem ? "Editar pieza" : "Programación"}
            </p>
            <p className="font-display text-xl font-bold text-[#171422]">
              {editingItem
                ? `${cfg?.label} ${editingItem.number}`
                : dateLabel}
            </p>
          </div>
          <button
            onClick={editingItem ? cancelEdit : onClose}
            className="rounded-lg p-2 text-[#8b8498] transition-colors hover:bg-[#f0ede8] hover:text-[#171422]"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          <AnimatePresence mode="wait" initial={false}>
            {editingItem ? (
              /* ── Edit mode ── */
              <motion.div
                key="edit"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                {/* Título */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-[#8b8498]">
                    Título
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    className="w-full rounded-lg border border-[#d8d2ca] bg-white px-3 py-2 text-sm text-[#171422] outline-none transition-colors focus:border-[#9b8ec4] focus:ring-2 focus:ring-[#9b8ec4]/20"
                  />
                </div>

                {/* Tipo + Fecha en fila */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-[#8b8498]">
                      Tipo
                    </label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as ContentItem["type"] }))}
                      className="w-full rounded-lg border border-[#d8d2ca] bg-white px-3 py-2 text-sm text-[#171422] outline-none transition-colors focus:border-[#9b8ec4] focus:ring-2 focus:ring-[#9b8ec4]/20"
                    >
                      {TYPE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-[#8b8498]">
                      Fecha
                    </label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                      className="w-full rounded-lg border border-[#d8d2ca] bg-white px-3 py-2 text-sm text-[#171422] outline-none transition-colors focus:border-[#9b8ec4] focus:ring-2 focus:ring-[#9b8ec4]/20"
                    />
                  </div>
                </div>

                {/* Body */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-[#8b8498]">
                    Contenido
                  </label>
                  <textarea
                    value={form.body}
                    onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                    rows={12}
                    className="w-full resize-y rounded-lg border border-[#d8d2ca] bg-white px-3 py-2 font-mono text-sm leading-relaxed text-[#171422] outline-none transition-colors focus:border-[#9b8ec4] focus:ring-2 focus:ring-[#9b8ec4]/20"
                  />
                </div>

                {/* Eliminar */}
                <div className="border-t border-[#f0ede8] pt-4">
                  <AnimatePresence mode="wait" initial={false}>
                    {confirmDelete ? (
                      <motion.div
                        key="confirm"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.12 }}
                        className="flex items-center gap-3"
                      >
                        <span className="text-sm text-[#625d6d]">¿Eliminar esta pieza?</span>
                        <button
                          onClick={handleDelete}
                          className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-600"
                        >
                          Sí, eliminar
                        </button>
                        <button
                          onClick={() => setConfirmDelete(false)}
                          className="text-xs font-medium text-[#8b8498] hover:text-[#171422]"
                        >
                          Cancelar
                        </button>
                      </motion.div>
                    ) : (
                      <motion.button
                        key="delete-btn"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.12 }}
                        onClick={() => setConfirmDelete(true)}
                        className="text-sm font-medium text-red-500 hover:text-red-600 transition-colors"
                      >
                        Eliminar pieza
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ) : (
              /* ── View mode ── */
              <motion.div
                key="view"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                {items.map((item, idx) => {
                  const c = CHIP_CONFIG[item.type];
                  return (
                    <div key={`modal-${item.id}-${idx}`} className="rounded-xl border border-[#ede8e0] p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={cn("rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em]", c.bg)}>
                            {c.label} {item.number}
                          </span>
                          {item.edited && (
                            <span className="rounded bg-[#f0ede8] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#8b8498]">
                              editado
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => startEdit(item)}
                          className="rounded-lg border border-[#d8d2ca] px-2.5 py-1 text-xs font-medium text-[#625d6d] transition-colors hover:border-[#9b8ec4] hover:bg-[#f6f4fb] hover:text-[#4a3f6b]"
                        >
                          Editar
                        </button>
                      </div>
                      {item.title && (
                        <p className="mb-3 text-center text-base font-bold text-[#171422]">{item.title}</p>
                      )}
                      <div className="prose-studio max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.body}</ReactMarkdown>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer — solo en modo edición */}
        {editingItem && (
          <div className="shrink-0 border-t border-[#ede8e0] px-6 py-4 flex items-center justify-end gap-3">
            <button
              onClick={cancelEdit}
              className="rounded-lg border border-[#d8d2ca] px-4 py-2 text-sm font-medium text-[#625d6d] transition-colors hover:bg-[#f0ede8]"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-[#171422] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#2d2740] disabled:opacity-50"
            >
              {saving ? "Guardando…" : "Guardar"}
            </button>
          </div>
        )}
      </motion.div>
    </div>,
    document.body,
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function CalendarView({ contentItems: initialItems, briefMensual = "", createdAt }: CalendarViewProps) {
  const [items, setItems] = useState<ContentItem[]>(initialItems);
  const [modalDay, setModalDay] = useState<number | null>(null);
  const [unscheduledOpen, setUnscheduledOpen] = useState(false);

  // Sync when parent re-fetches (e.g. on first load after lazy migration)
  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const { month, year } = useMemo(
    () => extractMonthYear(briefMensual, createdAt),
    [briefMensual, createdAt],
  );

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const { dayMap, unscheduled } = useMemo(() => {
    const map = new Map<number, ContentItem[]>();
    const unsched: ContentItem[] = [];

    for (const item of items) {
      if (item.suggestedDate) {
        const day = dayFromSuggestedDate(item.suggestedDate);
        if (day !== null && day >= 1 && day <= daysInMonth) {
          const prev = map.get(day) ?? [];
          map.set(day, [...prev, item]);
        } else {
          unsched.push(item);
        }
      } else {
        unsched.push(item);
      }
    }

    return { dayMap: map, unscheduled: unsched };
  }, [items, daysInMonth]);

  function handleItemUpdate(updated: ContentItem) {
    setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
  }

  function handleItemDelete(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  // Grid: week starts on Monday
  const firstDayJs = new Date(year, month, 1).getDay();
  const startOffset = (firstDayJs + 6) % 7;
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
            <div key={h} className="py-2 text-center text-[10px] font-semibold uppercase tracking-[0.1em] text-[#8b8498]">
              {h}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {Array.from({ length: totalCells }).map((_, cellIdx) => {
            const day = cellIdx - startOffset + 1;
            const isValidDay = day >= 1 && day <= daysInMonth;
            const cellItems = isValidDay ? (dayMap.get(day) ?? []) : [];
            const hasItems = cellItems.length > 0;
            const isClickable = isValidDay && hasItems;
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
                  isClickable && "cursor-pointer transition-colors duration-100 hover:bg-[#faf8f4]",
                )}
              >
                {isValidDay && (
                  <>
                    <p className={cn("mb-1 text-xs font-medium leading-none", hasItems ? "text-[#171422]" : "text-[#c4bfba]")}>
                      {day}
                    </p>
                    <div className="space-y-0.5">
                      {cellItems.slice(0, 3).map((item, i) => {
                        const cfg = CHIP_CONFIG[item.type];
                        return (
                          <div
                            key={`chip-${i}`}
                            className={cn(
                              "flex items-center gap-1 truncate rounded px-1 py-px text-[9px] font-semibold leading-tight md:text-[10px]",
                              cfg.bg,
                            )}
                          >
                            <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", cfg.dot)} />
                            <span className="truncate">{cfg.label} {item.number}</span>
                            {item.edited && (
                              <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-40" />
                            )}
                          </div>
                        );
                      })}
                      {cellItems.length > 3 && (
                        <p className="pl-1 text-[9px] text-[#8b8498]">+{cellItems.length - 3} más</p>
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
              width="14" height="14" viewBox="0 0 14 14" fill="none"
              className={cn("transition-transform duration-200", unscheduledOpen && "rotate-180")}
            >
              <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
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
                  {unscheduled.map((item, idx) => {
                    const cfg = CHIP_CONFIG[item.type];
                    return (
                      <div key={`unsched-${idx}`} className="rounded-lg border border-[#ede8e0] p-3">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em]", cfg.bg)}>
                            {cfg.label} {item.number}
                          </span>
                          {item.edited && (
                            <span className="rounded bg-[#f0ede8] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#8b8498]">
                              editado
                            </span>
                          )}
                        </div>
                        <div className="prose-studio max-w-none text-sm">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.body}</ReactMarkdown>
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

      {/* Modal */}
      <AnimatePresence>
        {modalDay !== null && (
          <ItemModal
            day={modalDay}
            month={month}
            year={year}
            items={modalItems}
            onItemUpdate={handleItemUpdate}
            onItemDelete={handleItemDelete}
            onClose={() => setModalDay(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
