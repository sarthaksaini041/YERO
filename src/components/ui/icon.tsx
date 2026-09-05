/**
 * Icon — centralized Hugeicons wrapper
 *
 * Usage:
 *   import { Icon } from "@/components/ui/icon";
 *   import { BellIcon } from "@hugeicons/core-free-icons";
 *   <Icon icon={BellIcon} size="md" />
 *
 * Size presets (px):
 *   xs  = 14
 *   sm  = 16
 *   md  = 18   ← default
 *   lg  = 20
 *   xl  = 24
 *   2xl = 28
 */
import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import { cn } from "@/lib/utils";

type IconSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

const sizeMap: Record<IconSize, number> = {
  xs:  14,
  sm:  16,
  md:  18,
  lg:  20,
  xl:  24,
  "2xl": 28,
};

export interface IconProps {
  icon: IconSvgElement;
  size?: IconSize | number;
  strokeWidth?: number;
  className?: string;
  "aria-label"?: string;
  "aria-hidden"?: boolean | "true" | "false";
}

export function Icon({
  icon,
  size = "md",
  strokeWidth = 1.5,
  className,
  "aria-label": ariaLabel,
  "aria-hidden": ariaHidden,
}: IconProps) {
  const px = typeof size === "number" ? size : sizeMap[size];

  return (
    <HugeiconsIcon
      icon={icon}
      size={px}
      strokeWidth={strokeWidth}
      color="currentColor"
      className={cn("shrink-0", className)}
      aria-label={ariaLabel}
      aria-hidden={ariaHidden ?? (ariaLabel ? undefined : true)}
    />
  );
}
