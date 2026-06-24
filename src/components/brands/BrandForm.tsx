"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { Brand } from "@/lib/types";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { staggerContainer, staggerItem } from "@/lib/motion";

type FormData = Omit<Brand, "id" | "createdAt" | "updatedAt">;

function normalizeFormData(data: Partial<FormData> | undefined): FormData {
  return {
    name: data?.name?.trim() ?? "",
    briefPermanente: data?.briefPermanente ?? "",
    analisisRedes: data?.analisisRedes ?? "",
    vocabulario: {
      usa: data?.vocabulario?.usa ?? "",
      evita: data?.vocabulario?.evita ?? "",
    },
  };
}

function formDataEquals(a: FormData, b: FormData): boolean {
  return (
    a.name === b.name &&
    a.briefPermanente === b.briefPermanente &&
    a.analisisRedes === b.analisisRedes &&
    a.vocabulario.usa === b.vocabulario.usa &&
    a.vocabulario.evita === b.vocabulario.evita
  );
}

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
  const isEditing = initialValues !== undefined;
  const baseline = normalizeFormData(initialValues);

  const [name, setName] = useState(baseline.name);
  const [briefPermanente, setBriefPermanente] = useState(baseline.briefPermanente);
  const [analisisRedes, setAnalisisRedes] = useState(baseline.analisisRedes);
  const [vocabularioUsa, setVocabularioUsa] = useState(baseline.vocabulario.usa);
  const [vocabularioEvita, setVocabularioEvita] = useState(
    baseline.vocabulario.evita
  );

  const currentData: FormData = {
    name: name.trim(),
    briefPermanente,
    analisisRedes,
    vocabulario: { usa: vocabularioUsa, evita: vocabularioEvita },
  };

  const hasChanges = !formDataEquals(currentData, baseline);
  const canSubmit = isEditing
    ? hasChanges && currentData.name.length > 0 && !isLoading
    : currentData.name.length > 0 && !isLoading;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({
      name: currentData.name,
      briefPermanente: currentData.briefPermanente,
      analisisRedes: currentData.analisisRedes,
      vocabulario: currentData.vocabulario,
    });
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-6 rounded-2xl border border-[#ded8cf] bg-white p-5 shadow-sm md:p-6"
    >
      <motion.div variants={staggerItem} className="flex flex-col gap-1.5">
        <label className="text-[11px] font-semibold text-[#8b8498] uppercase tracking-[0.16em]">
          Nombre de la marca
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Valka Barefoot"
          className="w-full rounded-xl border border-[#d8d2ca] bg-white px-4 py-3 text-sm font-medium text-[#171422] placeholder:text-[#aaa3b3] transition-all duration-150 focus:border-[#171422]/35 focus:outline-none focus:ring-2 focus:ring-[#171422]/10"
        />
      </motion.div>

      <motion.div variants={staggerItem}>
      <Textarea
        label="Brief permanente"
        description="Descripción de la marca, tono de voz, pilares de contenido, audiencia, etapa de posicionamiento."
        value={briefPermanente}
        onChange={(e) => setBriefPermanente(e.target.value)}
        rows={8}
        placeholder="Nombre, descripción, tono de voz, pilares de contenido, audiencia, etapa de posicionamiento (marca nueva vs establecida)..."
      />
      </motion.div>

      <motion.div variants={staggerItem}>
      <Textarea
        label="Análisis de redes"
        description="Qué funciona, métricas clave, formatos más usados, tono detectado, ejemplos de copy."
        value={analisisRedes}
        onChange={(e) => setAnalisisRedes(e.target.value)}
        rows={8}
        placeholder="Pegá el análisis de Instagram: qué funciona, métricas, formatos más usados, tono detectado, ejemplos de copy..."
      />
      </motion.div>

      <motion.div variants={staggerItem} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Textarea
          label="Vocabulario - usa"
          description="Palabras y frases propias de la marca."
          value={vocabularioUsa}
          onChange={(e) => setVocabularioUsa(e.target.value)}
          rows={4}
          placeholder="rioplatense, vos, che, minimalista..."
        />
        <Textarea
          label="Vocabulario - evita"
          description="Palabras o giros que no son propios de la marca."
          value={vocabularioEvita}
          onChange={(e) => setVocabularioEvita(e.target.value)}
          rows={4}
          placeholder="guardarropas, outfit, consumo..."
        />
      </motion.div>

      <motion.div
        variants={staggerItem}
        className="flex flex-col items-stretch gap-3 pt-2 sm:flex-row sm:items-center"
      >
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
      </motion.div>

      {isEditing && !hasChanges && !isLoading && (
        <motion.p
          variants={staggerItem}
          className="text-xs text-[#8b8498]"
        >
          No hay cambios para guardar.
        </motion.p>
      )}
    </motion.form>
  );
}
