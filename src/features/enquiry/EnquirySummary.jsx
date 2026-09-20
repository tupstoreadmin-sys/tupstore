import { cn } from '../../utils/cn'

// Approx. Total block — DESIGN_SYSTEM.md §18 (confirmed against
// reference/src/main.js's updateEnquiryUI). The sum is display arithmetic
// on the props it's given, not a source of truth for pricing.

/**
 * @param {object} props
 * @param {{price:number, qty:number}[]} props.items
 * @param {string} [props.className]
 */
export function EnquirySummary({ items = [], className }) {
  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0)

  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-md border border-hairline bg-surface-subtle p-4',
        className
      )}
    >
      <span className="text-[14.5px] font-bold text-ink-secondary">
        Approx. Total:
      </span>
      <span className="text-xl font-extrabold text-ink">
        ₹{total.toLocaleString('en-IN')}
      </span>
    </div>
  )
}
