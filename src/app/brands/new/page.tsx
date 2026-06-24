"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useBrands } from "@/hooks/useBrands";
import { BrandForm } from "@/components/brands/BrandForm";
import { StatusBanner } from "@/components/ui/StatusBanner";
import { delay } from "@/lib/motion";

export default function NewBrandPage() {
  const router = useRouter();
  const { createBrand } = useBrands();
  const [isCreating, setIsCreating] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  return (
    <div className="mx-auto min-h-full max-w-3xl px-4 py-8 md:px-8 md:py-10">
      <div className="mb-8">
        <button
          onClick={() => router.push("/brands")}
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
          Volver a marcas
        </button>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#8b8498]">
          Nueva ficha de cliente
        </p>
        <h1 className="mb-2 font-display text-3xl font-bold text-[#171422] md:text-4xl">
          Nueva marca
        </h1>
        <p className="text-base leading-relaxed text-[#645f72]">
          Completá el brief permanente para que la IA conozca a fondo a esta
          marca.
        </p>
      </div>

      <StatusBanner
        show={status === "success"}
        message="Marca creada correctamente"
        className="mb-4"
      />
      <StatusBanner
        show={status === "error"}
        status="error"
        message="No se pudo crear la marca. Intentá de nuevo."
        className="mb-4"
      />

      <BrandForm
        submitLabel="Crear marca"
        isLoading={isCreating}
        onSubmit={async (data) => {
          if (isCreating) return;
          setStatus("idle");
          setIsCreating(true);
          try {
            const brand = await createBrand(data);
            setStatus("success");
            setIsCreating(false);
            await delay(850);
            router.push(`/brands/${brand.id}`);
          } catch {
            setStatus("error");
            setIsCreating(false);
          }
        }}
        onCancel={() => router.push("/brands")}
      />
    </div>
  );
}
