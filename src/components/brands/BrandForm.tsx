"use client";

import { useState } from "react";
import type { Brand } from "@/lib/types";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

type FormData = Omit<Brand, "id" | "createdAt" | "updatedAt">;

interface BrandFormProps {
  initialValues?: Partial<FormData>;
  onSubmit: (data: FormData) => void;
  onCancel?: () => void;
  submitLabel?: string;
  isLoading?: boolean;
}

export function BrandForm({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel = "Guardar",
  isLoading = false,
}: BrandFormProps) {
  const [name, setName] = useState(initialValues?.name ?? "");
  const [briefPermanente, setBriefPermanente] = useState(
    initialValues?.briefPermanente ?? ""
  );
  const [analisisRedes, setAnalisisRedes] = useState(
    initialValues?.analisisRedes ?? ""
  );
  const [vocabularioUsa, setVocabularioUsa] = useState(
    initialValues?.vocabulario?.usa ?? ""
  );
  const [vocabularioEvita, setVocabularioEvita] = useState(
    initialValues?.vocabulario?.evita ?? ""
  );

  const canSubmit = name.trim().length > 0 && !isLoading;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({
      name: name.trim(),
      briefPermanente,
      analisisRedes,
      vocabulario: { usa: vocabularioUsa, evita: vocabularioEvita },
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Nombre */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-semibold text-[#4a5064] uppercase tracking-widest">
          Nombre de la marca
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Valka Barefoot"
          className="w-full bg-[#0a0c1b] border border-white/6 rounded-xl px-4 py-3 text-sm text-[#e8eaff] placeholder:text-[#2a3048] focus:outline-none focus:border-[#4f7eff]/40 focus:ring-2 focus:ring-[#4f7eff]/8 transition-all duration-150 font-medium"
        />
      </div>

      <Textarea
        label="Brief permanente"
        description="Descripción de la marca, tono de voz, pilares de contenido, audiencia, etapa de posicionamiento."
        value={briefPermanente}
        onChange={(e) => setBriefPermanente(e.target.value)}
        rows={8}
        placeholder="Nombre, descripción, tono de voz, pilares de contenido, audiencia, etapa de posicionamiento (marca nueva vs establecida)..."
      />

      <Textarea
        label="Análisis de redes"
        description="Qué funciona, métricas clave, formatos más usados, tono detectado, ejemplos de copy."
        value={analisisRedes}
        onChange={(e) => setAnalisisRedes(e.target.value)}
        rows={8}
        placeholder="Pegá el análisis de Instagram: qué funciona, métricas, formatos más usados, tono detectado, ejemplos de copy..."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Textarea
          label="Vocabulario — usa"
          description="Palabras y frases propias de la marca."
          value={vocabularioUsa}
          onChange={(e) => setVocabularioUsa(e.target.value)}
          rows={4}
          placeholder="rioplatense, vos, che, minimalista..."
        />
        <Textarea
          label="Vocabulario — evita"
          description="Palabras o giros que no son propios de la marca."
          value={vocabularioEvita}
          onChange={(e) => setVocabularioEvita(e.target.value)}
          rows={4}
          placeholder="guardarropas, outfit, consumo..."
        />
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
        <Button type="submit" size="lg" loading={isLoading} disabled={!canSubmit} className="sm:w-auto">
          {!isLoading && submitLabel}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            size="lg"
            onClick={onCancel}
            className="sm:w-auto"
          >
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}
