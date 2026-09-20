import { cn } from '../../utils/cn'

// Quick-suggestion chips shown before/while typing in SearchOverlay. No
// precedent in the reference design (it goes straight from input to
// results) — a reasonable addition, flagged here rather than presented as
// an extraction.

/**
 * @param {object} props
 * @param {string[]} props.suggestions
 * @param {(suggestion: string) => void} [props.onSelect]
 * @param {string} [props.className]
 */
export function SearchSuggestions({ suggestions = [], onSelect, className }) {
  if (suggestions.length === 0) return null

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {suggestions.map((suggestion) => (
        <button
          key={suggestion}
          type="button"
          onClick={() => onSelect?.(suggestion)}
          className="rounded-full border border-hairline px-3.5 py-1.5 text-[13px] text-ink-secondary transition-all duration-fast ease-brand hover:border-hairline-strong hover:text-ink"
        >
          {suggestion}
        </button>
      ))}
    </div>
  )
}
