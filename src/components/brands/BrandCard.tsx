"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { Brand } from "@/lib/types";
import { getBrandColor } from "@/lib/brandColors";
import { cn, formatDate } from "@/lib/utils";

interface BrandCardProps {
  brand: Brand;
  generationCount: number;
  latestGenerationAt?: string;
  onDelete: () => void;
}

function getDescription(brand: Brand): string {
  const source = brand.briefPermanente.trim() || brand.analisisRedes.trim();
  if (!source) return "Sin descripción cargada todavía.";
  return source.length > 160 ? `${source.slice(0, 160)}...` : source;
}

export function BrandCard({
  brand,
  generationCount,
  latestGenerationAt,
  onDelete,
}: BrandCardProps) {
  const router = useRouter();
  const color = getBrandColor(brand.name);
  const [armedDelete, setArmedDelete] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  function handleDeleteClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (armedDelete) {
      clearTimeout(resetTimer.current);
      onDelete();
      return;
    }

    setArmedDelete(true);
    resetTimer.current = setTimeout(() => setArmedDelete(false), 2500);
  }

  function handleEditClick(e: React.MouseEvent) {
    e.stopPropagation();
    router.push(`/brands/${brand.id}/edit`);
  }

  return (
    <motion.article
      whileHover={{ y: -1 }}
      transition={{ duration: 0.16, ease: "easeOut" }}
      onClick={() => router.push(`/brands/${brand.id}`)}
      className={cn(
        "group flex h-full cursor-pointer flex-col rounded-2xl border bg-white p-4 shadow-sm transition-all duration-200",
        armedDelete
          ? "border-red-300 shadow-red-100"
          : "border-[#ded8cf] hover:border-[#cfc7bd] hover:shadow-md"
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ background: color }}
          />
          <h2 className="truncate font-display text-lg font-bold leading-tight text-[#171422]">
            {brand.name}
          </h2>
        </div>

        <div className="flex shrink-0 items-center gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
          <button
            type="button"
            onClick={handleEditClick}
            className="rounded-lg px-2 py-1 text-[11px] font-semibold text-[#625d6d] transition-colors hover:bg-[#eeeae3] hover:text-[#171422]"
          >
            Editar
          </button>
          <button
            type="button"
            onClick={handleDeleteClick}
            className={cn(
              "rounded-lg px-2 py-1 text-[11px] font-semibold transition-colors",
              armedDelete
                ? "bg-red-50 text-red-700"
                : "text-[#8b8498] hover:bg-red-50 hover:text-red-700"
            )}
          >
            {armedDelete ? "Confirmar" : "Eliminar"}
          </button>
        </div>
      </div>

      <p className="mb-4 line-clamp-3 flex-1 text-sm leading-5 text-[#625d6d]">
        {getDescription(brand)}
      </p>

      {armedDelete && (
        <motion.p
          initial={{ opacity: 0, y: -2 }}
          animate={{ opacity: 1, y: 0 }}
          className="-mt-2 mb-3 text-[11px] font-medium text-red-600"
        >
          Volvé a hacer clic en eliminar para confirmar.
        </motion.p>
      )}

      <div className="mt-auto grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-[#ebe5dc] bg-[#faf8f4] px-3 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#8b8498]">
            Programaciones
          </p>
          <p className="mt-0.5 text-sm font-semibold text-[#171422]">
            {generationCount}
          </p>
        </div>

        <div className="rounded-lg border border-[#ebe5dc] bg-[#faf8f4] px-3 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#8b8498]">
            Última
          </p>
          <p className="mt-0.5 truncate text-sm font-semibold text-[#171422]">
            {latestGenerationAt
              ? formatDate(latestGenerationAt)
              : "Sin datos"}
          </p>
        </div>
      </div>
    </motion.article>
  );
}
