"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Generation } from "@/lib/types";

type DbGeneration = {
  id: string;
  brand_id: string;
  brief_mensual: string;
  cant_reels: number;
  cant_carruseles: number;
  cant_historias: number;
  output: string;
  created_at: string;
};

function fromDb(row: DbGeneration): Generation {
  return {
    id: row.id,
    brandId: row.brand_id,
    briefMensual: row.brief_mensual,
    cantReels: row.cant_reels,
    cantCarruseles: row.cant_carruseles,
    cantHistorias: row.cant_historias,
    output: row.output,
    createdAt: row.created_at,
  };
}

export function useGenerations(brandId?: string) {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const query = supabase
      .from("generations")
      .select("*")
      .order("created_at", { ascending: false });

    const scopedQuery = brandId ? query.eq("brand_id", brandId) : query;

    scopedQuery.then(({ data, error }) => {
      if (!error && data) setGenerations((data as DbGeneration[]).map(fromDb));
      setLoading(false);
    });
  }, [brandId]);

  const createGeneration = useCallback(
    async (data: Omit<Generation, "id" | "createdAt">): Promise<Generation> => {
      const { data: row, error } = await supabase
        .from("generations")
        .insert({
          brand_id: data.brandId,
          brief_mensual: data.briefMensual,
          cant_reels: data.cantReels,
          cant_carruseles: data.cantCarruseles,
          cant_historias: data.cantHistorias,
          output: data.output,
        })
        .select()
        .single();
      if (error) throw error;
      const gen = fromDb(row as DbGeneration);
      setGenerations((prev) => [gen, ...prev]);
      return gen;
    },
    []
  );

  const getGeneration = useCallback(
    (id: string) => generations.find((g) => g.id === id),
    [generations]
  );

  const deleteGeneration = useCallback(async (id: string): Promise<void> => {
    const { error } = await supabase.from("generations").delete().eq("id", id);
    if (error) throw error;
    setGenerations((prev) => prev.filter((g) => g.id !== id));
  }, []);

  // La FK con CASCADE DELETE en la DB maneja la eliminación real;
  // esto solo limpia el estado local cuando se elimina la marca.
  const deleteGenerationsForBrand = useCallback((bId: string) => {
    setGenerations((prev) => prev.filter((g) => g.brandId !== bId));
  }, []);

  return {
    generations,
    loading,
    createGeneration,
    getGeneration,
    deleteGeneration,
    deleteGenerationsForBrand,
  };
}
