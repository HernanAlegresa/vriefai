"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "./Sidebar";
import { BrandsProvider } from "@/contexts/BrandsContext";
import { GenerationsProvider } from "@/contexts/GenerationsContext";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const router = useRouter();

  return (
    <BrandsProvider>
      <GenerationsProvider>
        <div className="flex h-full bg-[#f7f5f0] text-[#171422]">
          <div className="hidden md:flex shrink-0">
            <Sidebar />
          </div>

          <AnimatePresence>
            {drawerOpen && (
              <>
                <motion.div
                  key="overlay"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setDrawerOpen(false)}
                  className="fixed inset-0 bg-[#171422]/35 backdrop-blur-sm z-40 md:hidden"
                />
                <motion.div
                  key="drawer"
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
                  className="fixed left-0 top-0 bottom-0 w-[280px] z-50 md:hidden"
                >
                  <Sidebar onClose={() => setDrawerOpen(false)} />
                </motion.div>
              </>
            )}
          </AnimatePresence>

          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <header className="md:hidden flex items-center justify-between px-4 h-14 border-b border-[#ded8cf] bg-[#fbfaf7]/95 backdrop-blur-md shrink-0 sticky top-0 z-30">
              <button
                onClick={() => setDrawerOpen(true)}
                aria-label="Abrir menú"
                className="p-2 -ml-2 rounded-lg text-[#645f72] hover:text-[#171422] hover:bg-[#ebe6de] transition-colors cursor-pointer"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M3 5h14M3 10h10M3 15h14"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </button>

              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#171422] flex items-center justify-center">
                  <span className="font-display text-xs font-bold text-white">v</span>
                </div>
                <span className="font-display text-sm font-bold text-[#171422] tracking-tight">
                  vriefai
                </span>
              </div>

              <button
                onClick={() => router.push("/brands/new")}
                aria-label="Nueva marca"
                className="p-2 -mr-2 rounded-lg text-[#4f7eff] hover:text-[#171422] hover:bg-[#ebe6de] transition-colors cursor-pointer"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M10 4v12M4 10h12"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </header>

            <main className="flex-1 overflow-y-auto">{children}</main>
          </div>
        </div>
      </GenerationsProvider>
    </BrandsProvider>
  );
}
