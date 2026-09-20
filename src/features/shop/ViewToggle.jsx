import { cn } from '../../utils/cn'

// .layout-toggle-btn — DESIGN_SYSTEM.md §18 (Shop toolbar grid/list switch)

/**
 * @param {object} props
 * @param {'grid'|'list'} [props.value]
 * @param {(value: 'grid'|'list') => void} [props.onChange]
 * @param {string} [props.className]
 */
export function ViewToggle({ value = 'grid', onChange, className }) {
  const btnClass = (active) =>
    cn(
      'flex h-9 w-9 items-center justify-center rounded-md border transition-all duration-fast ease-brand',
      active
        ? 'border-ink bg-ink text-white'
        : 'border-hairline text-ink-secondary hover:text-ink'
    )

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <button
        type="button"
        aria-label="Grid layout"
        aria-pressed={value === 'grid'}
        onClick={() => onChange?.('grid')}
        className={btnClass(value === 'grid')}
      >
        <svg
          className="h-[18px] w-[18px]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      </button>
      <button
        type="button"
        aria-label="List layout"
        aria-pressed={value === 'list'}
        onClick={() => onChange?.('list')}
        className={btnClass(value === 'list')}
      >
        <svg
          className="h-[18px] w-[18px]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" />
          <line x1="3" y1="12" x2="3.01" y2="12" />
          <line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
      </button>
    </div>
  )
}
