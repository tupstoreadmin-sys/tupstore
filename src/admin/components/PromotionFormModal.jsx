import { useEffect, useMemo, useState } from 'react'
import { getProductsForPromotionTagging } from '../api/adminPromotionApi'
import { PromotionImageUpload } from './PromotionImageUpload'

function formatInr(amount) {
  if (amount == null) return null
  return `₹${Number(amount).toLocaleString('en-IN')}`
}

// Same slugify as AdminProductFormPage.jsx/CategoryFormModal.jsx — kept as
// its own local copy rather than extracted into a shared util, matching
// those files' established precedent (no cross-cutting "slug utils" module
// exists in this admin codebase). Only used on create (see handleSubmit) —
// an existing promotion's slug is never silently regenerated on edit,
// exactly like a product's slug isn't.
function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Both promotion card buttons are fixed, non-editable copy (client
// decision — see PromotionStrip.jsx, which renders Button 1 from
// `button_text` and hardcodes Button 2 directly). Button 1's text is still
// written to the existing `button_text` column on every save so the schema
// and mapper/API surface don't change; Button 2 has no column at all.
const PROMOTION_BUTTON_1_TEXT = 'View Offer'
const PROMOTION_BUTTON_2_TEXT = 'WhatsApp Enquiry'

// `value: ''` for "No Badge" — the submit handler's existing
// `badge.trim() || null` already turns that into a database NULL. A
// promotion loaded with some other (legacy) badge value than these five is
// preserved via the extra option rendered below, never silently reset to
// "No Badge" or overwritten — same pattern as AdminProductFormPage.jsx's
// BADGE_OPTIONS.
const PROMOTION_BADGE_OPTIONS = [
  { value: '', label: 'No Badge' },
  { value: 'New Arrival', label: 'New Arrival' },
  { value: 'Best Seller', label: 'Best Seller' },
  { value: 'Limited Combo Offer', label: 'Limited Combo Offer' },
  { value: 'Featured Collection', label: 'Featured Collection' },
]

// price/originalPrice are optional (blank string = "not set") — only
// validated *when provided*, matching the task's own "if provided, must be
// greater than 0" rule. "original > price when both provided" is a
// blocking validation message here, not a silent correction and not a DB
// constraint (the migration only enforces each value being > 0 on its own).
function validate({ title, image, sortOrder, price, originalPrice }) {
  const errors = {}
  if (!title.trim()) errors.title = 'Promotion title is required.'
  if (!image) errors.image = 'A promotion image is required.'
  if (sortOrder.trim() !== '' && !Number.isInteger(Number(sortOrder))) {
    errors.sortOrder = 'Sort order must be a whole number.'
  }

  const priceValue = price.trim() === '' ? null : Number(price)
  if (priceValue != null && !(priceValue > 0)) {
    errors.price = 'Offer price must be greater than 0.'
  }

  const originalPriceValue = originalPrice.trim() === '' ? null : Number(originalPrice)
  if (originalPriceValue != null && !(originalPriceValue > 0)) {
    errors.originalPrice = 'Original price must be greater than 0.'
  }

  if (
    !errors.price &&
    !errors.originalPrice &&
    priceValue != null &&
    originalPriceValue != null &&
    originalPriceValue <= priceValue
  ) {
    errors.originalPrice = 'Original price must be greater than the offer price.'
  }

  return errors
}

// Add/Edit Promotion. Follows SocialVideoFormModal.jsx's structure exactly
// (a centered modal, not a full page route, matching this feature's
// Category/Social-Video-like scale rather than Product's dedicated-page
// treatment) plus product tagging, which promotion_products (0012) needs
// and neither Category's nor Product's own forms have an equivalent of.
//
// Does not call any Supabase API directly except the tagging product list
// — onSubmit receives the plain promotions row plus the ordered list of
// tagged product ids, and the parent (AdminPromotionsPage) owns
// createPromotion/updatePromotion + replaceTaggedPromotionProducts,
// exactly like AdminSocialVideosPage owns createSocialVideo/
// updateSocialVideo + replaceTaggedProducts. The image upload is the one
// exception — it uploads eagerly to Storage as soon as a file is chosen
// (see PromotionImageUpload), so by the time this form is submitted,
// `image` is already a real hosted public URL, never a temporary blob: URL.
//
// @param {object} props
// @param {'add'|'edit'} props.mode
// @param {object} [props.initialValues] - a promotions row (from
//   getAdminPromotionById()) plus `taggedProducts` (its embedded
//   promotion_products)
// @param {(values: {row: object, taggedProductIds: string[]}) => Promise<void>} props.onSubmit
// @param {() => void} props.onClose
export function PromotionFormModal({ mode, initialValues, onSubmit, onClose }) {
  const [title, setTitle] = useState(initialValues?.title ?? '')
  const [description, setDescription] = useState(initialValues?.description ?? '')
  const [badge, setBadge] = useState(initialValues?.badge ?? '')
  const [price, setPrice] = useState(
    initialValues?.price != null ? String(initialValues.price) : ''
  )
  const [originalPrice, setOriginalPrice] = useState(
    initialValues?.original_price != null ? String(initialValues.original_price) : ''
  )
  const [whatsappText, setWhatsappText] = useState(initialValues?.whatsapp_text ?? '')
  const [isActive, setIsActive] = useState(Boolean(initialValues?.is_active))
  const [sortOrder, setSortOrder] = useState(
    initialValues?.sort_order != null ? String(initialValues.sort_order) : '0'
  )
  const [image, setImage] = useState(initialValues?.image ?? '')

  const [allProducts, setAllProducts] = useState([])
  const [productsStatus, setProductsStatus] = useState('loading') // loading | ready | error
  const [productSearch, setProductSearch] = useState('')
  const [taggedProductIds, setTaggedProductIds] = useState(
    (initialValues?.taggedProducts ?? [])
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((tp) => tp.product_id)
  )

  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    let cancelled = false
    getProductsForPromotionTagging()
      .then((products) => {
        if (!cancelled) {
          setAllProducts(products)
          setProductsStatus('ready')
        }
      })
      .catch((error) => {
        console.error('[PromotionFormModal] product list failed:', error.message)
        if (!cancelled) setProductsStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [])

  const productsById = useMemo(
    () => new Map(allProducts.map((p) => [p.id, p])),
    [allProducts]
  )

  const taggedProducts = useMemo(
    () =>
      taggedProductIds
        .map((id) => productsById.get(id))
        .filter(Boolean)
        .map((product, index) => ({ product, id: taggedProductIds[index] })),
    [taggedProductIds, productsById]
  )

  const availableProducts = useMemo(() => {
    const query = productSearch.trim().toLowerCase()
    return allProducts.filter((p) => {
      if (taggedProductIds.includes(p.id)) return false
      if (query && !p.name.toLowerCase().includes(query)) return false
      return true
    })
  }, [allProducts, taggedProductIds, productSearch])

  // Duplicate selection is structurally impossible: a product already in
  // taggedProductIds is filtered out of availableProducts above, so it can
  // never be "Add"ed a second time.
  const handleAddProduct = (productId) => {
    setTaggedProductIds((ids) => [...ids, productId])
  }

  const handleRemoveProduct = (productId) => {
    setTaggedProductIds((ids) => ids.filter((id) => id !== productId))
  }

  const moveProduct = (index, direction) => {
    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= taggedProductIds.length) return
    setTaggedProductIds((ids) => {
      const reordered = [...ids]
      const [moved] = reordered.splice(index, 1)
      reordered.splice(nextIndex, 0, moved)
      return reordered
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const nextErrors = validate({ title, image, sortOrder, price, originalPrice })
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSubmitting(true)
    setSubmitError('')
    try {
      const row = {
        title: title.trim(),
        description: description.trim() || null,
        image,
        badge: badge.trim() || null,
        button_text: PROMOTION_BUTTON_1_TEXT,
        price: price.trim() === '' ? null : Number(price),
        original_price: originalPrice.trim() === '' ? null : Number(originalPrice),
        whatsapp_text: whatsappText.trim() || null,
        is_active: isActive,
        sort_order: sortOrder.trim() === '' ? 0 : Number(sortOrder),
      }
      // slug is generated once, on create, from the title at that moment —
      // never included on edit, so an existing promotion's slug (and thus
      // its /promotion/:slug URL) is never silently regenerated when its
      // title is later changed. Matches AdminProductFormPage.jsx's exact
      // same-precedent handling of a product's own slug.
      if (mode === 'add') {
        row.slug = slugify(title.trim())
      }
      await onSubmit({ row, taggedProductIds })
      // Preserve unsaved form state on failure — do NOT clear/reset any
      // field here; only a caught error below leaves this function early,
      // and a successful onSubmit() unmounts this modal from the parent.
    } catch (error) {
      setSubmitError(error.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
      <div className="flex max-h-full w-full max-w-2xl flex-col rounded-lg bg-white shadow-xl">
        <div className="shrink-0 border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">
            {mode === 'edit' ? 'Edit Promotion' : 'Add Promotion'}
          </h2>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 overflow-y-auto px-6 py-5"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Promotion Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={submitting}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 disabled:opacity-50"
              />
              {errors.title && (
                <p className="mt-1 text-xs text-red-600">{errors.title}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Description
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={submitting}
                placeholder="Optional"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Badge
              </label>
              <select
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                disabled={submitting}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 disabled:opacity-50"
              >
                {PROMOTION_BADGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
                {badge &&
                  !PROMOTION_BADGE_OPTIONS.some((option) => option.value === badge) && (
                    <option value={badge}>{badge}</option>
                  )}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Offer Price
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                disabled={submitting}
                placeholder="Optional"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 disabled:opacity-50"
              />
              {errors.price && (
                <p className="mt-1 text-xs text-red-600">{errors.price}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Original Price
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                disabled={submitting}
                placeholder="Optional"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 disabled:opacity-50"
              />
              {errors.originalPrice && (
                <p className="mt-1 text-xs text-red-600">{errors.originalPrice}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Promotion Buttons
              </label>
              <div className="flex flex-col gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-slate-500">Button 1</span>
                  <span className="font-medium text-slate-700">{PROMOTION_BUTTON_1_TEXT}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-slate-500">Button 2</span>
                  <span className="font-medium text-slate-700">{PROMOTION_BUTTON_2_TEXT}</span>
                </div>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                Button text is fixed and cannot be edited.
              </p>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-slate-600">
                WhatsApp Text
              </label>
              <textarea
                rows={2}
                value={whatsappText}
                onChange={(e) => setWhatsappText(e.target.value)}
                disabled={submitting}
                placeholder="Optional"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Sort Order
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                disabled={submitting}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 disabled:opacity-50"
              />
              {errors.sortOrder && (
                <p className="mt-1 text-xs text-red-600">{errors.sortOrder}</p>
              )}
            </div>
          </div>

          <PromotionImageUpload
            value={image}
            onChange={setImage}
            disabled={submitting}
          />
          {errors.image && (
            <p className="-mt-3 text-xs text-red-600">{errors.image}</p>
          )}

          <label className="inline-flex w-fit items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              disabled={submitting}
              className="h-4 w-4 rounded border-slate-300"
            />
            Active
          </label>

          <div className="border-t border-slate-200 pt-4">
            <label className="mb-2 block text-xs font-medium text-slate-600">
              Products in this Promotion
            </label>

            {taggedProducts.length > 0 && (
              <div className="mb-3 flex flex-col gap-2">
                {taggedProducts.map(({ product, id }, index) => (
                  <div
                    key={id}
                    className="flex items-center gap-3 rounded-md border border-slate-200 p-2"
                  >
                    <img
                      src={product.image}
                      alt=""
                      className="h-10 w-10 shrink-0 rounded-md border border-slate-200 object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {product.name}
                      </p>
                      {formatInr(product.price) && (
                        <p className="text-xs text-slate-500">
                          {formatInr(product.price)}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        aria-label="Move product earlier"
                        onClick={() => moveProduct(index, -1)}
                        disabled={index === 0 || submitting}
                        className="rounded-md border border-slate-300 px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-30"
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        aria-label="Move product later"
                        onClick={() => moveProduct(index, 1)}
                        disabled={index === taggedProducts.length - 1 || submitting}
                        className="rounded-md border border-slate-300 px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-30"
                      >
                        →
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveProduct(product.id)}
                        disabled={submitting}
                        className="rounded-md border border-red-200 px-2 py-1 text-[11px] font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {productsStatus === 'loading' && (
              <p className="text-xs text-slate-400">Loading products…</p>
            )}
            {productsStatus === 'error' && (
              <p className="text-xs text-red-600">
                Couldn&apos;t load products to tag.
              </p>
            )}

            {productsStatus === 'ready' && (
              <>
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search products to tag…"
                  disabled={submitting}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 disabled:opacity-50"
                />
                <div className="mt-2 max-h-40 overflow-y-auto rounded-md border border-slate-200">
                  {availableProducts.length === 0 && (
                    <p className="px-3 py-3 text-xs text-slate-400">
                      {allProducts.length === 0
                        ? 'No products available.'
                        : 'No matching products.'}
                    </p>
                  )}
                  {availableProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-3 border-b border-slate-100 p-2 last:border-0"
                    >
                      <img
                        src={product.image}
                        alt=""
                        className="h-8 w-8 shrink-0 rounded-md border border-slate-200 object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-slate-800">
                          {product.name}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddProduct(product.id)}
                        disabled={submitting}
                        className="shrink-0 rounded-md border border-slate-300 px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                      >
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {submitError && (
            <p className="text-xs text-red-600">{submitError}</p>
          )}
        </form>

        <div className="flex shrink-0 justify-end gap-2 border-t border-slate-200 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {submitting ? 'Saving…' : mode === 'edit' ? 'Save Changes' : 'Add Promotion'}
          </button>
        </div>
      </div>
    </div>
  )
}
