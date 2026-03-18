import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines clsx and tailwind-merge for conditional class name composition.
 * Handles Tailwind CSS class conflicts by letting later classes override earlier ones.
 *
 * Usage:
 *   cn("px-4 py-2", isActive && "bg-blue-500", className)
 *   cn("text-sm font-bold", { "text-red-500": hasError })
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
