"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import type { Brand } from "@/lib/types";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import {
  loadGenerateDraft,
  saveGenerateDraft,
} from "@/lib/generateDraft";
import { cn } from "@/lib/utils";
import { staggerContainer, staggerItem } from "@/lib/motion";

export interface GenerationParams {
  briefMensual: string;
  cantReels: number;
  cantCarruseles: number;
  cantHistorias: number;
}

interface GenerationFormProps {
  brand: Brand;
  onGenerate: (params: GenerationParams) => void;
  isLoading?: boolean;
}

type VolumeKey = "cantReels" | "cantCarruseles" | "cantHistorias";

const FORMATS: { key: VolumeKey; label: string; desc: string }[] = [
  { key: "cantReels", label: "Reels", desc: "Videos cortos" },
  { key: "cantCarruseles", label: "Carruseles", desc: "Posts multi-slide" },
  { key: "cantHistorias", label: "Historias", desc: "Stories" },
];

const DEFAULT_VOLUME: Record<VolumeKey, number> = {
  cantReels: 5,
  cantCarruseles: 5,
  cantHistorias: 10,
};

function countContextSections(brand: Brand): number {
  let count = 0;
  if (brand.briefPermanente.trim()) count++;
  if (brand.analisisRedes.trim()) count++;
  if (brand.vocabulario.usa.trim()) count++;
  if (brand.vocabulario.evita.trim()) count++;
  return count;
}

function getInitialFormState(brandId: string) {
  const draft = loadGenerateDraft(brandId);
  if (!draft) {
    return { briefMensual: "", volume: DEFAULT_VOLUME };
  }

  return {
    briefMensual: draft.briefMensual,
    volume: {
      cantReels: draft.cantReels,
      cantCarruseles: draft.cantCarruseles,
      cantHistorias: draft.cantHistorias,
    },
  };
}

