import { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom'
import {
  getAdminProductById,
  getAdminProductCategories,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  uploadProductImage,
  createProductImageRecord,
  deleteProductImage,
} from '../api/adminProductApi'
import { AdminBackLink } from '../components/AdminBackLink'
import { ProductImageManager } from '../components/ProductImageManager'
import { ProductFeaturesEditor } from '../components/ProductFeaturesEditor'
import { ProductSpecificationsEditor } from '../components/ProductSpecificationsEditor'

// Same slugify as CategoryFormModal.jsx — kept as its own local copy
// rather than extracted into a shared util, matching that file's
// precedent (no cross-cutting "slug utils" module exists in this admin
// codebase yet).
function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Comma-separated free text in the UI ("Clear, Frosted Blue") <->
// products.colors (a Postgres text[]). Returns null (not []) for "no
// colors entered" so an edit can explicitly clear a previously-set list —
// see the null-vs-undefined note on buildProductRow below.
function parseColors(value) {
  const items = value
    .split(',')
    .map((c) => c.trim())
    .filter(Boolean)
  return items.length > 0 ? items : null
}

const AVAILABILITY_OPTIONS = [
  { value: 'in_stock', label: 'In Stock' },
  { value: 'out_of_stock', label: 'Out of Stock' },
  { value: 'preorder', label: 'Preorder' },
]

// Same file rules as ProductImageManager.jsx's own ALLOWED_IMAGE_TYPES/
// MAX_IMAGE_BYTES (that component duplicates adminProductApi.js's
// validateProductImageFile() rather than importing it — this follows the
// same existing precedent rather than introducing a new shared module).
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_IMAGE_BYTES = 5 * 1024 * 1024

// Only used for NEW PRODUCT creation — products.image is `not null`, so a
// product must not be considered successfully created without one. Edit
// mode never calls this; its main image is already guaranteed to exist and
// is managed entirely by ProductImageManager instead.
function validateMainImage(file) {
  if (!file) return 'Main product image is required.'
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return 'Please choose a JPG, PNG, or WebP image.'
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return 'Image must be 5 MB or smaller.'
  }
  return null
}

const EMPTY_FORM = {
  name: '',
  productCode: '',
  categoryId: '',
  description: '',
  price: '',
  originalPrice: '',
  availability: 'in_stock',
  featured: false,
  badge: '',
  capacity: '',
  rating: '',
  colors: '',
}

function validate({ name, categoryId, price, originalPrice, rating, availability }) {
  const errors = {}

  if (!name.trim()) errors.name = 'Product name is required.'
  if (!categoryId) errors.categoryId = 'Category is required.'

  if (price.trim() === '') {
    errors.price = 'Price is required.'
  } else if (Number.isNaN(Number(price)) || Number(price) < 0) {
    errors.price = 'Price must be a number 0 or greater.'
  }

  if (originalPrice.trim() !== '') {
    if (Number.isNaN(Number(originalPrice)) || Number(originalPrice) < 0) {
      errors.originalPrice = 'Original price must be a number 0 or greater.'
    }
  }

  if (rating.trim() !== '') {
    const value = Number(rating)
    if (Number.isNaN(value) || value < 0 || value > 5) {
      errors.rating = 'Rating must be a number between 0 and 5.'
    }
  }

  if (!AVAILABILITY_OPTIONS.some((option) => option.value === availability)) {
    errors.availability = 'Select a valid availability status.'
  }

  return errors
}

// Builds the shared part of the insert/update payload. Every optional
// field resolves to `null`, not `undefined`, when left blank —
// adminProductApi.js's pickProductFields() only copies keys that are
// `!== undefined`, so `undefined` would mean "don't touch this column"
// (fine for create, but would silently fail to clear a field the admin
// intentionally emptied out while editing). `null` is always sent
// explicitly so edits can actually clear a previously-set value.
function buildProductRow(form) {
  return {
    name: form.name.trim(),
    product_code: form.productCode.trim() || null,
    category_id: form.categoryId,
    description: form.description.trim() || null,
    price: Number(form.price),
    original_price: form.originalPrice.trim() ? Number(form.originalPrice) : null,
    availability: form.availability,
    featured: form.featured,
    badge: form.badge.trim() || null,
    capacity: form.capacity.trim() || null,
    rating: form.rating.trim() ? Number(form.rating) : null,
    colors: parseColors(form.colors),
  }
}

