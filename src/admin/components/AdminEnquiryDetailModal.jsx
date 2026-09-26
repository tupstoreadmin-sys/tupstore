import { useState } from 'react'
import { updateEnquiryStatus } from '../api/adminEnquiryApi'

// View + status-change modal for one enquiry. Follows the same centered-
// modal shell as CategoryFormModal.jsx/SocialVideoFormModal.jsx/
// PromotionFormModal.jsx, but is otherwise much simpler: there is no
// editable form here (customer_name/phone/email/message/created_at are
// historical facts, never admin-editable), only a read-only display plus
// one control — status — matching this task's own explicit scope
// ("Admin must be able to change... status").
//
// Status changes apply immediately on selection (no separate Save button),
// matching AdminSocialVideosPage's existing handleTogglePublished
// immediate-effect pattern for a simple state flip, rather than inventing
// a new "pending changes + Save" pattern for a single field.
//
// @param {object} props
// @param {object} props.enquiry - an enquiry row (from getAdminEnquiryById())
// @param {(updated: object) => void} props.onStatusChange - called with the
//   updated enquiry row after a successful status change, so the parent
//   list can stay in sync without a full refetch
// @param {() => void} props.onClose
const STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'closed', label: 'Closed' },
]

function formatDateTime(value) {
  return new Date(value).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function formatInr(amount) {
  if (amount == null) return null
  return `₹${Number(amount).toLocaleString('en-IN')}`
}

export function AdminEnquiryDetailModal({ enquiry, onStatusChange, onClose }) {
  const [status, setStatus] = useState(enquiry.status)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState('')

  const items = enquiry.enquiry_items ?? []
  // The promotion's own tagged products (its "Included Products" reference
  // list) — read live via promotion_products, completely separate from
  // `items` above, which now only ever holds independently-added products
  // (a promotion and products coexist in one enquiry — client decision).
  const includedProducts = (enquiry.promotions?.promotion_products ?? [])
    .map((pp) => pp.products?.name)
    .filter(Boolean)

  const handleStatusChange = async (e) => {
    const nextStatus = e.target.value
    const previousStatus = status
    setStatus(nextStatus) // optimistic — matches handleTogglePublished's own pattern
    setUpdating(true)
    setError('')
    try {
      const updated = await updateEnquiryStatus(enquiry.id, nextStatus)
      onStatusChange?.(updated)
    } catch (err) {
      setStatus(previousStatus) // roll back on failure
      setError(err.message || 'Could not update status. Please try again.')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
      <div className="flex max-h-full w-full max-w-lg flex-col rounded-lg bg-white shadow-xl">
        <div className="shrink-0 border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">Enquiry Details</h2>
        </div>

        <div className="flex flex-col gap-5 overflow-y-auto px-6 py-5">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Status
            </label>
            <select
              value={status}
              onChange={handleStatusChange}
              disabled={updating}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 disabled:opacity-50 sm:w-48"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {updating && (
              <p className="mt-1 text-xs text-slate-500">Updating…</p>
            )}
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-slate-500">Name</p>
              <p className="text-sm text-slate-900">
                {enquiry.customer_name || '—'}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Phone</p>
              <p className="text-sm text-slate-900">
                {enquiry.customer_phone || '—'}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Email</p>
              <p className="text-sm text-slate-900">
                {enquiry.customer_email || '—'}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Submitted</p>
              <p className="text-sm text-slate-900">
                {formatDateTime(enquiry.created_at)}
              </p>
            </div>
          </div>

          {enquiry.customer_message && (
            <div>
              <p className="text-xs font-medium text-slate-500">Message</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                {enquiry.customer_message}
              </p>
            </div>
          )}

          {enquiry.promotions && (
            <div className="border-t border-slate-200 pt-4">
              <p className="mb-2 text-xs font-medium text-slate-500">Promotion</p>
              <p className="text-sm font-medium text-slate-900">
                {enquiry.promotions.title}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Quantity: {enquiry.promotion_quantity ?? 1}
              </p>
              {formatInr(enquiry.promotions.price) && (
                <p className="text-xs text-slate-500">
                  Offer Price: {formatInr(enquiry.promotions.price)} each
                </p>
              )}
              {formatInr(enquiry.promotions.price) && (
                <p className="text-xs text-slate-500">
                  Promotion Total:{' '}
                  {formatInr(
                    enquiry.promotions.price * (enquiry.promotion_quantity ?? 1)
                  )}
                </p>
              )}
              {formatInr(enquiry.promotions.original_price) &&
                enquiry.promotions.original_price > enquiry.promotions.price && (
                  <p className="text-xs text-slate-500">
                    Original Price: {formatInr(enquiry.promotions.original_price)}
                  </p>
                )}

              {includedProducts.length > 0 && (
                <div className="mt-3">
                  <p className="mb-1 text-xs font-medium text-slate-500">
                    Included Products ({includedProducts.length})
                  </p>
                  <ul className="flex flex-col gap-1">
                    {includedProducts.map((name) => (
                      <li key={name} className="text-sm text-slate-700">
                        {name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {(items.length > 0 || !enquiry.promotions) && (
          <div className="border-t border-slate-200 pt-4">
            <p className="mb-2 text-xs font-medium text-slate-500">
              {enquiry.promotions ? 'Additional Products' : 'Requested Products'}{' '}
              {items.length > 0 && `(${items.length})`}
            </p>

            {items.length === 0 && (
              <p className="text-xs text-slate-400">
                No products were attached to this enquiry.
              </p>
            )}

            {items.length > 0 && (
              <div className="flex flex-col gap-2">
                {items.map((item) => {
                  const product = item.products
                  const details = (
                    <p className="text-xs text-slate-500">
                      Qty {item.quantity}
                      {item.selected_color && ` · ${item.selected_color}`}
                      {formatInr(item.price_at_enquiry) &&
                        ` · ${formatInr(item.price_at_enquiry)} each`}
                    </p>
                  )
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 rounded-md border border-slate-200 p-2"
                    >
                      {product ? (
                        // Links to the existing Admin Product Edit route
                        // (/admin/products/:productId/edit), by the real
                        // product_id already embedded via the
                        // enquiry_items -> products FK (see
                        // adminEnquiryApi.js) — never matched by name.
                        // `contents` keeps the <a> out of the flex layout
                        // entirely, so wrapping it changes nothing about
                        // spacing/sizing — only adds the click target.
                        // target="_blank" so the original modal/tab stays
                        // open, per this task's own requirement.
                        <a
                          href={`/admin/products/${product.id}/edit`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="contents"
                        >
                          <img
                            src={product.image}
                            alt=""
                            className="h-10 w-10 shrink-0 rounded-md border border-slate-200 object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-slate-900 hover:text-slate-600 hover:underline">
                              {product.name}
                              <span
                                aria-hidden="true"
                                className="ml-1 text-xs text-slate-400"
                              >
                                ↗
                              </span>
                            </p>
                            {details}
                            {product.product_code && (
                              <p className="mt-0.5 text-[11px] text-slate-400">
                                Product Code: {product.product_code}
                              </p>
                            )}
                          </div>
                        </a>
                      ) : (
                        <>
                          <div className="h-10 w-10 shrink-0 rounded-md border border-slate-200 bg-slate-100" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-slate-400">
                              Product unavailable
                            </p>
                            {details}
                          </div>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
          )}
        </div>

        <div className="flex shrink-0 justify-end gap-2 border-t border-slate-200 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
