import { cn } from '../../utils/cn'
import { IconClose } from '../../components/layout/icons'

// .enquiry-item / .quantity-controls / .qty-btn — DESIGN_SYSTEM.md §18.
// Fully controlled — increment/decrement/remove are callbacks, this
// component holds no quantity state of its own.

/**
 * @param {object} props
 * @param {{id:string|number, name:string, image:string, capacity?:string,
 *   price:number, qty:number, selectedColor?:string}} props.item
 * @param {(item: object) => void} [props.onIncrement]
 * @param {(item: object) => void} [props.onDecrement]
 * @param {(item: object) => void} [props.onRemove]
 * @param {string} [props.className]
 */
export function EnquiryItem({
  item,
  onIncrement,
  onDecrement,
  onRemove,
  className,
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-4 rounded-md border border-hairline bg-surface-subtle p-3',
        className
      )}
    >
      <img
        src={item.image}
        alt={item.name}
        className="h-[60px] w-[60px] shrink-0 rounded-sm bg-white object-contain p-1"
      />
      <div className="flex-1">
        <div className="text-sm font-bold leading-[1.2] text-ink">
          {item.name}
        </div>
        <div className="text-xs text-ink-secondary">
          {[item.capacity, item.selectedColor].filter(Boolean).join(' • ')}
        </div>
        <div className="my-1 text-[13px] font-bold text-ink">
          ₹{item.price.toLocaleString('en-IN')}
        </div>
        <div className="mt-1.5 flex items-center gap-2">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => onDecrement?.(item)}
            className="flex h-6 w-6 items-center justify-center rounded border border-hairline bg-white text-ink transition-colors duration-fast ease-brand hover:bg-surface-subtle"
          >
            −
          </button>
          <span className="text-[13px] font-semibold text-ink">
            Qty: {item.qty}
          </span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => onIncrement?.(item)}
            className="flex h-6 w-6 items-center justify-center rounded border border-hairline bg-white text-ink transition-colors duration-fast ease-brand hover:bg-surface-subtle"
          >
            +
          </button>
        </div>
      </div>
      <button
        type="button"
        aria-label="Remove item"
        onClick={() => onRemove?.(item)}
        className="p-1 text-ink-secondary transition-colors duration-fast ease-brand hover:text-error"
      >
        <IconClose className="h-[18px] w-[18px]" />
      </button>
    </div>
  )
}
