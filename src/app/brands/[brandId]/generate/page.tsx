"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useBrands } from "@/hooks/useBrands";
import { useGenerations } from "@/hooks/useGenerations";
import {
  GenerationForm,
  type GenerationParams,
} from "@/components/generations/GenerationForm";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/LoadingState";
import { StatusBanner } from "@/components/ui/StatusBanner";
import { clearGenerateDraft } from "@/lib/generateDraft";
import { getBrandColor } from "@/lib/brandColors";
import type { Generation } from "@/lib/types";

const MONTHS_ES = [
  "enero","febrero","marzo","abril","mayo","junio",
  "julio","agosto","septiembre","octubre","noviembre","diciembre",
];

function extractMonth(brief: string): string | null {
  const lower = brief.toLowerCase();
  let lastIdx = -1;
  let result: string | null = null;
  for (const m of MONTHS_ES) {
    const idx = lower.lastIndexOf(m);
    if (idx > lastIdx) { lastIdx = idx; result = m.charAt(0).toUpperCase() + m.slice(1); }
  }
  return result;
}

function extractMonthYear(brief: string): { month: number | null; year: number } {
  const lower = brief.toLowerCase();
  let lastIdx = -1;
  let monthNum: number | null = null;
  for (let i = 0; i < MONTHS_ES.length; i++) {
    const idx = lower.lastIndexOf(MONTHS_ES[i]);
    if (idx > lastIdx) { lastIdx = idx; monthNum = i + 1; }
  }
  return { month: monthNum, year: new Date().getFullYear() };
}

export default function GeneratePage({
  params,
}: {
  params: Promise<{ brandId: string }>;
}) {
  const { brandId } = use(params);
  const router = useRouter();
  const { getBrand, loading: brandsLoading } = useBrands();
  const { createGeneration } = useGenerations();

  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState<false | "generic" | "duplicate">(false);
  const [submittedBrief, setSubmittedBrief] = useState("");
  const [savedGeneration, setSavedGeneration] = useState<Generation | null>(null);

  const brand = getBrand(brandId);

  if (brandsLoading) {
    return <LoadingState label="Preparando nueva programación..." />;
  }

  if (!brand) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-[#8b8498]">
        Marca no encontrada
      </div>
    );
  }

  const color = getBrandColor(brand.name);

  async function handleGenerate(genParams: GenerationParams) {
    if (!brand) return;
    setSubmittedBrief(genParams.briefMensual);
    setSavedGeneration(null);
    setHasError(false);
    setIsLoading(true);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          briefPermanente: brand.briefPermanente,
          analisisRedes: brand.analisisRedes,
          vocabularioUsa: brand.vocabulario.usa,
          vocabularioEvita: brand.vocabulario.evita,
          briefMensual: genParams.briefMensual,
          cantReels: genParams.cantReels,
          cantCarruseles: genParams.cantCarruseles,
          cantHistorias: genParams.cantHistorias,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`Error ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullOutput = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullOutput += decoder.decode(value, { stream: true });
      }

      const { month, year } = extractMonthYear(genParams.briefMensual);
      const gen = await createGeneration({
        brandId,
        briefMensual: genParams.briefMensual,
        cantReels: genParams.cantReels,
        cantCarruseles: genParams.cantCarruseles,
        cantHistorias: genParams.cantHistorias,
        output: fullOutput,
        month,
        year,
      });
      clearGenerateDraft(brandId);
      setSavedGeneration(gen);
    } catch (err: unknown) {
      const supaErr = err as { code?: string };
      setHasError(supaErr?.code === "23505" ? "duplicate" : "generic");
    } finally {
      setIsLoading(false);
    }
  }

  const month = extractMonth(submittedBrief);
  const year = savedGeneration ? new Date(savedGeneration.createdAt).getFullYear() : null;
  const monthLabel = month && year ? `${month} ${year}` : month ?? null;

  return (
    <div className="mx-auto min-h-full max-w-4xl px-4 py-8 md:px-8 md:py-10">
      <div className="mb-8">
        <button
          onClick={() => router.push(`/brands/${brandId}`)}
          className="mb-5 flex cursor-pointer items-center gap-2 text-sm text-[#645f72] transition-colors hover:text-[#171422]"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Volver a {brand.name}
        </button>

        <div className="text-center">
          <p className="text-base font-medium text-[#625d6d] md:text-lg">
            Nueva programación
          </p>
          <div className="mt-3 flex items-center justify-center gap-3">
            <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: color }} />
            <h1 className="font-display text-3xl font-bold leading-tight tracking-[-0.03em] text-[#171422] md:text-5xl">
              {brand.name}
            </h1>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center gap-8 py-12"
          >
            <div className="flex items-center gap-2">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="h-2.5 w-2.5 rounded-full bg-[#171422]"
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.22, ease: "easeInOut" }}
                />
              ))}
            </div>

            <div className="w-full max-w-md text-center">
              <p className="font-display text-xl font-bold text-[#171422]">
                Generando la programación
              </p>
              <p className="mt-1.5 text-sm text-[#625d6d]">
                Esperá unos minutos mientras se genera la programación
              </p>
            </div>

            {submittedBrief && (
              <div className="w-full max-w-md rounded-xl border border-[#ebe5dc] bg-[#faf8f4] p-4">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8b8498]">
                  Brief del mes
                </p>
                <p className="line-clamp-4 whitespace-pre-wrap text-sm leading-6 text-[#625d6d]">
                  {submittedBrief}
                </p>
              </div>
            )}

            <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="shrink-0">
                <path d="M7.5 1.5L1 13.5h13L7.5 1.5zM7.5 6v3.5M7.5 11h.01" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              No cierres esta pestaña — tu programación se está generando
            </div>
          </motion.div>
        )}

        {!isLoading && savedGeneration && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center gap-6 py-12 text-center"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M5 12l5 5L19 7" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8b8498]">
                Programación generada
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold text-[#171422]">
                {monthLabel ?? brand.name}
              </h2>
              <p className="mt-1 text-sm text-[#625d6d]">{brand.name}</p>
            </div>

            <Button
              size="lg"
              onClick={() => router.push(`/brands/${brandId}/generations/${savedGeneration.id}`)}
            >
              Ver programación
            </Button>
          </motion.div>
        )}

        {!isLoading && !savedGeneration && (
          <motion.div key="form" initial={false} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <StatusBanner
              show={!!hasError}
              status="error"
              message={
                hasError === "duplicate"
                  ? "Ya existe una programación para esta marca en ese mes. Eliminá la actual antes de generar una nueva."
                  : "No se pudo completar la generación. Revisá tu conexión e intentá de nuevo."
              }
              className="mb-4"
            />
            <GenerationForm brand={brand} onGenerate={handleGenerate} isLoading={false} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
