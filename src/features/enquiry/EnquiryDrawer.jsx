import { useState } from 'react'
import { cn } from '../../utils/cn'
import { Button, EmptyState, ProductPrice } from '../../components/ui'
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
// already owns for qty/color. `if (!isOpen) return null` alone does NOT
// unmount this component — a plain `<EnquiryDrawer isOpen={...} />` at a
// stable tree position keeps the same instance (and its `step`/`result`
// state) alive across every close/reopen, it just skips rendering while
// closed. App.jsx gives this component a `key` tied to `isOpen` specifically
// so that closing and reopening *does* force a real unmount/remount — that
// is what actually resets `step`/`result` back to a fresh cart view each
// time the drawer opens; without it, closing from the success screen
// (Done, the X button, or the overlay) and reopening redisplays the same
// stale success screen instead of the current enquiry state.

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
 * @param {{id: string, title: string, price?: number, originalPrice?: number}} [props.promotion] -
 *   set when this enquiry is "about" a promotion (see
 *   useAddPromotionToEnquiry.js). When present, `items` (that promotion's
 *   own tagged products, if any) are shown as a plain reference list under
 *   the promotion, never as independent line items with their own qty/
 *   price/remove controls — and the drawer allows proceeding to submit even
 *   with 0 items, which it otherwise never does.
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
  promotion,
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
              ({promotion ? 1 : items.length})
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
          ) : promotion ? (
            // A promotion is one offer, not a set of independent line items
            // — its own tagged products (if any) are shown below it as a
            // plain reference list, never with their own qty/price/remove
            // controls (see EnquiryContext.jsx's matching `count` rule and
            // Admin's "Included Products" list, which uses the same plain-
            // name-list treatment for the same reason).
            <div className="flex flex-col gap-2 rounded-md border border-hairline bg-surface-subtle p-4">
              <span className="w-fit rounded-full bg-black px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                Promotion
              </span>
              <p className="text-sm font-bold leading-[1.3] text-ink">
                {promotion.title}
              </p>
              {promotion.price != null && (
                <ProductPrice
                  price={promotion.price}
                  originalPrice={promotion.originalPrice}
                />
              )}
              {items.length > 0 ? (
                <div className="mt-1 border-t border-hairline pt-2">
                  <p className="mb-1 text-xs font-medium text-ink-secondary">
                    Included:
                  </p>
                  <ul className="flex flex-col gap-0.5">
                    {items.map((item) => (
                      <li key={item.id} className="text-sm text-ink">
                        {item.name}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-xs text-ink-secondary">
                  No individual products selected — you&apos;re enquiring
                  about this offer.
                </p>
              )}
            </div>
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

        {step === 'cart' && (items.length > 0 || promotion) && (
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
