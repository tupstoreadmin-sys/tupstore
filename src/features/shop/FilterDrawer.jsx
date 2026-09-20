import { useEffect } from 'react'
import { IconClose } from '../../components/layout/icons'
import { Button } from '../../components/ui'

/**
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {() => void} props.onClose
 * @param {() => void} [props.onClearAll]
 * @param {React.ReactNode} props.children
 */
export function FilterDrawer({ isOpen, onClose, onClearAll, children }) {
  // Prevent body scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose?.()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end md:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Filter products"
    >
      {/* Subtle backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity duration-fast ease-brand"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-up drawer container */}
      <div className="relative z-10 flex max-h-[85vh] w-full flex-col rounded-t-2xl bg-white shadow-2xl transition-transform duration-smooth ease-brand">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
          <h3 className="text-base font-bold text-ink">Filters</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-secondary transition-colors hover:bg-surface-subtle hover:text-ink"
          >
            <IconClose className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Filter Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {/* Sticky Action Footer */}
        <div className="sticky bottom-0 border-t border-hairline bg-white p-4 flex items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            fullWidth
            onClick={onClearAll}
            className="rounded-md font-semibold uppercase tracking-wider text-xs"
          >
            Clear All
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            fullWidth
            onClick={onClose}
            className="rounded-md font-semibold uppercase tracking-wider text-xs bg-ink text-white hover:bg-black"
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  )
}
