"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useBrands } from "@/hooks/useBrands";
import { useGenerations } from "@/hooks/useGenerations";
import { BrandCard } from "@/components/brands/BrandCard";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/LoadingState";
import { fadeUp, fadeUpTransition, staggerContainer, staggerItem } from "@/lib/motion";

export default function BrandsPage() {
  const router = useRouter();
  const { brands, deleteBrand, loading: brandsLoading } = useBrands();
  const { generations, deleteGenerationsForBrand, loading: generationsLoading } =
    useGenerations();

  async function handleDeleteBrand(id: string) {
    deleteGenerationsForBrand(id);
    await deleteBrand(id).catch(console.error);
  }

  const totalGenerations = generations.length;

  if (brandsLoading || generationsLoading) {
    return <LoadingState label="Cargando marcas..." />;
  }

  return (
    <div className="min-h-full px-4 py-8 md:px-8 md:py-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-display text-4xl font-bold tracking-[-0.03em] text-[#171422] md:text-5xl">
                Marcas
              </h1>
            </div>

            <Button size="lg" onClick={() => router.push("/brands/new")}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 3.5v9M3.5 8h9"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
              Nueva marca
            </Button>
          </div>

          <motion.div
            initial={fadeUp.initial}
            animate={fadeUp.animate}
            transition={{ ...fadeUpTransition, delay: 0.08 }}
            className="mx-auto mt-6 grid max-w-md grid-cols-2 gap-3"
          >
            <div className="flex flex-col items-center justify-center rounded-xl border border-[#ded8cf] bg-white px-4 py-4 text-center shadow-sm">
              <p className="text-xs font-medium text-[#8b8498]">Marcas</p>
              <p className="mt-1 font-display text-2xl font-bold text-[#171422]">
                {brands.length}
              </p>
            </div>
            <div className="flex flex-col items-center justify-center rounded-xl border border-[#ded8cf] bg-white px-4 py-4 text-center shadow-sm">
              <p className="text-xs font-medium text-[#8b8498]">
                Programaciones
              </p>
              <p className="mt-1 font-display text-2xl font-bold text-[#171422]">
                {totalGenerations}
              </p>
            </div>
          </motion.div>
        </header>

        {brands.length === 0 ? (
          <motion.div
            initial={fadeUp.initial}
            animate={fadeUp.animate}
            transition={fadeUpTransition}
            className="rounded-2xl border border-dashed border-[#d8d2ca] bg-white px-6 py-16 text-center"
          >
            <h2 className="font-display text-2xl font-bold text-[#171422]">
              Todavía no hay marcas
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#625d6d]">
              Creá la primera ficha de marca para empezar a generar
              programaciones mensuales con contexto.
            </p>
            <Button
              size="lg"
              className="mt-6"
              onClick={() => router.push("/brands/new")}
            >
              Crear marca
            </Button>
          </motion.div>
        ) : (
          <motion.section
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            {brands.map((brand) => {
              const brandGenerations = generations
                .filter((generation) => generation.brandId === brand.id)
                .sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
                );

              return (
                <motion.div key={brand.id} variants={staggerItem} className="h-full">
                  <BrandCard
                    brand={brand}
                    generationCount={brandGenerations.length}
                    latestGenerationAt={brandGenerations[0]?.createdAt}
                    onDelete={() => handleDeleteBrand(brand.id)}
                  />
                </motion.div>
              );
            })}
          </motion.section>
        )}
      </div>
    </div>
  );
}
