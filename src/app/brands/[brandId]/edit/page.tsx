"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useBrands } from "@/hooks/useBrands";
import { BrandForm } from "@/components/brands/BrandForm";
import { LoadingState } from "@/components/ui/LoadingState";
import { StatusBanner } from "@/components/ui/StatusBanner";
import { delay } from "@/lib/motion";

export default function EditBrandPage({
  params,
}: {
  params: Promise<{ brandId: string }>;
}) {
  const { brandId } = use(params);
  const router = useRouter();
  const { getBrand, updateBrand, loading: brandsLoading } = useBrands();
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [returnToGenerate] = useState(
    () =>
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("from") === "generate"
  );

  const brand = getBrand(brandId);

  if (brandsLoading) {
    return <LoadingState label="Cargando contexto de marca..." />;
  }

  if (!brand) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-[#8b8498]">
        Marca no encontrada
      </div>
    );
  }

  const backPath = returnToGenerate
    ? `/brands/${brandId}/generate`
    : `/brands/${brandId}`;

  return (
    <div className="mx-auto min-h-full max-w-3xl px-4 py-8 md:px-8 md:py-10">
      <div className="mb-8">
        <button
          onClick={() => router.push(backPath)}
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
          {returnToGenerate
            ? "Volver a nueva programación"
            : `Volver a ${brand.name}`}
        </button>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#8b8498]">
          Contexto permanente
        </p>
        <h1 className="mb-2 font-display text-3xl font-bold text-[#171422] md:text-4xl">
          Editar marca
        </h1>
        <p className="text-base text-[#645f72]">{brand.name}</p>
      </div>

      <StatusBanner
        show={status === "success"}
        message="Cambios guardados correctamente"
        className="mb-4"
      />
      <StatusBanner
        show={status === "error"}
        status="error"
        message="No se pudieron guardar los cambios. Intentá de nuevo."
        className="mb-4"
      />

      <BrandForm
        initialValues={brand}
        submitLabel="Guardar cambios"
        isLoading={isSaving}
        onSubmit={async (data) => {
          if (isSaving) return;
          setStatus("idle");
          setIsSaving(true);
          try {
            await updateBrand(brandId, data);
            setStatus("success");
            setIsSaving(false);
            await delay(850);
            router.push(backPath);
          } catch {
            setStatus("error");
            setIsSaving(false);
          }
        }}
        onCancel={() => router.push(backPath)}
      />
    </div>
  );
}
