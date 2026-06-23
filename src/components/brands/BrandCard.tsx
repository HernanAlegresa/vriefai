"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { Brand } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

const BRAND_COLORS = [
  "#4f7eff",
  "#9747ff",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#ec4899",
  "#f97316",
];

function getBrandColor(name: string): string {
  const hash = name
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return BRAND_COLORS[hash % BRAND_COLORS.length];
}

interface BrandCardProps {
  brand: Brand;
  generationCount: number;
  onDelete: () => void;
}

export function BrandCard({ brand, generationCount, onDelete }: BrandCardProps) {
  const router = useRouter();
  const color = getBrandColor(brand.name);
  const [armedDelete, setArmedDelete] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  function handleDeleteClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (armedDelete) {
      clearTimeout(resetTimer.current);
      onDelete();
    } else {
      setArmedDelete(true);
      resetTimer.current = setTimeout(() => setArmedDelete(false), 2500);
    }
  }

  function handleEditClick(e: React.MouseEvent) {
    e.stopPropagation();
    router.push(`/brands/${brand.id}/edit`);
  }

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.005 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      onClick={() => router.push(`/brands/${brand.id}`)}
      className={cn(
        "relative bg-[#0a0c1b] rounded-2xl p-5 cursor-pointer overflow-hidden group",
        "border transition-all duration-200",
        armedDelete
          ? "border-red-500/40 shadow-lg shadow-red-950/20"
          : "border-white/6 hover:border-white/14 hover:shadow-xl"
      )}
      style={{
        boxShadow: armedDelete ? undefined : `0 0 0 0 transparent`,
      }}
      onMouseEnter={(e) => {
        if (!armedDelete) {
          (e.currentTarget as HTMLDivElement).style.boxShadow = `0 12px 40px ${color}12`;
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
      }}
    >
      {/* Top color bar */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] opacity-50 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `linear-gradient(90deg, ${color}, ${color}00)`,
        }}
      />

      {/* Action buttons — appear on hover */}
      <div
        className="absolute top-3.5 right-3.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleEditClick}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-[#4a5064] hover:text-[#a8b3cc] hover:bg-white/6 transition-all"
          title="Editar marca"
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path
              d="M9 1.5L11.5 4 4.5 11H2V8.5L9 1.5Z"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button
          onClick={handleDeleteClick}
          className={cn(
            "w-7 h-7 rounded-lg flex items-center justify-center transition-all",
            armedDelete
              ? "text-red-400 bg-red-950/40 scale-110"
              : "text-[#4a5064] hover:text-red-400 hover:bg-red-950/20"
          )}
          title={armedDelete ? "Confirmar eliminación" : "Eliminar marca"}
        >
          {armedDelete ? (
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path
                d="M2.5 6.5l3 3 5-5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path
                d="M2 3.5h9M4.5 3.5V2.5H8.5V3.5M5 6V9.5M8 6V9.5M3 3.5L3.5 10.5H9.5L10 3.5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Brand avatar + name */}
      <div className="flex items-start gap-3 mb-4 pr-16">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 font-display"
          style={{
            background: `${color}15`,
            border: `1.5px solid ${color}30`,
            color,
          }}
        >
          {brand.name[0]?.toUpperCase()}
        </div>
        <div className="min-w-0 pt-0.5">
          <h2 className="font-display text-[15px] font-bold text-white leading-tight truncate group-hover:text-white transition-colors">
            {brand.name}
          </h2>
          {armedDelete && (
            <motion.p
              initial={{ opacity: 0, y: -3 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[11px] text-red-400 mt-0.5"
            >
              Clic en ✓ para confirmar
            </motion.p>
          )}
        </div>
      </div>

      {/* Brief excerpt */}
      {brand.briefPermanente && (
        <p className="text-xs text-[#4a5064] line-clamp-2 mb-4 leading-relaxed font-mono">
          {brand.briefPermanente.slice(0, 110)}
          {brand.briefPermanente.length > 110 ? "…" : ""}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <span
          className="text-[11px] px-2.5 py-1 rounded-full font-semibold"
          style={{
            background: `${color}12`,
            border: `1px solid ${color}22`,
            color: `${color}`,
          }}
        >
          {generationCount}{" "}
          {generationCount === 1 ? "programación" : "programaciones"}
        </span>
        <span className="text-[11px] text-[#3a4060]">
          {formatDate(brand.updatedAt)}
        </span>
      </div>
    </motion.div>
  );
}
