"use client";

import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

type ContentManagerLoadingVariant = "page" | "section" | "inline" | "overlay" | "icon";

interface ContentManagerLoadingProps {
  variant?: ContentManagerLoadingVariant;
  title?: string;
  description?: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const variantClasses: Record<ContentManagerLoadingVariant, string> = {
  page: "min-h-[60vh] rounded-2xl border border-neutral-200 bg-white",
  section: "min-h-[220px] rounded-2xl border border-neutral-200 bg-white",
  inline: "min-h-0 bg-transparent",
  overlay: "absolute inset-0 z-10 rounded-2xl bg-white/60 backdrop-blur-[1px]",
  icon: "min-h-0 bg-transparent",
};

export function ContentManagerLoading({
  variant = "section",
  title = "Loading...",
  description,
  className,
  size = "md",
}: ContentManagerLoadingProps) {
  const isInline = variant === "inline";
  const isIcon = variant === "icon";
  const spinnerSize = size;

  return (
    <div
      className={cn(
        "flex items-center justify-center",
        variantClasses[variant],
        className
      )}
    >
      <div
        className={cn(
          "flex items-center",
          isIcon ? "" : isInline ? "gap-2" : "flex-col gap-3 text-center"
        )}
      >
        <LoadingSpinner size={spinnerSize} />
        {!isIcon && (
          <div className={cn(isInline ? "text-sm text-neutral-600" : "text-neutral-600")}>
            <p className={cn("font-medium", isInline ? "inline" : "text-sm")}>{title}</p>
            {description ? (
              <div className={cn(isInline ? "ml-2 inline text-sm text-neutral-500" : "mt-1 text-sm text-neutral-500")}>{description}</div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
