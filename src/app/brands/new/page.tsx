"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useBrands } from "@/hooks/useBrands";
import { BrandForm } from "@/components/brands/BrandForm";

export default function NewBrandPage() {
  const router = useRouter();
  const { createBrand } = useBrands();
  const [isCreating, setIsCreating] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-full px-4 md:px-8 py-8 max-w-2xl mx-auto"
    >
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push("/brands")}
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
          Volver a marcas
        </button>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-white mb-1">
          Nueva marca
        </h1>
        <p className="text-sm text-[#4a5064]">
          Completá el brief permanente para que la IA conozca a fondo a esta marca.
        </p>
      </div>

      <BrandForm
        submitLabel="Crear marca"
        isLoading={isCreating}
        onSubmit={async (data) => {
          if (isCreating) return;
          setIsCreating(true);
          try {
            const brand = await createBrand(data);
            router.push(`/brands/${brand.id}`);
          } catch {
            setIsCreating(false);
          }
        }}
        onCancel={() => router.push("/brands")}
      />
    </motion.div>
  );
}