// Add/Edit Product. Features and specifications are separate later steps —
// this form only covers the plain products-table fields plus, for a brand
// new product only, its required main image.
//
// products.image is `not null` with no default, but its Storage object
// path is namespaced by product id (see uploadProductImage() in
// adminProductApi.js), so the file literally cannot be uploaded before the
// row exists. This form still requires a main image be *selected* before
// "Add Product" can be submitted at all (see validateMainImage), and
// handleSubmit's create branch uploads it immediately after inserting the
// row, using the same uploadProductImage/createProductImageRecord calls
// ProductImageManager itself uses for a first image — no second upload
// system. If that upload fails, the just-created row is deleted again so a
// product can never be left published without its main image; the row is
// never left behind with the honest-empty-string placeholder the old flow
// used to use for every new product.
//
// Edit mode is unaffected: its image is already guaranteed to exist and
// stays entirely owned by ProductImageManager, never touched by this form.
export default function AdminProductFormPage() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const isEdit = Boolean(productId)

  const [loadState, setLoadState] = useState(isEdit ? 'loading' : 'ready')
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  // Create-mode-only: the required main image, held as a plain File until
  // the product row exists to upload it against (see the note above).
  const [mainImageFile, setMainImageFile] = useState(null)
  // Gallery state — only meaningful once a product row exists (edit mode,
  // or right after a successful create redirects into edit mode). Images
  // are managed entirely by ProductImageManager; this page only needs to
  // know the initial list (to pass down) and the current products.image
  // value (to show something if the gallery is still empty).
  const [productImages, setProductImages] = useState([])
  const [currentImageUrl, setCurrentImageUrl] = useState('')
  // Same "only meaningful once a product row exists" reasoning as the
  // gallery state above — ProductFeaturesEditor/ProductSpecificationsEditor
  // own all further editing/saving themselves.
  const [productFeatures, setProductFeatures] = useState([])
  const [productSpecifications, setProductSpecifications] = useState([])
  const justCreated = Boolean(location.state?.justCreated)

  useEffect(() => {
    let cancelled = false

    Promise.all([
      getAdminProductCategories(),
      isEdit ? getAdminProductById(productId) : Promise.resolve(null),
    ])
      .then(([loadedCategories, product]) => {
        if (cancelled) return

        if (isEdit && !product) {
          setLoadState('not-found')
          return
        }

        setCategories(loadedCategories)

        if (product) {
          setForm({
            name: product.name ?? '',
            productCode: product.product_code ?? '',
            categoryId: product.category_id ?? '',
            description: product.description ?? '',
            price: product.price != null ? String(product.price) : '',
            originalPrice:
              product.original_price != null ? String(product.original_price) : '',
            availability: product.availability ?? 'in_stock',
            featured: Boolean(product.featured),
            badge: product.badge ?? '',
            capacity: product.capacity ?? '',
            rating: product.rating != null ? String(product.rating) : '',
            colors: Array.isArray(product.colors) ? product.colors.join(', ') : '',
          })
          setProductImages(product.product_images ?? [])
          setCurrentImageUrl(product.image ?? '')
          setProductFeatures(product.product_features ?? [])
          setProductSpecifications(product.product_specifications ?? [])
        }

        setLoadState('ready')
      })
      .catch((error) => {
        console.error('[AdminProductForm] load failed:', error.message)
        if (!cancelled) setLoadState('error')
      })

    return () => {
      cancelled = true
    }
  }, [productId, isEdit])

  const setField = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((f) => ({ ...f, [field]: value }))
  }

  const handleMainImageChange = (e) => {
    const file = e.target.files?.[0] ?? null
    setMainImageFile(file)
    // Give immediate feedback on an obviously-invalid file, same as every
    // other field's inline error — full re-validation still runs on submit.
    setErrors((prev) => {
      const next = { ...prev }
      const fileError = file ? validateMainImage(file) : null
      if (fileError) next.mainImage = fileError
      else delete next.mainImage
      return next
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const nextErrors = validate(form)
    if (!isEdit) {
      const mainImageError = validateMainImage(mainImageFile)
      if (mainImageError) nextErrors.mainImage = mainImageError
    }
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSubmitting(true)
    setSubmitError('')
    try {
      if (isEdit) {
        // slug and image are deliberately excluded here — the existing
        // product's slug is never silently regenerated, and its image is
        // left untouched by this form (the gallery below manages it).
        await updateAdminProduct(productId, buildProductRow(form))
        navigate('/admin/products')
      } else {
        // The Storage path for the main image is namespaced by product id
        // (see uploadProductImage()), so the row must exist before it can
        // be uploaded — it's still created with an honest empty string
        // first, exactly as before.
        const created = await createAdminProduct({
          ...buildProductRow(form),
          slug: slugify(form.name),
          image: '',
        })

        try {
          const uploadedUrl = await uploadProductImage(mainImageFile, created.id)
          try {
            await createProductImageRecord({
              productId: created.id,
              url: uploadedUrl,
              altText: '',
              sortOrder: 0,
              isPrimary: true,
            })
          } catch (recordError) {
            await deleteProductImage(uploadedUrl).catch(() => {
              // Best-effort cleanup only — the outer catch below already
              // surfaces a clear error and rolls back the product row.
            })
            throw recordError
          }
          await updateAdminProduct(created.id, { image: uploadedUrl })
        } catch (imageError) {
          // The main image is required for a product to be considered
          // successfully created — if it couldn't be saved, don't leave
          // behind a published-looking row with no image. Roll back the
          // row just inserted above (nothing else can reference it yet)
          // and let the admin retry from a clean "Add Product" form.
          await deleteAdminProduct(created.id).catch(() => {})
          throw new Error(
            imageError.message ||
              'The main image could not be saved, so the product was not created. Please try again.',
            { cause: imageError }
          )
        }

        // Redirect straight into this same page's edit mode (not back to
        // the list) so additional gallery images/features/specs can be
        // added immediately — unchanged from the previous flow.
        navigate(`/admin/products/${created.id}/edit`, {
          replace: true,
          state: { justCreated: true },
        })
      }
    } catch (error) {
      setSubmitError(error.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loadState === 'loading') {
    return (
      <div className="flex flex-col gap-6">
        <AdminBackLink to="/admin/products" label="Back to Products" />
        <p className="text-sm text-slate-400">Loading product…</p>
      </div>
    )
  }

  if (loadState === 'not-found') {
    return (
      <div className="flex flex-col gap-6">
        <AdminBackLink to="/admin/products" label="Back to Products" />
        <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <p className="text-sm font-semibold text-slate-600">
            Product not found
          </p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-slate-400">
            This product may have been deleted.
          </p>
        </div>
      </div>
    )
  }

  if (loadState === 'error') {
    return (
      <div className="flex flex-col gap-6">
        <AdminBackLink to="/admin/products" label="Back to Products" />
        <div className="rounded-lg border border-dashed border-red-300 bg-red-50 px-6 py-16 text-center">
          <p className="text-sm font-semibold text-red-700">
            Couldn&apos;t load this product
          </p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-red-500">
            Something went wrong. Please go back and try again.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <AdminBackLink to="/admin/products" label="Back to Products" />

      <div>
        <h1 className="text-xl font-bold text-slate-900">
          {isEdit ? 'Edit Product' : 'Add Product'}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {isEdit
            ? 'Update this product’s details.'
            : 'Fill in the details for a new product.'}
        </p>
      </div>

      {justCreated && (
        <div role="status" className="rounded-md bg-green-50 px-4 py-3 text-sm text-green-700">
          Product created. You can now add images below.
        </div>
      )}

      {submitError && (
        <div role="status" className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {submitError}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-6 rounded-lg border border-slate-200 bg-white p-6"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Product Name *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={setField('name')}
              disabled={submitting}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 disabled:opacity-50"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Product Code / Item No.
            </label>
            <input
              type="text"
              value={form.productCode}
              onChange={setField('productCode')}
              disabled={submitting}
              placeholder="Optional"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Category *
            </label>
            <select
              value={form.categoryId}
              onChange={setField('categoryId')}
              disabled={submitting}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 disabled:opacity-50"
            >
              <option value="" disabled>
                Select a category
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="mt-1 text-xs text-red-600">{errors.categoryId}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Availability *
            </label>
            <select
              value={form.availability}
              onChange={setField('availability')}
              disabled={submitting}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 disabled:opacity-50"
            >
              {AVAILABILITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.availability && (
              <p className="mt-1 text-xs text-red-600">{errors.availability}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Price (₹) *
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={form.price}
              onChange={setField('price')}
              disabled={submitting}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 disabled:opacity-50"
            />
            {errors.price && (
              <p className="mt-1 text-xs text-red-600">{errors.price}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Original Price (₹)
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={form.originalPrice}
              onChange={setField('originalPrice')}
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
              Badge
            </label>
            <input
              type="text"
              value={form.badge}
              onChange={setField('badge')}
              disabled={submitting}
              placeholder="e.g. Best Seller"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Capacity
            </label>
            <input
              type="text"
              value={form.capacity}
              onChange={setField('capacity')}
              disabled={submitting}
              placeholder="e.g. 1000 ml (Set of 4)"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Rating (0–5)
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={form.rating}
              onChange={setField('rating')}
              disabled={submitting}
              placeholder="Optional"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 disabled:opacity-50"
            />
            {errors.rating && (
              <p className="mt-1 text-xs text-red-600">{errors.rating}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Colors
            </label>
            <input
              type="text"
              value={form.colors}
              onChange={setField('colors')}
              disabled={submitting}
              placeholder="e.g. Clear, Frosted Blue"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 disabled:opacity-50"
            />
            <p className="mt-1 text-xs text-slate-400">Comma-separated</p>
          </div>
        </div>

        {!isEdit && (
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Main Product Image *
            </label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleMainImageChange}
              disabled={submitting}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 disabled:opacity-50"
            />
            <p className="mt-1 text-xs text-slate-400">JPG, PNG or WebP · Max 5MB</p>
            {errors.mainImage && (
              <p className="mt-1 text-xs text-red-600">{errors.mainImage}</p>
            )}
          </div>
        )}

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Description
          </label>
          <textarea
            rows={4}
            value={form.description}
            onChange={setField('description')}
            disabled={submitting}
            placeholder="Optional"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 disabled:opacity-50"
          />
        </div>

        <label className="inline-flex w-fit items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={setField('featured')}
            disabled={submitting}
            className="h-4 w-4 rounded border-slate-300"
          />
          Featured product
        </label>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Link
            to="/admin/products"
            className="inline-flex items-center justify-center rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {submitting
              ? 'Saving…'
              : isEdit
                ? 'Save Changes'
                : 'Add Product'}
          </button>
        </div>
      </form>

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        {isEdit ? (
          <ProductImageManager
            productId={productId}
            initialImages={productImages}
            initialImageUrl={currentImageUrl}
            onPrimaryImageChange={setCurrentImageUrl}
          />
        ) : (
          <>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Product Images
            </label>
            <p className="text-xs text-slate-400">
              Save the product first to add images.
            </p>
          </>
        )}
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        {isEdit ? (
          <ProductFeaturesEditor
            productId={productId}
            initialFeatures={productFeatures}
          />
        ) : (
          <>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Features
            </label>
            <p className="text-xs text-slate-400">
              Save the product first to add features.
            </p>
          </>
        )}
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        {isEdit ? (
          <ProductSpecificationsEditor
            productId={productId}
            initialSpecifications={productSpecifications}
          />
        ) : (
          <>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Specifications
            </label>
            <p className="text-xs text-slate-400">
              Save the product first to add specifications.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
