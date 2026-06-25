"use client";

import { useMemo } from "react";
import { useGenerationsContext } from "@/contexts/GenerationsContext";

export function useGenerations(brandId?: string) {
  const ctx = useGenerationsContext();

  const generations = useMemo(
    () =>
      brandId
        ? ctx.generations.filter((g) => g.brandId === brandId)
        : ctx.generations,
    [ctx.generations, brandId]
  );

  return { ...ctx, generations };
}
