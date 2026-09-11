type ClassValue = string | number | false | null | undefined;

/** Minimal className joiner without adding clsx/tailwind-merge. */
export function cn(...inputs: ClassValue[]): string {
  return inputs.filter(Boolean).join(" ");
}
