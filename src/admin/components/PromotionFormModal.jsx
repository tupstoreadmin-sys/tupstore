import { useEffect, useMemo, useState } from 'react'
import { getProductsForPromotionTagging } from '../api/adminPromotionApi'
import { PromotionImageUpload } from './PromotionImageUpload'

function formatInr(amount) {
  if (amount == null) return null
  return `₹${Number(amount).toLocaleString('en-IN')}`
}

function validate({ title, buttonText, image, sortOrder }) {
  const errors = {}
  if (!title.trim()) errors.title = 'Promotion title is required.'
  if (!buttonText.trim()) errors.buttonText = 'Button text is required.'
  if (!image) errors.image = 'A promotion image is required.'
  if (sortOrder.trim() !== '' && !Number.isInteger(Number(sortOrder))) {
    errors.sortOrder = 'Sort order must be a whole number.'
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
  const [buttonText, setButtonText] = useState(
    initialValues?.button_text ?? 'View Offer'
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
    const nextErrors = validate({ title, buttonText, image, sortOrder })
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
        button_text: buttonText.trim(),
        whatsapp_text: whatsappText.trim() || null,
        is_active: isActive,
        sort_order: sortOrder.trim() === '' ? 0 : Number(sortOrder),
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
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                disabled={submitting}
                placeholder="e.g. LIMITED OFFER, BEST VALUE, NEW"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Button Text *
              </label>
              <input
                type="text"
                value={buttonText}
                onChange={(e) => setButtonText(e.target.value)}
                disabled={submitting}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 disabled:opacity-50"
              />
              {errors.buttonText && (
                <p className="mt-1 text-xs text-red-600">{errors.buttonText}</p>
              )}
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
