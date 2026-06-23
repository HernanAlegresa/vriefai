"use client";

import { use, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useBrands } from "@/hooks/useBrands";
import { useGenerations } from "@/hooks/useGenerations";
import { GenerationCard } from "@/components/generations/GenerationCard";
import { Button } from "@/components/ui/Button";

const BRAND_COLORS = [
  "#4f7eff", "#9747ff", "#06b6d4", "#10b981",
  "#f59e0b", "#ec4899", "#f97316",
];

function getBrandColor(name: string): string {
  const hash = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return BRAND_COLORS[hash % BRAND_COLORS.length];
}

export default function BrandDetailPage({
  params,
}: {
  params: Promise<{ brandId: string }>;
}) {
  const { brandId } = use(params);
  const router = useRouter();
  const { getBrand, deleteBrand, loading: brandsLoading } = useBrands();
  const { generations, deleteGeneration, deleteGenerationsForBrand } =
    useGenerations(brandId);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const brand = getBrand(brandId);

  if (brandsLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-[#3a4060] text-sm">
        Cargando…
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="flex items-center justify-center h-64 text-[#3a4060] text-sm">
        Marca no encontrada
      </div>
    );
  }

  const color = getBrandColor(brand.name);
  const sorted = [...generations].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  async function handleDeleteBrand() {
    deleteGenerationsForBrand(brandId);
    await deleteBrand(brandId);
    router.push("/brands");
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-full px-4 md:px-8 py-8 max-w-5xl mx-auto"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => router.push("/brands")}
            className="p-2 rounded-lg text-[#4a5064] hover:text-white hover:bg-white/5 transition-colors shrink-0"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M10 3L5 8l5 5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Brand avatar + name */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold font-display shrink-0"
            style={{
              background: `${color}18`,
              border: `1.5px solid ${color}35`,
              color,
            }}
          >
            {brand.name[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-xl md:text-2xl font-bold text-white leading-tight truncate">
              {brand.name}
            </h1>
            <p className="text-xs text-[#4a5064]">
              {sorted.length} {sorted.length === 1 ? "programación" : "programaciones"}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.push(`/brands/${brandId}/edit`)}
          >
            Editar
          </Button>
          <Button
            size="md"
            onClick={() => router.push(`/brands/${brandId}/generate`)}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M7 2v10M2 7h10"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
            Nueva programación
          </Button>
          <button
            onClick={() => setConfirmDelete(!confirmDelete)}
            className="px-3.5 py-1.5 text-xs font-medium rounded-lg text-[#4a5064] hover:text-red-400 hover:bg-red-950/20 transition-colors"
          >
            {confirmDelete ? "Cancelar" : "Eliminar"}
          </button>
        </div>
      </div>

      {/* Delete confirmation */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-red-950/15 border border-red-500/20 rounded-2xl px-5 py-4">
              <div>
                <p className="text-sm font-semibold text-red-300">
                  ¿Eliminar {brand.name}?
                </p>
                <p className="text-xs text-red-500/60 mt-0.5">
                  Se eliminarán todas las programaciones guardadas. Acción irreversible.
                </p>
              </div>
              <Button
                variant="danger"
                size="sm"
                className="border border-red-700/40 bg-red-950/30 hover:bg-red-900/40 shrink-0"
                onClick={handleDeleteBrand}
              >
                Sí, eliminar marca
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Brand context */}
      <div className="bg-[#0a0c1b] border border-white/6 rounded-2xl p-5 md:p-6 mb-8">
        <div className="flex items-center gap-2 mb-5">
          <div
            className="w-1.5 h-4 rounded-full"
            style={{ background: color }}
          />
          <p className="text-[11px] font-semibold text-[#4a5064] uppercase tracking-widest">
            Contexto de la marca
          </p>
        </div>

        <div className="space-y-5">
          {brand.briefPermanente && (
            <div>
              <p className="text-[11px] font-semibold text-[#3a4060] uppercase tracking-wider mb-2">
                Brief permanente
              </p>
              <p className="text-sm text-[#7880a8] font-mono whitespace-pre-wrap leading-relaxed line-clamp-4">
                {brand.briefPermanente}
              </p>
            </div>
          )}

          {brand.analisisRedes && (
            <div className="pt-4 border-t border-white/5">
              <p className="text-[11px] font-semibold text-[#3a4060] uppercase tracking-wider mb-2">
                Análisis de redes
              </p>
              <p className="text-sm text-[#7880a8] font-mono line-clamp-3 leading-relaxed">
                {brand.analisisRedes.slice(0, 300)}
                {brand.analisisRedes.length > 300 ? "…" : ""}
              </p>
            </div>
          )}

          {(brand.vocabulario.usa || brand.vocabulario.evita) && (
            <div className="pt-4 border-t border-white/5 grid grid-cols-2 gap-6">
              {brand.vocabulario.usa && (
                <div>
                  <p className="text-[11px] font-semibold text-[#3a4060] uppercase tracking-wider mb-2">
                    Usa
                  </p>
                  <p className="text-xs text-[#7880a8] font-mono leading-relaxed">
                    {brand.vocabulario.usa}
                  </p>
                </div>
              )}
              {brand.vocabulario.evita && (
                <div>
                  <p className="text-[11px] font-semibold text-[#3a4060] uppercase tracking-wider mb-2">
                    Evita
                  </p>
                  <p className="text-xs text-[#7880a8] font-mono leading-relaxed">
                    {brand.vocabulario.evita}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Generation history */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-[11px] font-semibold text-[#3a4060] uppercase tracking-widest">
            Historial de programaciones
          </p>
          <span className="text-xs text-[#2a3048]">
            {sorted.length} {sorted.length === 1 ? "generación" : "generaciones"}
          </span>
        </div>

        {sorted.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center border border-dashed border-white/6 rounded-2xl">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
              style={{ background: `${color}12`, border: `1px solid ${color}25` }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path
                  d="M9 4v10M4 9h10"
                  stroke={color}
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <p className="text-sm text-[#4a5064] mb-5">
              Todavía no hay programaciones para esta marca.
            </p>
            <Button
              size="md"
              onClick={() => router.push(`/brands/${brandId}/generate`)}
            >
              Generar primera programación
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {sorted.map((gen) => (
              <GenerationCard
                key={gen.id}
                generation={gen}
                brandColor={color}
                onDelete={() => deleteGeneration(gen.id)}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
