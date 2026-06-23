"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useBrands } from "@/hooks/useBrands";
import { useGenerations } from "@/hooks/useGenerations";
import { BrandCard } from "@/components/brands/BrandCard";
import { Button } from "@/components/ui/Button";

export default function BrandsPage() {
  const router = useRouter();
  const { brands, deleteBrand } = useBrands();
  const { generations, deleteGenerationsForBrand } = useGenerations();

  function handleDeleteBrand(id: string) {
    deleteGenerationsForBrand(id);
    deleteBrand(id);
  }

  const totalGenerations = generations.length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-full px-4 md:px-8 py-8 max-w-5xl mx-auto"
    >
      {/* Header */}
      <div className="relative mb-10">
        {/* Background glow */}
        <div className="absolute -top-12 -left-12 w-64 h-64 bg-[#4f7eff]/6 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-8 left-32 w-48 h-48 bg-[#9747ff]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div>
            <p className="text-xs font-semibold text-[#3a4060] uppercase tracking-widest mb-2">
              Content Intelligence Studio
            </p>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-white leading-none mb-2">
              Marcas
            </h1>
            <div className="flex items-center gap-4 text-sm text-[#4a5064]">
              <span>
                <span className="text-[#7880a8] font-semibold">{brands.length}</span>{" "}
                {brands.length === 1 ? "marca" : "marcas"}
              </span>
              {totalGenerations > 0 && (
                <>
                  <span className="w-1 h-1 rounded-full bg-[#2a3048]" />
                  <span>
                    <span className="text-[#7880a8] font-semibold">{totalGenerations}</span>{" "}
                    programaciones generadas
                  </span>
                </>
              )}
            </div>
          </div>

          <Button
            size="lg"
            onClick={() => router.push("/brands/new")}
            className="shrink-0 w-full md:w-auto"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 3v10M3 8h10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            Nueva marca
          </Button>
        </div>
      </div>

      {/* Empty state */}
      {brands.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="flex flex-col items-center justify-center py-32 text-center"
        >
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-[#4f7eff]/20 to-[#9747ff]/10 rounded-3xl blur-xl scale-150" />
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[#4f7eff]/20 to-[#9747ff]/10 border border-[#4f7eff]/20 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path
                  d="M14 6v16M6 14h16"
                  stroke="#4f7eff"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
          <h2 className="font-display text-xl font-bold text-white mb-2">
            Tu primer cliente te espera
          </h2>
          <p className="text-sm text-[#4a5064] mb-8 max-w-sm leading-relaxed">
            Creá una marca para empezar a generar programaciones de contenido
            mensual con contexto acumulado.
          </p>
          <Button size="lg" onClick={() => router.push("/brands/new")}>
            Crear primera marca
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {brands.map((brand, i) => (
            <motion.div
              key={brand.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.06 }}
            >
              <BrandCard
                brand={brand}
                generationCount={
                  generations.filter((g) => g.brandId === brand.id).length
                }
                onDelete={() => handleDeleteBrand(brand.id)}
              />
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
