"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useBrands } from "@/hooks/useBrands";
import { useGenerations } from "@/hooks/useGenerations";
import {
  GenerationForm,
  type GenerationParams,
} from "@/components/generations/GenerationForm";
import { GenerationOutput } from "@/components/generations/GenerationOutput";
import { LoadingState } from "@/components/ui/LoadingState";
import { StatusBanner } from "@/components/ui/StatusBanner";
import { clearGenerateDraft } from "@/lib/generateDraft";
import { getBrandColor } from "@/lib/brandColors";

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
  const [hasError, setHasError] = useState(false);

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

  const activeBrand = brand;
  const color = getBrandColor(activeBrand.name);

  async function handleGenerate(genParams: GenerationParams) {
    setOutput("");
    setSaved(false);
    setHasError(false);
    setIsLoading(true);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          briefPermanente: activeBrand.briefPermanente,
          analisisRedes: activeBrand.analisisRedes,
          vocabularioUsa: activeBrand.vocabulario.usa,
          vocabularioEvita: activeBrand.vocabulario.evita,
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
      clearGenerateDraft(brandId);
    } catch (error) {
      setHasError(true);
      setOutput(
        `Error: ${error instanceof Error ? error.message : "Error desconocido"}`
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto min-h-full max-w-4xl px-4 py-8 md:px-8 md:py-10">
      <div className="mb-8">
        <button
          onClick={() => router.push(`/brands/${brandId}`)}
          className="mb-5 flex cursor-pointer items-center gap-2 text-sm text-[#645f72] transition-colors hover:text-[#171422]"
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

        <div className="text-center">
          <p className="text-base font-medium text-[#625d6d] md:text-lg">
            Nueva programación
          </p>
          <div className="mt-3 flex items-center justify-center gap-3">
            <span
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ background: color }}
            />
            <h1 className="font-display text-3xl font-bold leading-tight tracking-[-0.03em] text-[#171422] md:text-5xl">
              {brand.name}
            </h1>
          </div>
        </div>
      </div>

      <GenerationForm
        brand={brand}
        onGenerate={handleGenerate}
        isLoading={isLoading}
      />

      <StatusBanner
        show={saved}
        message={`Programación guardada en el historial de ${brand.name}`}
        className="mt-4"
      />
      <StatusBanner
        show={hasError && !isLoading}
        status="error"
        message="No se pudo completar la generación. Revisá el output o intentá de nuevo."
        className="mt-4"
      />

      <GenerationOutput output={output} isLoading={isLoading} />
    </div>
  );
}
