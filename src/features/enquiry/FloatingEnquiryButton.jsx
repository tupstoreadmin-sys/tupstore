import { cn } from '../../utils/cn'
import { IconCart } from '../../components/layout/icons'

// .floating-enquiry-trigger — DESIGN_SYSTEM.md §7/§18 (fab/fab-hover shadow
// tokens). `count` is a plain number prop, not enquiry data.

/**
 * @param {object} props
 * @param {number} [props.count]
 * @param {() => void} [props.onClick]
 * @param {string} [props.className]
 */
export function FloatingEnquiryButton({ count = 0, onClick, className }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'fixed bottom-6 right-6 sm:bottom-7 sm:right-7 z-[90] flex h-12 w-12 sm:h-auto sm:w-auto items-center justify-center gap-3 rounded-full bg-ink p-0 sm:px-5 sm:py-3 text-sm font-bold text-white shadow-fab transition-all duration-smooth ease-brand hover:-translate-y-1 hover:scale-[1.03] hover:shadow-fab-hover',
        className
      )}
    >
      <div className="relative flex items-center justify-center">
        <IconCart className="h-5 w-5" />
        <span className="absolute -right-2.5 -top-2 flex h-4 min-w-[18px] items-center justify-center rounded-full bg-[#25D366] px-1 text-[10px] font-bold text-white leading-none border border-white">
          {count}
        </span>
      </div>
      <span className="hidden sm:inline">Enquiry List</span>
    </button>
  )
}
