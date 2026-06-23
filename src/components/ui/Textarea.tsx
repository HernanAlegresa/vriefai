"use client";

import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  description?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, description, className, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-[11px] font-semibold text-[#4a5064] uppercase tracking-widest">
          {label}
        </label>
      )}
      {description && (
        <p className="text-xs text-[#3a4060] leading-relaxed">{description}</p>
      )}
      <textarea
        ref={ref}
        className={cn(
          "w-full bg-[#0a0c1b] border border-white/6 rounded-xl p-4",
          "font-mono text-sm text-[#a8b3cc] placeholder:text-[#2a3048]",
          "resize-y focus:outline-none focus:border-[#4f7eff]/40 focus:ring-2 focus:ring-[#4f7eff]/8",
          "transition-all duration-150",
          className
        )}
        {...props}
      />
    </div>
  )
);

Textarea.displayName = "Textarea";
