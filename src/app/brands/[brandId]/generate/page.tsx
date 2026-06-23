"use client";

import { use, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useBrands } from "@/hooks/useBrands";
import { useGenerations } from "@/hooks/useGenerations";
import {
  GenerationForm,
  type GenerationParams,
} from "@/components/generations/GenerationForm";
import { GenerationOutput } from "@/components/generations/GenerationOutput";

const BRAND_COLORS = [
  "#4f7eff", "#9747ff", "#06b6d4", "#10b981",
  "#f59e0b", "#ec4899", "#f97316",
];

function getBrandColor(name: string): string {
  const hash = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return BRAND_COLORS[hash % BRAND_COLORS.length];
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

  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [saved, setSaved] = useState(false);

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

  async function handleGenerate(genParams: GenerationParams) {
    setOutput("");
    setSaved(false);
    setIsLoading(true);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          briefPermanente: brand!.briefPermanente,
          analisisRedes: brand!.analisisRedes,
          vocabularioUsa: brand!.vocabulario.usa,
          vocabularioEvita: brand!.vocabulario.evita,
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
        const chunk = decoder.decode(value, { stream: true });
        fullOutput += chunk;
        setOutput((prev) => prev + chunk);
      }

      await createGeneration({
        brandId,
        briefMensual: genParams.briefMensual,
        cantReels: genParams.cantReels,
        cantCarruseles: genParams.cantCarruseles,
        cantHistorias: genParams.cantHistorias,
        output: fullOutput,
      });
      setSaved(true);
    } catch (error) {
      setOutput(
        `Error: ${error instanceof Error ? error.message : "Error desconocido"}`
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-full px-4 md:px-8 py-8 max-w-3xl mx-auto"
    >
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push(`/brands/${brandId}`)}
          className="flex items-center gap-2 text-[#4a5064] hover:text-white transition-colors mb-5 text-sm"
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
          Volver a {brand.name}
        </button>

        <div className="flex items-center gap-3">
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
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-white leading-tight">
              Nueva programación
            </h1>
            <p className="text-sm text-[#4a5064]">{brand.name}</p>
          </div>
        </div>
      </div>

      <GenerationForm
        brand={brand}
        brandColor={color}
        onGenerate={handleGenerate}
        isLoading={isLoading}
      />

      {saved && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex items-center gap-2 text-xs text-[#4a5064]"
        >
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Guardada en el historial de {brand.name}
        </motion.div>
      )}

      <GenerationOutput output={output} isLoading={isLoading} />
    </motion.div>
  );
}
