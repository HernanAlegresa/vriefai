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
import type { Brand } from "@/lib/types";
import { sortBrandsByName } from "@/lib/utils";

type DbBrand = {
  id: string;
  name: string;
  brief_permanente: string;
  analisis_redes: string;
  vocabulario: { usa: string; evita: string };
  created_at: string;
  updated_at: string;
};

function fromDb(row: DbBrand): Brand {
  return {
    id: row.id,
    name: row.name,
    briefPermanente: row.brief_permanente,
    analisisRedes: row.analisis_redes,
    vocabulario: row.vocabulario,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

type BrandsContextValue = {
  brands: Brand[];
  loading: boolean;
  createBrand: (data: Omit<Brand, "id" | "createdAt" | "updatedAt">) => Promise<Brand>;
  updateBrand: (id: string, data: Partial<Omit<Brand, "id" | "createdAt">>) => Promise<void>;
  deleteBrand: (id: string) => Promise<void>;
  getBrand: (id: string) => Brand | undefined;
};

const BrandsCtx = createContext<BrandsContextValue | null>(null);

export function BrandsProvider({ children }: { children: ReactNode }) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("brands")
      .select("*")
      .order("name", { ascending: true })
      .then(({ data, error }) => {
        if (!error && data) setBrands((data as DbBrand[]).map(fromDb));
        setLoading(false);
      });
  }, []);

  const createBrand = useCallback(
    async (data: Omit<Brand, "id" | "createdAt" | "updatedAt">): Promise<Brand> => {
      const { data: row, error } = await supabase
        .from("brands")
        .insert({
          name: data.name,
          brief_permanente: data.briefPermanente,
          analisis_redes: data.analisisRedes,
          vocabulario: data.vocabulario,
        })
        .select()
        .single();
      if (error) throw error;
      const brand = fromDb(row as DbBrand);
      setBrands((prev) => sortBrandsByName([...prev, brand]));
      return brand;
    },
    []
  );

  const updateBrand = useCallback(
    async (id: string, data: Partial<Omit<Brand, "id" | "createdAt">>): Promise<void> => {
      const patch: Record<string, unknown> = {};
      if (data.name !== undefined) patch.name = data.name;
      if (data.briefPermanente !== undefined) patch.brief_permanente = data.briefPermanente;
      if (data.analisisRedes !== undefined) patch.analisis_redes = data.analisisRedes;
      if (data.vocabulario !== undefined) patch.vocabulario = data.vocabulario;

      const { error } = await supabase.from("brands").update(patch).eq("id", id);
      if (error) throw error;
      setBrands((prev) =>
        sortBrandsByName(
          prev.map((b) =>
            b.id === id
              ? { ...b, ...data, updatedAt: new Date().toISOString() }
              : b
          )
        )
      );
    },
    []
  );

  const deleteBrand = useCallback(async (id: string): Promise<void> => {
    const { error } = await supabase.from("brands").delete().eq("id", id);
    if (error) throw error;
    setBrands((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const getBrand = useCallback(
    (id: string) => brands.find((b) => b.id === id),
    [brands]
  );

  return (
    <BrandsCtx.Provider
      value={{ brands, loading, createBrand, updateBrand, deleteBrand, getBrand }}
    >
      {children}
    </BrandsCtx.Provider>
  );
}

export function useBrands(): BrandsContextValue {
  const ctx = useContext(BrandsCtx);
  if (!ctx) throw new Error("useBrands must be used within BrandsProvider");
  return ctx;
}
