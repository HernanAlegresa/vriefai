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
  primary:
    "bg-[#171422] text-white font-semibold border border-[#171422] shadow-sm hover:bg-[#2a2638] transition-colors",
  secondary:
    "bg-white text-[#171422] hover:bg-[#f7f5f0] border border-[#d8d2ca] shadow-sm transition-colors",
  ghost:
    "text-[#625d6d] hover:text-[#171422] hover:bg-[#eeeae3] transition-colors",
  danger:
    "text-red-600 hover:text-red-700 hover:bg-red-50 border border-transparent transition-colors",
};

const sizes: Record<Size, string> = {
  sm: "px-3.5 py-1.5 text-xs rounded-lg",
  md: "px-5 py-2.5 text-sm rounded-xl",
  lg: "px-6 py-3 text-base rounded-xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-medium",
          "cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 disabled:transform-none disabled:shadow-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#171422]/20 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f5f0]",
          !isDisabled &&
            "transition-all duration-150 ease-out hover:-translate-y-px active:translate-y-0 active:scale-[0.98]",
          variants[variant],
          sizes[size],
          loading && variant === "primary" && "btn-gradient-loading",
          className
        )}
        {...props}
      >
        {loading ? (
          <>
            <span className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            {children}
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
