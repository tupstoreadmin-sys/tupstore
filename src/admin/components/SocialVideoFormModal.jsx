import { useEffect, useMemo, useState } from 'react'
import { getProductsForTagging } from '../api/adminSocialVideoApi'
import { SocialVideoThumbnailUpload } from './SocialVideoThumbnailUpload'
import { SocialVideoUpload } from './SocialVideoUpload'

function formatInr(amount) {
  if (amount == null) return null
  return `₹${Number(amount).toLocaleString('en-IN')}`
}

function validate({ title, image }) {
  const errors = {}
  if (!title.trim()) errors.title = 'Title is required.'
  if (!image) errors.image = 'A thumbnail is required.'
  return errors
}

// Add/Edit Reel. Follows CategoryFormModal.jsx's structure (a centered
// modal, not a full page route, matching this feature's Category-like
// scale rather than Product's dedicated-page treatment) plus product
// tagging, which social_video_products (0008) needs and neither
// Category nor Product's own forms have an equivalent of.
//
// Does not call any Supabase API directly — onSubmit receives the plain
// social_videos row plus the ordered list of tagged product ids, and the
// parent (AdminSocialVideosPage) owns createSocialVideo/updateSocialVideo
// + replaceTaggedProducts, exactly like AdminCategoriesPage owns
// createCategory/updateCategory. Thumbnail/video uploads are the one
// exception — they upload eagerly to Storage as soon as a file is chosen
// (see SocialVideoThumbnailUpload/SocialVideoUpload), so by the time this
// form is submitted, `image`/`video_url` are already real hosted public
// URLs, never a temporary blob: URL.
//
// @param {object} props
// @param {'add'|'edit'} props.mode
// @param {object} [props.initialValues] - a social_videos row (from
//   getSocialVideos()) plus `taggedProducts` (from getTaggedProducts())
// @param {(values: {row: object, taggedProductIds: string[]}) => Promise<void>} props.onSubmit
// @param {() => void} props.onClose
export function SocialVideoFormModal({ mode, initialValues, onSubmit, onClose }) {
  const [title, setTitle] = useState(initialValues?.title ?? '')
  const [reelUrl, setReelUrl] = useState(initialValues?.reel_url ?? '')
  const [account, setAccount] = useState(initialValues?.account ?? '')
  const [views, setViews] = useState(initialValues?.views ?? '')
  const [duration, setDuration] = useState(initialValues?.duration ?? '')
  const [sortOrder, setSortOrder] = useState(
    initialValues?.sort_order != null ? String(initialValues.sort_order) : '0'
  )
  const [isPublished, setIsPublished] = useState(
    Boolean(initialValues?.is_published)
  )
  const [image, setImage] = useState(initialValues?.image ?? '')
  const [videoUrl, setVideoUrl] = useState(initialValues?.video_url ?? '')

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
    getProductsForTagging()
      .then((products) => {
        if (!cancelled) {
          setAllProducts(products)
          setProductsStatus('ready')
        }
      })
      .catch((error) => {
        console.error('[SocialVideoFormModal] product list failed:', error.message)
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

  // Empty query intentionally yields no results — the picker only shows
  // matches once the admin starts typing, never the full product list.
  const availableProducts = useMemo(() => {
    const query = productSearch.trim().toLowerCase()
    if (!query) return []
    return allProducts.filter((p) => {
      if (taggedProductIds.includes(p.id)) return false
      return [p.name, p.sku, p.product_code].some(
        (field) => field && field.toLowerCase().includes(query)
      )
    })
  }, [allProducts, taggedProductIds, productSearch])

  const handleAddProduct = (productId) => {
    // Belt-and-braces duplicate guard — availableProducts already excludes
    // tagged ids so the Add button for one is never shown, but this keeps
    // taggedProductIds itself safe against duplicates regardless.
    setTaggedProductIds((ids) =>
      ids.includes(productId) ? ids : [...ids, productId]
    )
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
    const nextErrors = validate({ title, image })
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSubmitting(true)
    setSubmitError('')
    try {
      const row = {
        title: title.trim(),
        image,
        video_url: videoUrl || null,
        reel_url: reelUrl.trim() || null,
        account: account.trim() || null,
        views: views.trim() || null,
        duration: duration.trim() || null,
        sort_order: Number.isFinite(Number(sortOrder)) ? Number(sortOrder) : 0,
        is_published: isPublished,
      }
      await onSubmit({ row, taggedProductIds })
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
            {mode === 'edit' ? 'Edit Reel' : 'Add Reel'}
          </h2>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 overflow-y-auto px-6 py-5"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Title *
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
                Instagram / Reel URL
              </label>
              <input
                type="text"
                value={reelUrl}
                onChange={(e) => setReelUrl(e.target.value)}
                disabled={submitting}
                placeholder="Optional"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Username / Account
              </label>
              <input
                type="text"
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                disabled={submitting}
                placeholder="e.g. @TUPPERWARE_KERALA"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Views
              </label>
              <input
                type="text"
                value={views}
                onChange={(e) => setViews(e.target.value)}
                disabled={submitting}
                placeholder="e.g. 115K views"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Duration
              </label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                disabled={submitting}
                placeholder="e.g. 0:42"
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
            </div>
          </div>

          <SocialVideoThumbnailUpload
            value={image}
            onChange={setImage}
            disabled={submitting}
          />
          {errors.image && (
            <p className="-mt-3 text-xs text-red-600">{errors.image}</p>
          )}

          <SocialVideoUpload
            value={videoUrl}
            onChange={setVideoUrl}
            disabled={submitting}
          />

          <label className="inline-flex w-fit items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              disabled={submitting}
              className="h-4 w-4 rounded border-slate-300"
            />
            Published
          </label>

          <div className="border-t border-slate-200 pt-4">
            <label className="mb-2 block text-xs font-medium text-slate-600">
              Tagged Products
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
                <div className="relative">
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search products to tag…"
                    disabled={submitting}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 pr-8 text-sm outline-none focus:border-slate-500 disabled:opacity-50"
                  />
                  {productSearch && (
                    <button
                      type="button"
                      aria-label="Clear search"
                      onClick={() => setProductSearch('')}
                      disabled={submitting}
                      className="absolute right-2 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
                    >
                      ×
                    </button>
                  )}
                </div>

                {productSearch.trim() && (
                  <div className="mt-2 max-h-40 overflow-y-auto rounded-md border border-slate-200">
                    {availableProducts.length === 0 && (
                      <p className="px-3 py-3 text-xs text-slate-400">
                        No products found.
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
                )}
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
            {submitting ? 'Saving…' : mode === 'edit' ? 'Save Changes' : 'Add Reel'}
          </button>
        </div>
      </div>
    </div>
  )
}
