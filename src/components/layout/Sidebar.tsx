"use client";

import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useBrands } from "@/hooks/useBrands";
import { useGenerations } from "@/hooks/useGenerations";
import { cn } from "@/lib/utils";
import { getBrandColor } from "@/lib/brandColors";

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { brands } = useBrands();
  const { generations } = useGenerations();

  function navigate(path: string) {
    router.push(path);
    onClose?.();
  }

  return (
    <aside className="w-[272px] shrink-0 border-r border-[#ded8cf] bg-[#fbfaf7] flex flex-col h-full overflow-hidden">
      <div className="px-5 h-16 flex items-center justify-between border-b border-[#ebe5dc] shrink-0">
        <button
          onClick={() => navigate("/brands")}
          className="flex items-center gap-2.5 group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-[#171422] flex items-center justify-center">
            <span className="font-display text-sm font-bold text-white">v</span>
          </div>
          <span className="font-display text-sm font-bold text-[#171422] tracking-tight">
            vriefai
          </span>
        </button>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-[#645f72] hover:text-[#171422] hover:bg-[#ebe6de] transition-colors cursor-pointer"
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

      <nav className="flex-1 overflow-y-auto py-5 px-3">
        <div className="flex items-center justify-between mb-4 px-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8b8498]">
            Marcas
          </p>
          <button
            onClick={() => navigate("/brands/new")}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#625d6d] hover:text-[#171422] hover:bg-[#eeeae3] transition-colors cursor-pointer"
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
            <p className="text-xs text-[#8b8498] italic">
              Sin marcas todavía
            </p>
          </div>
        )}

        <div className="space-y-1.5">
          {brands.map((brand) => {
            const isActive = pathname.startsWith(`/brands/${brand.id}`);
            const color = getBrandColor(brand.name);
            const generationCount = generations.filter(
              (generation) => generation.brandId === brand.id
            ).length;

            return (
              <motion.button
                key={brand.id}
                onClick={() => navigate(`/brands/${brand.id}`)}
                whileHover={{ x: 2 }}
                transition={{ duration: 0.12 }}
                className={cn(
                  "w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all duration-150 flex items-center gap-3 cursor-pointer border",
                  isActive
                    ? "bg-white text-[#171422] border-[#ded8cf] shadow-sm"
                    : "text-[#625d6d] border-transparent hover:text-[#171422] hover:bg-[#f0ece5]"
                )}
              >
                <div
                  className="w-2 h-8 rounded-full shrink-0"
                  style={{
                    background: color,
                  }}
                />

                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-[13px]">
                    {brand.name}
                  </span>
                  <span className="block truncate text-[11px] text-[#8b8498] mt-0.5">
                    {generationCount}{" "}
                    {generationCount === 1 ? "programación" : "programaciones"}
                  </span>
                </span>

                {isActive && (
                  <span className="text-[11px] font-semibold text-[#171422]">
                    Activa
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </nav>

      <div className="shrink-0 px-3 py-3 border-t border-[#ece5dc]">
        <div className="px-3 py-2 rounded-xl bg-[#f0ece5] border border-[#e5ded5]">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-[#625d6d]">
              Workspace personal
            </p>
            <p className="text-[10px] text-[#9c95a7] truncate">v0 - sin auth</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
