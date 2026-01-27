import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function stripMarkdownFences(text: string): string {
  let cleaned = text.trim()
  cleaned = cleaned.replace(/^```(?:json|JSON)?\n?/, '')
  cleaned = cleaned.replace(/\n?```$/, '')
  return cleaned.trim()
}
