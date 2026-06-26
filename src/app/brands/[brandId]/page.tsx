"use client";

import { use, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useBrands } from "@/hooks/useBrands";
import { useGenerations } from "@/hooks/useGenerations";
import { GenerationCard } from "@/components/generations/GenerationCard";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/LoadingState";
import { getBrandColor } from "@/lib/brandColors";
import { staggerContainer, staggerItem } from "@/lib/motion";

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
  const sorted = useMemo(
    () =>
      [...generations].sort((a, b) => {
        if ((b.year ?? 0) !== (a.year ?? 0)) return (b.year ?? 0) - (a.year ?? 0);
        if ((b.month ?? 0) !== (a.month ?? 0)) return (b.month ?? 0) - (a.month ?? 0);
        return a.version.localeCompare(b.version);
      }),
    [generations]
  );

  if (brandsLoading) {
    return <LoadingState label="Cargando marca..." />;
  }

  if (!brand) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-[#8b8498]">
        Marca no encontrada
      </div>
    );
  }

  const color = getBrandColor(brand.name);

  async function handleDeleteBrand() {
    deleteGenerationsForBrand(brandId);
    await deleteBrand(brandId);
    router.push("/brands");
  }

  return (
    <div className="min-h-full px-4 py-8 md:px-8 md:py-10">
      <div className="mx-auto max-w-6xl">
        <button
          onClick={() => router.push("/brands")}
          className="mb-6 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-[#625d6d] transition-colors hover:text-[#171422]"
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
          Volver a marcas
        </button>

        <header className="mb-10 md:mb-12">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: color }}
                />
                <h1 className="truncate font-display text-3xl font-bold leading-tight text-[#171422] md:text-4xl">
                  {brand.name}
                </h1>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
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
              <Button
                variant="ghost"
                size="md"
                onClick={() => setConfirmDelete(!confirmDelete)}
              >
                {confirmDelete ? "Cancelar" : "Eliminar"}
              </Button>
            </div>
          </div>
        </header>

        <AnimatePresence>
          {confirmDelete && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="mb-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-4"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-red-700">
                    ¿Eliminar {brand.name}?
                  </p>
                  <p className="mt-0.5 text-xs text-red-600/75">
                    Se eliminarán todas las programaciones guardadas. Acción
                    irreversible.
                  </p>
                </div>
                <Button variant="danger" size="sm" onClick={handleDeleteBrand}>
                  Sí, eliminar marca
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(260px,300px)_minmax(0,1fr)] lg:gap-10">
          <section className="lg:pr-2">
            <div className="mb-7 flex items-center justify-between gap-3 md:mb-8">
              <h2 className="font-display text-xl font-bold text-[#171422]">
                Programaciones
              </h2>
              <span className="rounded-full border border-[#cfc7bd] bg-white px-2.5 py-1 text-xs font-semibold text-[#171422]">
                {sorted.length}
              </span>
            </div>

            {sorted.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#d8d2ca] bg-[#faf8f4] px-6 py-14 text-center">
                <h3 className="font-display text-xl font-bold text-[#171422]">
                  Sin programaciones todavía
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#625d6d]">
                  Generá la primera programación mensual para que aparezca en el
                  historial de esta marca.
                </p>
                <Button
                  size="md"
                  className="mt-5"
                  onClick={() => router.push(`/brands/${brandId}/generate`)}
                >
                  Generar primera programación
                </Button>
              </div>
            ) : (
              <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="space-y-2.5"
              >
                {sorted.map((generation) => (
                  <motion.div key={generation.id} variants={staggerItem}>
                    <GenerationCard
                      generation={generation}
                      brandColor={color}
                      compact
                      onSelect={() =>
                        router.push(
                          `/brands/${brandId}/generations/${generation.id}`
                        )
                      }
                      onDelete={() => deleteGeneration(generation.id)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </section>

          <aside className="flex flex-col rounded-2xl border border-[#ded8cf] bg-white p-5 shadow-sm lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)]">
            <div className="mb-4 flex shrink-0 items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8b8498]">
                  Contexto
                </p>
                <h2 className="mt-1 font-display text-2xl font-bold text-[#171422]">
                  Base de marca
                </h2>
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="shrink-0"
                onClick={() => router.push(`/brands/${brandId}/edit`)}
              >
                Editar contexto
              </Button>
            </div>

            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto pr-1">
              {brand.briefPermanente ? (
                <div>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8b8498]">
                    Brief permanente
                  </p>
                  <p className="text-sm leading-6 text-[#625d6d]">
                    {brand.briefPermanente}
                  </p>
                </div>
              ) : (
                <p className="text-sm leading-6 text-[#8b8498]">
                  Sin brief permanente cargado.
                </p>
              )}

              {brand.analisisRedes && (
                <div className="border-t border-[#eee8df] pt-5">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8b8498]">
                    Análisis de redes
                  </p>
                  <p className="text-sm leading-6 text-[#625d6d]">
                    {brand.analisisRedes}
                  </p>
                </div>
              )}

              {(brand.vocabulario.usa || brand.vocabulario.evita) && (
                <div className="grid gap-3 border-t border-[#eee8df] pt-5 sm:grid-cols-2">
                  {brand.vocabulario.usa && (
                    <div className="rounded-xl border border-[#ebe5dc] bg-[#faf8f4] p-3">
                      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8b8498]">
                        Usa
                      </p>
                      <p className="text-sm leading-6 text-[#625d6d]">
                        {brand.vocabulario.usa}
                      </p>
                    </div>
                  )}
                  {brand.vocabulario.evita && (
                    <div className="rounded-xl border border-[#ebe5dc] bg-[#faf8f4] p-3">
                      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8b8498]">
                        Evita
                      </p>
                      <p className="text-sm leading-6 text-[#625d6d]">
                        {brand.vocabulario.evita}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
