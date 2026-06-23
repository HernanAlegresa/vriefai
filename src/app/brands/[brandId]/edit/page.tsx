"use client";

import { use, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useBrands } from "@/hooks/useBrands";
import { BrandForm } from "@/components/brands/BrandForm";

export default function EditBrandPage({
  params,
}: {
  params: Promise<{ brandId: string }>;
}) {
  const { brandId } = use(params);
  const router = useRouter();
  const { getBrand, updateBrand, loading: brandsLoading } = useBrands();
  const [isSaving, setIsSaving] = useState(false);

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
        <h1 className="font-display text-2xl md:text-3xl font-bold text-white mb-1">
          Editar marca
        </h1>
        <p className="text-sm text-[#4a5064]">{brand.name}</p>
      </div>

      <BrandForm
        initialValues={brand}
        submitLabel="Guardar cambios"
        isLoading={isSaving}
        onSubmit={async (data) => {
          if (isSaving) return;
          setIsSaving(true);
          try {
            await updateBrand(brandId, data);
            router.push(`/brands/${brandId}`);
          } catch {
            setIsSaving(false);
          }
        }}
        onCancel={() => router.push(`/brands/${brandId}`)}
      />
    </motion.div>
  );
}
