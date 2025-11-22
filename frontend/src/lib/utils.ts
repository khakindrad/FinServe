import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
// lib/utils.ts
export function normalizeHeaders(h: HeadersInit = {}): Record<string, string> {
  const result: Record<string, string> = {};

  if (h instanceof Headers) {
    h.forEach((value, key) => (result[key] = value));
  } else if (Array.isArray(h)) {
    h.forEach(([k, v]) => (result[k] = v));
  } else if (typeof h === "object" && h !== null) {
    Object.assign(result, h as Record<string, string>);
  }

  return result;
}
