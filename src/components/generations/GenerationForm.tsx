"use client";

import { useState } from "react";
import type { Brand } from "@/lib/types";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

export interface GenerationParams {
  briefMensual: string;
  cantReels: number;
  cantCarruseles: number;
  cantHistorias: number;
}

interface GenerationFormProps {
  brand: Brand;
  brandColor?: string;
  onGenerate: (params: GenerationParams) => void;
  isLoading?: boolean;
}

type VolumeKey = "cantReels" | "cantCarruseles" | "cantHistorias";

const FORMATS: { key: VolumeKey; label: string; desc: string }[] = [
  { key: "cantReels", label: "Reels", desc: "Videos cortos" },
  { key: "cantCarruseles", label: "Carruseles", desc: "Posts multi-slide" },
  { key: "cantHistorias", label: "Historias", desc: "Stories" },
];

export function GenerationForm({
  brand,
  brandColor = "#4f7eff",
  onGenerate,
  isLoading = false,
}: GenerationFormProps) {
  const [briefMensual, setBriefMensual] = useState("");
  const [volume, setVolume] = useState<Record<VolumeKey, number>>({
    cantReels: 5,
    cantCarruseles: 5,
    cantHistorias: 10,
  });

  const canGenerate = briefMensual.trim().length > 0 && !isLoading;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canGenerate) return;
    onGenerate({ briefMensual, ...volume });
  }

  function setVol(key: VolumeKey, val: number) {
    setVolume((prev) => ({ ...prev, [key]: Math.max(1, Math.min(30, val)) }));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Brand context pill */}
      <div
        className="p-4 rounded-2xl"
        style={{
          background: `${brandColor}08`,
          border: `1px solid ${brandColor}20`,
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold font-display"
            style={{
              background: `${brandColor}18`,
              border: `1px solid ${brandColor}30`,
              color: brandColor,
            }}
          >
            {brand.name[0]?.toUpperCase()}
          </div>
          <p
            className="text-[11px] font-semibold uppercase tracking-widest"
            style={{ color: `${brandColor}90` }}
          >
            Contexto cargado — {brand.name}
          </p>
        </div>

        <div className="space-y-2.5">
          {brand.briefPermanente && (
            <div>
              <p className="text-[10px] text-[#3a4060] mb-1 font-medium uppercase tracking-wider">
                Brief permanente
              </p>
              <p className="text-xs text-[#4a5064] font-mono line-clamp-2 leading-relaxed">
                {brand.briefPermanente.slice(0, 200)}
                {brand.briefPermanente.length > 200 ? "…" : ""}
              </p>
            </div>
          )}
          {(brand.vocabulario.usa || brand.vocabulario.evita) && (
            <div className="flex flex-wrap gap-4 pt-1">
              {brand.vocabulario.usa && (
                <div>
                  <p className="text-[10px] text-[#3a4060] mb-1 font-medium uppercase tracking-wider">
                    Usa
                  </p>
                  <p className="text-xs text-[#4a5064] font-mono">
                    {brand.vocabulario.usa.slice(0, 80)}
                  </p>
                </div>
              )}
              {brand.vocabulario.evita && (
                <div>
                  <p className="text-[10px] text-[#3a4060] mb-1 font-medium uppercase tracking-wider">
                    Evita
                  </p>
                  <p className="text-xs text-[#4a5064] font-mono">
                    {brand.vocabulario.evita.slice(0, 80)}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Brief del mes */}
      <Textarea
        label="Brief del mes"
        description="Lanzamientos, promociones, foco del mes, eventos relevantes, temas a destacar o evitar."
        value={briefMensual}
        onChange={(e) => setBriefMensual(e.target.value)}
        rows={6}
        placeholder="Lanzamientos, promociones, foco del mes, eventos relevantes, temas a destacar o evitar..."
      />

      {/* Volume controls */}
      <div>
        <p className="text-[11px] font-semibold text-[#3a4060] uppercase tracking-widest mb-4">
          Volumen del mes
        </p>
        <div className="grid grid-cols-3 gap-3">
          {FORMATS.map(({ key, label, desc }) => (
            <div
              key={key}
              className="bg-[#0a0c1b] border border-white/6 rounded-xl p-4 flex flex-col gap-3"
            >
              <div>
                <p className="text-sm font-semibold text-white">{label}</p>
                <p className="text-[11px] text-[#3a4060]">{desc}</p>
              </div>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setVol(key, volume[key] - 1)}
                  className="w-8 h-8 rounded-lg bg-white/4 border border-white/6 flex items-center justify-center text-[#4a5064] hover:text-white hover:bg-white/8 transition-all font-medium text-lg leading-none"
                >
                  −
                </button>
                <span className="text-lg font-bold font-display text-white tabular-nums">
                  {volume[key]}
                </span>
                <button
                  type="button"
                  onClick={() => setVol(key, volume[key] + 1)}
                  className="w-8 h-8 rounded-lg bg-white/4 border border-white/6 flex items-center justify-center text-[#4a5064] hover:text-white hover:bg-white/8 transition-all font-medium text-lg leading-none"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Submit */}
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
    </form>
  );
}
