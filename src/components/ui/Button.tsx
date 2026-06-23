"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary: "btn-gradient text-white font-semibold",
  secondary:
    "bg-white/6 text-white hover:bg-white/10 border border-white/10 transition-colors",
  ghost: "text-[#7880a8] hover:text-white hover:bg-white/5 transition-colors",
  danger:
    "text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-colors",
};

const sizes: Record<Size, string> = {
  sm: "px-3.5 py-1.5 text-xs rounded-lg",
  md: "px-5 py-2.5 text-sm rounded-xl",
  lg: "px-6 py-3 text-base rounded-xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = "primary", size = "md", loading, className, children, disabled, ...props },
    ref
  ) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium",
        "disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none",
        variants[variant],
        sizes[size],
        loading && variant === "primary" && "btn-gradient-loading",
        className
      )}
      {...props}
    >
      {loading ? (
        <>
          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
          {children}
        </>
      ) : (
        children
      )}
    </button>
  )
);

Button.displayName = "Button";
