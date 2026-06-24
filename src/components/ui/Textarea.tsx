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
        <label className="text-[11px] font-semibold text-[#8b8498] uppercase tracking-[0.16em]">
          {label}
        </label>
      )}
      {description && (
        <p className="text-xs text-[#645f72] leading-relaxed">{description}</p>
      )}
      <textarea
        ref={ref}
        className={cn(
          "w-full bg-white border border-[#d8d2ca] rounded-xl p-4",
          "text-sm text-[#312f3f] placeholder:text-[#aaa3b3]",
          "resize-y focus:outline-none focus:border-[#171422]/35 focus:ring-2 focus:ring-[#171422]/10",
          "transition-all duration-150",
          className
        )}
        {...props}
      />
    </div>
  )
);

Textarea.displayName = "Textarea";
