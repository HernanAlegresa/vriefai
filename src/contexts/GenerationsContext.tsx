"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
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

type GenerationsContextValue = {
  generations: Generation[];
  loading: boolean;
  createGeneration: (data: Omit<Generation, "id" | "createdAt">) => Promise<Generation>;
  getGeneration: (id: string) => Generation | undefined;
  deleteGeneration: (id: string) => Promise<void>;
  deleteGenerationsForBrand: (brandId: string) => void;
};

const GenerationsCtx = createContext<GenerationsContextValue | null>(null);

export function GenerationsProvider({ children }: { children: ReactNode }) {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("generations")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setGenerations((data as DbGeneration[]).map(fromDb));
        setLoading(false);
      });
  }, []);

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

  const deleteGenerationsForBrand = useCallback((brandId: string) => {
    setGenerations((prev) => prev.filter((g) => g.brandId !== brandId));
  }, []);

  return (
    <GenerationsCtx.Provider
      value={{
        generations,
        loading,
        createGeneration,
        getGeneration,
        deleteGeneration,
        deleteGenerationsForBrand,
      }}
    >
      {children}
    </GenerationsCtx.Provider>
  );
}

export function useGenerationsContext(): GenerationsContextValue {
  const ctx = useContext(GenerationsCtx);
  if (!ctx) throw new Error("useGenerationsContext must be used within GenerationsProvider");
  return ctx;
}
