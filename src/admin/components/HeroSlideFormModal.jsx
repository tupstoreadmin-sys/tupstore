import { useEffect, useState } from 'react'
import {
  getCategoriesForHeroTargeting,
  getProductsForHeroTargeting,
} from '../api/adminHeroApi'
import { HeroImageUpload } from './HeroImageUpload'
import { HeroButtonFields } from './HeroButtonFields'

function validate({ title, image }) {
  const errors = {}
  if (!title.trim()) errors.title = 'Title is required.'
  if (!image) errors.image = 'A desktop hero image is required.'
  return errors
}

// Add/Edit Hero Slide. Follows PromotionFormModal.jsx's structure exactly
// (a centered modal, not a full page route) plus an inline reorderable
// feature-bullet list, matching PromotionFormModal's own inline
// tagged-products list pattern (both are a small ordered child collection
// attached to one parent, edited locally and saved together with it).
//
// Does not call hero_slides/hero_slide_features directly except the
// category/product picker lists — onSubmit receives the plain hero_slides
// row plus the ordered list of feature bullet texts, and the parent
// (AdminHeroPage) owns createHeroSlide/updateHeroSlide +
// replaceHeroSlideFeatures, exactly like AdminPromotionsPage owns
// createPromotion/updatePromotion + replaceTaggedPromotionProducts. The
// image upload is the one exception — it uploads eagerly to Storage as
// soon as a file is chosen (see HeroImageUpload), so by the time this form
// is submitted, `image`/`mobile_image` are already real hosted public
// URLs, never temporary blob: URLs.
//
// @param {object} props
// @param {'add'|'edit'} props.mode
// @param {object} [props.initialValues] - a hero_slides row (from
//   getAdminHeroSlideById()) plus its embedded hero_slide_features
// @param {(values: {row: object, featureTexts: string[]}) => Promise<void>} props.onSubmit
// @param {() => void} props.onClose
export function HeroSlideFormModal({ mode, initialValues, onSubmit, onClose }) {
  const [badge, setBadge] = useState(initialValues?.badge ?? '')
  const [title, setTitle] = useState(initialValues?.title ?? '')
  const [image, setImage] = useState(initialValues?.image ?? '')
  const [mobileImage, setMobileImage] = useState(initialValues?.mobile_image ?? '')
  const [altText, setAltText] = useState(initialValues?.alt_text ?? '')
  const [button1Text, setButton1Text] = useState(initialValues?.button1_text ?? '')
  const [button1Type, setButton1Type] = useState(initialValues?.button1_type ?? '')
  const [button1Target, setButton1Target] = useState(initialValues?.button1_target ?? '')
  const [button2Text, setButton2Text] = useState(initialValues?.button2_text ?? '')
  const [button2Type, setButton2Type] = useState(initialValues?.button2_type ?? '')
  const [button2Target, setButton2Target] = useState(initialValues?.button2_target ?? '')
  const [isActive, setIsActive] = useState(Boolean(initialValues?.is_active))
  const [sortOrder, setSortOrder] = useState(
    initialValues?.sort_order != null ? String(initialValues.sort_order) : '0'
  )

  const [features, setFeatures] = useState(
    [...(initialValues?.hero_slide_features ?? [])]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((f) => ({ id: f.id, text: f.text }))
  )

  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [targetsStatus, setTargetsStatus] = useState('loading') // loading | ready | error

  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    let cancelled = false
    Promise.all([getCategoriesForHeroTargeting(), getProductsForHeroTargeting()])
      .then(([categoryList, productList]) => {
        if (!cancelled) {
          setCategories(categoryList)
          setProducts(productList)
          setTargetsStatus('ready')
        }
      })
      .catch((error) => {
        console.error('[HeroSlideFormModal] target lists failed:', error.message)
        if (!cancelled) setTargetsStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [])

  const addFeature = () => {
    // Don't stack a second blank row on top of an existing one.
    if (features.some((f) => !f.text.trim())) return
    setFeatures((prev) => [...prev, { id: crypto.randomUUID(), text: '' }])
  }

  const updateFeatureText = (id, value) => {
    setFeatures((prev) => prev.map((f) => (f.id === id ? { ...f, text: value } : f)))
  }

  const removeFeature = (id) => {
    setFeatures((prev) => prev.filter((f) => f.id !== id))
  }

  const moveFeature = (index, direction) => {
    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= features.length) return
    setFeatures((prev) => {
      const reordered = [...prev]
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
        badge: badge.trim() || null,
        title: title.trim(),
        image,
        mobile_image: mobileImage || null,
        alt_text: altText.trim() || null,
        button1_text: button1Text.trim() || null,
        button1_type: button1Type || null,
        button1_target: button1Type ? button1Target.trim() || null : null,
        button2_text: button2Text.trim() || null,
        button2_type: button2Type || null,
        button2_target: button2Type ? button2Target.trim() || null : null,
        is_active: isActive,
        sort_order: sortOrder.trim() === '' ? 0 : Number(sortOrder),
      }
      const featureTexts = features.map((f) => f.text.trim()).filter(Boolean)
      await onSubmit({ row, featureTexts })
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
            {mode === 'edit' ? 'Edit Hero Slide' : 'Add Hero Slide'}
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

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Badge
              </label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                disabled={submitting}
                placeholder="e.g. Modular Kitchen Essentials"
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

            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Alt Text
              </label>
              <input
                type="text"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                disabled={submitting}
                placeholder="Optional — describes the image for accessibility"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 disabled:opacity-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <HeroImageUpload
              label="Desktop Hero Image"
              required
              value={image}
              onChange={setImage}
              disabled={submitting}
            />
            <HeroImageUpload
              label="Mobile Hero Image"
              allowClear
              value={mobileImage}
              onChange={setMobileImage}
              disabled={submitting}
            />
          </div>
          {errors.image && <p className="-mt-3 text-xs text-red-600">{errors.image}</p>}

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

          <div className="flex flex-col gap-3 border-t border-slate-200 pt-4">
            {targetsStatus === 'loading' && (
              <p className="text-xs text-slate-400">Loading category/product lists…</p>
            )}
            {targetsStatus === 'error' && (
              <p className="text-xs text-red-600">
                Couldn&apos;t load categories/products for button targets. Button
                type/target can&apos;t be set right now.
              </p>
            )}
            {targetsStatus === 'ready' && (
              <>
                <HeroButtonFields
                  legend="Button 1"
                  text={button1Text}
                  onTextChange={setButton1Text}
                  type={button1Type}
                  onTypeChange={setButton1Type}
                  target={button1Target}
                  onTargetChange={setButton1Target}
                  categories={categories}
                  products={products}
                  disabled={submitting}
                />
                <HeroButtonFields
                  legend="Button 2"
                  text={button2Text}
                  onTextChange={setButton2Text}
                  type={button2Type}
                  onTypeChange={setButton2Type}
                  target={button2Target}
                  onTargetChange={setButton2Target}
                  categories={categories}
                  products={products}
                  disabled={submitting}
                />
              </>
            )}
          </div>

          <div className="border-t border-slate-200 pt-4">
            <label className="mb-2 block text-xs font-medium text-slate-600">
              Feature Bullets
            </label>

            {features.length === 0 && (
              <p className="mb-3 text-xs text-slate-400">No feature bullets yet.</p>
            )}

            {features.length > 0 && (
              <div className="mb-3 flex flex-col gap-2">
                {features.map((feature, index) => (
                  <div key={feature.id} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={feature.text}
                      onChange={(e) => updateFeatureText(feature.id, e.target.value)}
                      disabled={submitting}
                      placeholder="e.g. 100% Air-Tight Moisture Seal"
                      className="w-full min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 disabled:opacity-50"
                    />
                    <button
                      type="button"
                      aria-label="Move feature earlier"
                      onClick={() => moveFeature(index, -1)}
                      disabled={index === 0 || submitting}
                      className="rounded-md border border-slate-300 px-2 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      aria-label="Move feature later"
                      onClick={() => moveFeature(index, 1)}
                      disabled={index === features.length - 1 || submitting}
                      className="rounded-md border border-slate-300 px-2 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-30"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => removeFeature(feature.id)}
                      disabled={submitting}
                      className="rounded-md border border-red-200 px-2 py-2 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={addFeature}
              disabled={submitting}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Add Feature Bullet
            </button>
          </div>

          {submitError && <p className="text-xs text-red-600">{submitError}</p>}
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
            {submitting ? 'Saving…' : mode === 'edit' ? 'Save Changes' : 'Add Hero Slide'}
          </button>
        </div>
      </div>
    </div>
  )
}