export function GenerationForm({
  brand,
  onGenerate,
  isLoading = false,
}: GenerationFormProps) {
  const router = useRouter();
  const initialState = getInitialFormState(brand.id);
  const [briefMensual, setBriefMensual] = useState(initialState.briefMensual);
  const [volume, setVolume] = useState(initialState.volume);
  const [contextOpen, setContextOpen] = useState(false);

  const canGenerate = briefMensual.trim().length > 0 && !isLoading;
  const contextSections = countContextSections(brand);

  useEffect(() => {
    saveGenerateDraft(brand.id, { briefMensual, ...volume });
  }, [brand.id, briefMensual, volume]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canGenerate) return;
    onGenerate({ briefMensual, ...volume });
  }

  function setVol(key: VolumeKey, val: number) {
    setVolume((prev) => ({ ...prev, [key]: Math.max(1, Math.min(30, val)) }));
  }

  function handleEditContext() {
    router.push(`/brands/${brand.id}/edit?from=generate`);
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-8"
    >
      <motion.section
        variants={staggerItem}
        className="overflow-hidden rounded-xl border border-[#e5ded5] bg-[#faf8f4]"
      >
        <div className="flex items-center gap-2 px-4 py-3">
          <button
            type="button"
            onClick={() => setContextOpen((open) => !open)}
            className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 text-left"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              className={cn(
                "shrink-0 text-[#625d6d] transition-transform duration-200",
                contextOpen && "rotate-90"
              )}
            >
              <path
                d="M5 3l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-[#171422]">
                Contexto de marca
              </span>
              <span className="block truncate text-xs text-[#8b8498]">
                {brand.name} · {contextSections}{" "}
                {contextSections === 1 ? "sección cargada" : "secciones cargadas"}
              </span>
            </span>
          </button>
          <button
            type="button"
            onClick={handleEditContext}
            className="shrink-0 cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold text-[#625d6d] transition-colors hover:bg-[#eeeae3] hover:text-[#171422]"
          >
            Editar contexto
          </button>
        </div>

        <AnimatePresence initial={false}>
          {contextOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="max-h-60 space-y-4 overflow-y-auto border-t border-[#ebe5dc] px-4 py-4">
                {brand.briefPermanente && (
                  <div>
                    <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8b8498]">
                      Brief permanente
                    </p>
                    <p className="text-sm leading-6 text-[#625d6d]">
                      {brand.briefPermanente}
                    </p>
                  </div>
                )}

                {brand.analisisRedes && (
                  <div className="border-t border-[#ebe5dc] pt-4">
                    <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8b8498]">
                      Análisis de redes
                    </p>
                    <p className="text-sm leading-6 text-[#625d6d]">
                      {brand.analisisRedes}
                    </p>
                  </div>
                )}

                {(brand.vocabulario.usa || brand.vocabulario.evita) && (
                  <div className="grid gap-3 border-t border-[#ebe5dc] pt-4 sm:grid-cols-2">
                    {brand.vocabulario.usa && (
                      <div>
                        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8b8498]">
                          Usa
                        </p>
                        <p className="text-sm leading-6 text-[#625d6d]">
                          {brand.vocabulario.usa}
                        </p>
                      </div>
                    )}
                    {brand.vocabulario.evita && (
                      <div>
                        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8b8498]">
                          Evita
                        </p>
                        <p className="text-sm leading-6 text-[#625d6d]">
                          {brand.vocabulario.evita}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {contextSections === 0 && (
                  <p className="text-sm text-[#8b8498]">
                    Sin contexto cargado todavía.
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>

      <motion.section
        variants={staggerItem}
        className="rounded-2xl border border-[#cfc7bd] bg-white p-5 shadow-sm md:p-6"
      >
        <div className="mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#171422]">
              Brief del mes
            </p>
            <span className="rounded-full bg-[#171422] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
              Requerido
            </span>
          </div>
          <p className="mt-2 text-sm leading-6 text-[#625d6d]">
            ¿Qué pasa este mes? Lanzamientos, promociones, foco, fechas clave y
            temas a destacar o evitar.
          </p>
        </div>

        <Textarea
          value={briefMensual}
          onChange={(e) => setBriefMensual(e.target.value)}
          rows={7}
          placeholder="Ej: Lanzamiento de colección otoño, promo 2x1 en carruseles, foco en beneficios del calzado barefoot..."
          className="border-[#cfc7bd] focus:border-[#171422]/45 focus:ring-[#171422]/15"
        />

        {!canGenerate && !isLoading && (
          <p className="mt-3 text-xs font-medium text-[#8b8498]">
            Completá el brief del mes para continuar.
          </p>
        )}
      </motion.section>

      <motion.section variants={staggerItem}>
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8b8498]">
          Volumen del mes
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {FORMATS.map(({ key, label, desc }) => (
            <div
              key={key}
              className="flex flex-col gap-3 rounded-2xl border border-[#ded8cf] bg-white p-4 shadow-sm"
            >
              <div className="text-center">
                <p className="text-sm font-semibold text-[#171422]">{label}</p>
                <p className="text-[11px] text-[#8b8498]">{desc}</p>
              </div>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setVol(key, volume[key] - 1)}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-[#ded8cf] bg-[#faf8f4] text-lg leading-none font-medium text-[#625d6d] transition-all hover:bg-[#eeeae3] hover:text-[#171422]"
                >
                  −
                </button>
                <span className="font-display text-lg font-bold tabular-nums text-[#171422]">
                  {volume[key]}
                </span>
                <button
                  type="button"
                  onClick={() => setVol(key, volume[key] + 1)}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-[#ded8cf] bg-[#faf8f4] text-lg leading-none font-medium text-[#625d6d] transition-all hover:bg-[#eeeae3] hover:text-[#171422]"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      <motion.div variants={staggerItem}>
      <Button
        type="submit"
        size="lg"
        loading={isLoading}
        disabled={!canGenerate}
        className="w-full justify-center"
      >
        {!isLoading && (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M8 2l6 6-6 6M2 8h12"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
        {isLoading ? "Generando programación…" : "Generar programación completa"}
      </Button>
      </motion.div>
    </motion.form>
  );
}
