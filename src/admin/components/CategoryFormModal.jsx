import { useState } from 'react'
import { CategoryImageUpload } from './CategoryImageUpload'

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/

function validate({ name, slug }) {
  const errors = {}
  if (!name.trim()) errors.name = 'Name is required.'
  if (!slug.trim()) {
    errors.slug = 'Slug is required.'
  } else if (!SLUG_PATTERN.test(slug.trim())) {
    errors.slug = 'Slug must be lowercase letters, numbers, and hyphens only.'
  }
  return errors
}

/**
 * @param {object} props
 * @param {'add'|'edit'} props.mode
 * @param {{name: string, slug: string, tagline?: string, image?: string}} [props.initialValues]
 * @param {(values: {name: string, slug: string, tagline: string, image: string}) => Promise<void>} props.onSubmit
 * @param {() => void} props.onClose
 */
export function CategoryFormModal({ mode, initialValues, onSubmit, onClose }) {
  const [name, setName] = useState(initialValues?.name ?? '')
  // In "add" mode the slug auto-follows the name (derived below, not
  // stored) until the admin types into the slug field directly; in "edit"
  // mode the existing slug is the starting value and is never silently
  // rewritten as the name changes. `null` means "not yet manually edited".
  const [manualSlug, setManualSlug] = useState(
    mode === 'edit' ? (initialValues?.slug ?? '') : null
  )
  const slug = manualSlug ?? slugify(name)
  const [tagline, setTagline] = useState(initialValues?.tagline ?? '')
  const [image, setImage] = useState(initialValues?.image ?? '')
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    const nextErrors = validate({ name, slug })
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSubmitting(true)
    setSubmitError('')
    try {
      await onSubmit({
        name: name.trim(),
        slug: slug.trim(),
        tagline: tagline.trim(),
        image: image.trim(),
      })
    } catch (error) {
      setSubmitError(error.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-lg font-bold text-slate-900">
          {mode === 'edit' ? 'Edit Category' : 'Add Category'}
        </h2>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={submitting}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 disabled:opacity-50"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Slug *
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setManualSlug(e.target.value)}
              disabled={submitting}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 disabled:opacity-50"
            />
            {errors.slug && (
              <p className="mt-1 text-xs text-red-600">{errors.slug}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Tagline
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              disabled={submitting}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 disabled:opacity-50"
            />
          </div>

          <CategoryImageUpload
            value={image}
            onChange={setImage}
            disabled={submitting}
          />

          {submitError && (
            <p className="text-xs text-red-600">{submitError}</p>
          )}

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {submitting
                ? 'Saving…'
                : mode === 'edit'
                  ? 'Save Changes'
                  : 'Add Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
