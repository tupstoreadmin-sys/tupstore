import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges class names, resolving conflicting Tailwind utilities in favor of
 * the last one given (e.g. a consumer's `className` overriding an internal
 * default) instead of leaving both applied.
 * @param {...(string|undefined|null|false|Record<string, boolean>)} inputs
 * @returns {string}
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
