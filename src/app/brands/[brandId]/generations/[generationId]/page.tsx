"use client";

import { use, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useBrands } from "@/hooks/useBrands";
import { useGenerations } from "@/hooks/useGenerations";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/LoadingState";
import { GenerationViewer } from "@/components/generations/GenerationViewer";
import { getBrandColor } from "@/lib/brandColors";
import { fadeUp, fadeUpTransition } from "@/lib/motion";
import { formatDate } from "@/lib/utils";

export default function GenerationDetailPage({
  params,
}: {
  params: Promise<{ brandId: string; generationId: string }>;
}) {
  const { brandId, generationId } = use(params);
  const router = useRouter();
  const { getBrand, loading: brandsLoading } = useBrands();
  const { getGeneration, loading: generationsLoading } = useGenerations(brandId);
  const [copied, setCopied] = useState(false);
  const [briefOpen, setBriefOpen] = useState(false);

  const brand = getBrand(brandId);
  const generation = getGeneration(generationId);

  if (brandsLoading || generationsLoading) {
    return <LoadingState label="Cargando programación..." />;
  }

  if (!brand || !generation) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-[#8b8498]">
        Programación no encontrada
      </div>
    );
  }

  const color = getBrandColor(brand.name);

  async function handleCopyOutput() {
    if (!generation) return;
    await navigator.clipboard.writeText(generation.output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  }

  return (
    <div className="min-h-full px-4 py-8 md:px-8 md:py-10">
      <div className="mx-auto max-w-5xl">
        <button
          onClick={() => router.push(`/brands/${brandId}`)}
          className="mb-6 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-[#625d6d] transition-colors hover:text-[#171422]"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Volver a {brand.name}
        </button>

        <motion.div
          initial={fadeUp.initial}
          animate={fadeUp.animate}
          transition={fadeUpTransition}
          className="overflow-hidden rounded-2xl border border-[#ded8cf] bg-white shadow-sm"
        >
          <div className="relative px-5 pb-5 pt-6 md:px-6 md:pb-6">
            <div
              className="absolute inset-x-0 top-0 h-1 rounded-t-2xl"
              style={{ background: color }}
            />

            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#8b8498]">
                  Programación mensual
                </p>
                <h1 className="font-display text-3xl font-bold tracking-[-0.03em] text-[#171422] md:text-4xl">
                  {formatDate(generation.createdAt)}
                </h1>
                <p className="mt-1.5 text-sm text-[#625d6d]">{brand.name}</p>
              </div>

              <Button
                variant="secondary"
                size="md"
                onClick={handleCopyOutput}
                className={copied ? "border-emerald-200 bg-emerald-50 text-emerald-700" : undefined}
              >
                {copied ? (
                  <>
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className="shrink-0">
                      <path d="M2 6.5l3 3 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Copiado
                  </>
                ) : (
                  "Copiar output"
                )}
              </Button>
            </div>

            <div className="mt-5 grid gap-2.5 sm:grid-cols-3">
              <Stat label="Reels" value={generation.cantReels} />
              <Stat label="Carruseles" value={generation.cantCarruseles} />
              <Stat label="Historias" value={generation.cantHistorias} />
            </div>

            {/* Brief del mes — colapsable */}
            {generation.briefMensual && (
              <div className="mt-4 overflow-hidden rounded-xl border border-[#ebe5dc] bg-[#faf8f4]">
                <button
                  onClick={() => setBriefOpen((p) => !p)}
                  className="flex w-full cursor-pointer items-center justify-between px-4 py-3 text-left"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8b8498]">
                    Brief del mes
                  </p>
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 14 14"
                    fill="none"
                    className={`shrink-0 text-[#8b8498] transition-transform duration-200 ${briefOpen ? "rotate-180" : ""}`}
                  >
                    <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {!briefOpen && (
                  <p className="line-clamp-2 whitespace-pre-wrap px-4 pb-3 text-sm leading-6 text-[#625d6d]">
                    {generation.briefMensual}
                  </p>
                )}

                <AnimatePresence initial={false}>
                  {briefOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="whitespace-pre-wrap px-4 pb-4 text-sm leading-6 text-[#625d6d]">
                        {generation.briefMensual}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
          className="mt-3 rounded-2xl border border-[#ded8cf] bg-white shadow-sm"
        >
          <GenerationViewer
            output={generation.output}
            briefMensual={generation.briefMensual}
            createdAt={generation.createdAt}
          />
        </motion.div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-[#ebe5dc] bg-[#faf8f4] px-4 py-3">
      <p className="text-xs font-medium text-[#8b8498]">{label}</p>
      <p className="mt-0.5 font-display text-2xl font-bold text-[#171422]">{value}</p>
    </div>
  );
}
