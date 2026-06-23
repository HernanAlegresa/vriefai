"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { Brand } from "@/lib/types";
import { cn } from "@/lib/utils";

const BRAND_COLORS = [
  "#4f7eff",
  "#9747ff",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#ec4899",
  "#f97316",
];

function getBrandColor(name: string): string {
  const hash = name
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return BRAND_COLORS[hash % BRAND_COLORS.length];
}

function loadBrands(): Brand[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(
      localStorage.getItem("vriefai_brands") ?? "[]"
    ) as Brand[];
  } catch {
    return [];
  }
}

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [brands, setBrands] = useState<Brand[]>([]);

  useEffect(() => {
    setBrands(loadBrands());
  }, [pathname]);

  function navigate(path: string) {
    router.push(path);
    onClose?.();
  }

  return (
    <aside className="w-[260px] shrink-0 border-r border-white/6 bg-[#050710] flex flex-col h-full overflow-hidden">
      {/* Logo */}
      <div className="px-5 h-14 flex items-center justify-between border-b border-white/6 shrink-0">
        <button
          onClick={() => navigate("/brands")}
          className="flex items-center gap-2.5 group"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#4f7eff] to-[#9747ff] flex items-center justify-center shadow-lg shadow-[#4f7eff]/20 group-hover:shadow-[#4f7eff]/35 transition-shadow">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path
                d="M1.5 6.5h10M6.5 1.5L11.5 6.5 6.5 11.5"
                stroke="white"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="font-display text-sm font-bold text-white tracking-tight">
            vriefai
          </span>
        </button>

        {/* Mobile close */}
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-[#7880a8] hover:text-white hover:bg-white/5 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 3l10 10M13 3L3 13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <div className="flex items-center justify-between mb-2 px-2">
          <p className="text-[10px] font-semibold text-[#3a4060] uppercase tracking-widest">
            Marcas
          </p>
          <button
            onClick={() => navigate("/brands/new")}
            className="w-5 h-5 rounded-md flex items-center justify-center text-[#4a5064] hover:text-[#4f7eff] hover:bg-[#4f7eff]/10 transition-colors"
            title="Nueva marca"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path
                d="M5 1v8M1 5h8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {brands.length === 0 && (
          <div className="px-2 py-4 text-center">
            <p className="text-xs text-[#3a4060] italic">
              Sin marcas todavía
            </p>
          </div>
        )}

        <div className="space-y-0.5">
          {brands.map((brand) => {
            const isActive = pathname.startsWith(`/brands/${brand.id}`);
            const color = getBrandColor(brand.name);

            return (
              <motion.button
                key={brand.id}
                onClick={() => navigate(`/brands/${brand.id}`)}
                whileHover={{ x: 2 }}
                transition={{ duration: 0.12 }}
                className={cn(
                  "w-full text-left px-2.5 py-2 rounded-xl text-sm transition-all duration-150 flex items-center gap-2.5",
                  isActive
                    ? "bg-[#0d0f1e] text-white border border-white/8"
                    : "text-[#7880a8] hover:text-white hover:bg-white/4"
                )}
              >
                {/* Brand avatar */}
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-bold shrink-0 transition-all"
                  style={{
                    background: `${color}18`,
                    border: `1px solid ${color}30`,
                    color,
                  }}
                >
                  {brand.name[0]?.toUpperCase()}
                </div>

                <span className="truncate flex-1 font-medium text-[13px]">
                  {brand.name}
                </span>

                {isActive && (
                  <div
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: color }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </nav>

      {/* Footer — workspace hint */}
      <div className="shrink-0 px-3 py-3 border-t border-white/6">
        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl bg-white/3">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#4f7eff]/20 to-[#9747ff]/20 flex items-center justify-center shrink-0">
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              className="text-[#4f7eff]"
            >
              <path
                d="M6 1.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9zM6 4v2.5M6 7.5h.01"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-[#4a5064]">
              Workspace personal
            </p>
            <p className="text-[10px] text-[#2a3048] truncate">v0 — sin auth</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
