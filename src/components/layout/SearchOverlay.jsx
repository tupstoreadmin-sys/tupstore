import { cn } from '../../utils/cn'
import { Input } from '../ui/Input'
import { IconClose } from './icons'

// .modal-overlay / .modal-container — DESIGN_SYSTEM.md §5/§18 (the search
// modal specifically, confirmed against reference/index.html). Fully
// controlled (isOpen/onClose/value/onChange) — renders whatever results
// content the caller passes as children, does not fetch or know about
// products itself.

/**
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {() => void} props.onClose
 * @param {string} [props.value]
 * @param {(e: React.ChangeEvent<HTMLInputElement>) => void} [props.onChange]
 * @param {React.ReactNode} [props.children] - results content
 * @param {string} [props.className]
 */
export function SearchOverlay({
  isOpen,
  onClose,
  value,
  onChange,
  children,
  className,
}) {
  if (!isOpen) return null

  return (
    <div
      className={cn(
        'fixed inset-0 z-[300] flex items-center justify-center bg-overlay p-4 backdrop-blur-md',
        className
      )}
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-[680px] overflow-y-auto rounded-xl bg-white p-9 shadow-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Close search"
          onClick={onClose}
          className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full text-ink-secondary transition-colors duration-fast ease-brand hover:text-ink"
        >
          <IconClose className="h-5 w-5" />
        </button>

        <h3 className="mb-4 font-heading text-lg font-bold text-ink">
          Search Catalogue
        </h3>

        <Input
          value={value}
          onChange={onChange}
          placeholder="Type product name, e.g. Aquasafe, Modular Mates..."
          autoFocus
          className="mb-6 px-4 py-4 text-base"
        />

        {children}
      </div>
    </div>
  )
}
