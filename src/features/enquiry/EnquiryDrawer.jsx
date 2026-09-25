import { useState } from 'react'
import { cn } from '../../utils/cn'
import { Button, EmptyState } from '../../components/ui'
import { IconClose, IconCart } from '../../components/layout/icons'
import { EnquiryItem } from './EnquiryItem'
import { EnquirySummary } from './EnquirySummary'
import { EnquiryCustomerForm } from './EnquiryCustomerForm'

// .enquiry-drawer / .drawer-header / .drawer-body — DESIGN_SYSTEM.md
// §7/§18 (shadow-drawer token). Self-contained like SearchOverlay (no
// generic Drawer/Modal primitive exists yet) — fully controlled, no
// enquiry-list state of its own; increment/decrement/remove/submit are
// all callback props.
//
// Milestone 8 adds a local `step` (cart → details → success) — pure UI
// flow state, not business data, same category of local state ProductInfo
// already owns for qty/color. `if (!isOpen) return null` below unmounts
// this whole subtree on close, so `step` resets to 'cart' for free the
// next time the drawer opens — no explicit reset needed.

/**
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {() => void} props.onClose
 * @param {object[]} [props.items] - EnquiryItem `item` shape
 * @param {(item: object) => void} [props.onIncrement]
 * @param {(item: object) => void} [props.onDecrement]
 * @param {(item: object) => void} [props.onRemove]
 * @param {(details: import('../../models/Enquiry').CustomerDetails) => Promise<{id: string|null, persisted: boolean}>} [props.onSubmit]
 * @param {boolean} [props.submitting]
 * @param {string} [props.submitError]
 * @param {string} [props.className]
 */
export function EnquiryDrawer({
  isOpen,
  onClose,
  items = [],
  onIncrement,
  onDecrement,
  onRemove,
  onSubmit,
  submitting = false,
  submitError,
  className,
}) {
  const [step, setStep] = useState('cart')
  const [result, setResult] = useState(null)

  if (!isOpen) return null

  const handleCustomerSubmit = async (details) => {
    try {
      const outcome = await onSubmit?.(details)
      setResult(outcome ?? null)
      setStep('success')
    } catch {
      // onSubmit already recorded the error (submitError prop); stay on
      // the details step so items + typed values are preserved for retry.
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-[290] bg-overlay" onClick={onClose} />
      <aside
        className={cn(
          'fixed inset-y-0 right-0 z-[300] flex w-full max-w-[460px] flex-col bg-white shadow-drawer',
          className
        )}
      >
        <div className="flex items-center justify-between border-b border-hairline p-6">
          <h3 className="flex items-center gap-2 text-xl text-ink">
            <IconCart className="h-5 w-5" />
            Your Enquiry List
            <span className="text-sm font-normal text-ink-secondary">
              ({items.length})
            </span>
          </h3>
          <button
            type="button"
            aria-label="Close enquiry list"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink-secondary transition-colors duration-fast ease-brand hover:text-ink"
          >
            <IconClose className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 pb-12">
          {step === 'success' ? (
            <EmptyState
              icon="✅"
              title="Your enquiry has been submitted successfully."
              description={
                result?.persisted
                  ? `Reference ID: ${result.id}`
                  : 'This was a demo submission — no database record was created, but your WhatsApp message is ready to send.'
              }
              action={
                <Button variant="primary" onClick={onClose}>
                  Done
                </Button>
              }
            />
          ) : step === 'details' ? (
            <EnquiryCustomerForm
              onSubmit={handleCustomerSubmit}
              onBack={() => setStep('cart')}
              submitting={submitting}
              error={submitError}
            />
          ) : items.length === 0 ? (
            <EmptyState
              icon="📝"
              title="Your enquiry list is empty"
              description="Browse our premium catalog, add products to the list, and submit via WhatsApp."
            />
          ) : (
            <div className="flex flex-col gap-4">
              {items.map((item) => (
                <EnquiryItem
                  key={item.id}
                  item={item}
                  onIncrement={onIncrement}
                  onDecrement={onDecrement}
                  onRemove={onRemove}
                />
              ))}
              <EnquirySummary items={items} className="mt-2" />
            </div>
          )}
        </div>

        {step === 'cart' && items.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-hairline bg-surface-subtle p-6">
            <Button variant="secondary" fullWidth onClick={onClose}>
              Continue Shopping
            </Button>
            <Button variant="wa" fullWidth onClick={() => setStep('details')}>
              Proceed to Enquiry
            </Button>
          </div>
        )}
      </aside>
    </>
  )
}
