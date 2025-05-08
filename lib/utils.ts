/**
 * Combines multiple class names into a single string
 * Simple replacement for clsx and tailwind-merge
 */
export function cn(...inputs: (string | boolean | undefined | null)[]) {
  return inputs.filter(Boolean).join(" ")
}
