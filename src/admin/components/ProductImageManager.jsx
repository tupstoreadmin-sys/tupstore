import { useRef, useState } from 'react'
import {
  uploadProductImage,
  deleteProductImage,
  createProductImageRecord,
  updateProductImageRecord,
  deleteProductImageRecord,
  reorderProductImages,
  updateAdminProduct,
  getAdminProductById,
} from '../api/adminProductApi'

// Product image gallery — upload, primary selection, reorder, alt text,
// delete. Every action here is applied immediately (its own Supabase
// call), the same way CategoryImageUpload.jsx uploads on file selection
// rather than waiting for the form's own Save button — there is no
// "unsaved gallery changes" state to lose, and no risk of the big
// Add/Edit form's Save button re-submitting image changes it never made.
//
// Reordering uses simple move-left/move-right buttons rather than drag-
// and-drop — no new dependency, keyboard/touch friendly, and consistent
// with the plain-button style already used everywhere else in this admin
// (Category Carousel's own prev/next arrows use the same idea).
//
// `productId` must belong to an already-created product — this component
// is only ever rendered once a product row exists (see
// AdminProductFormPage.jsx), since Storage paths are namespaced by
// product id.
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_IMAGE_BYTES = 5 * 1024 * 1024

function validateFileLocally(file) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return 'Please choose a JPG, PNG, or WebP image.'
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return 'Image must be 5 MB or smaller.'
  }
  return null
}

/**
 * @param {object} props
 * @param {string} props.productId
 * @param {object[]} props.initialImages - product_images rows, as returned
 *   embedded on getAdminProductById()'s result
 * @param {string} [props.initialImageUrl] - the product's current
 *   products.image value at load time, used only to word the empty-gallery
 *   message correctly for legacy products that have a top-level image but
 *   no product_images rows yet — never used for upload/delete/reorder logic
 * @param {(url: string) => void} [props.onPrimaryImageChange] - fires
 *   whenever products.image is updated as a side effect of a gallery
 *   action, so the parent form can keep its own display in sync
 */
export function ProductImageManager({
  productId,
  initialImages,
  initialImageUrl,
  onPrimaryImageChange,
}) {
  const fileInputRef = useRef(null)
  const [images, setImages] = useState(
    [...(initialImages ?? [])].sort((a, b) => a.sort_order - b.sort_order)
  )
  const [uploading, setUploading] = useState(false)
  const [busyImageId, setBusyImageId] = useState(null)
  const [error, setError] = useState('')
  // Tracked separately from `images` so the empty-state message stays
  // correct even after this component's own actions change
  // products.image (e.g. deleting the last image clears it back to '').
  const [primaryImageUrl, setPrimaryImageUrl] = useState(initialImageUrl || '')

  function notifyPrimaryImageChange(url) {
    setPrimaryImageUrl(url)
    onPrimaryImageChange?.(url)
  }

  // Failure recovery: rather than trying to hand-unwind every possible
  // partial-failure combination, re-fetch the product's real gallery state
  // from Supabase and trust that over any optimistic local state.
  async function refreshImages() {
    try {
      const product = await getAdminProductById(productId)
      setImages(
        [...(product?.product_images ?? [])].sort(
          (a, b) => a.sort_order - b.sort_order
        )
      )
    } catch {
      // Best-effort resync only — if this also fails, the existing local
      // state (however stale) is still better than clearing the gallery.
    }
  }

  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-selecting the same file later
    if (!file) return

    const validationError = validateFileLocally(file)
    if (validationError) {
      setError(validationError)
      return
    }

    setUploading(true)
    setError('')

    let uploadedUrl
    try {
      uploadedUrl = await uploadProductImage(file, productId)
    } catch (uploadError) {
      setError(uploadError.message || 'Upload failed. Please try again.')
      setUploading(false)
      return
    }

    const isFirstImage = images.length === 0
    let created
    try {
      created = await createProductImageRecord({
        productId,
        url: uploadedUrl,
        altText: '',
        sortOrder: images.length,
        isPrimary: isFirstImage,
      })
    } catch (recordError) {
      // The Storage upload succeeded but the database record failed —
      // clean up the now-orphaned file rather than leaving it behind.
      try {
        await deleteProductImage(uploadedUrl)
      } catch {
        // Best-effort cleanup only; the user-facing error below already
        // explains the upload didn't complete.
      }
      setError(recordError.message || 'Could not save the image. Please try again.')
      setUploading(false)
      return
    }

    setImages((prev) => [...prev, created])

    if (created.is_primary) {
      try {
        await updateAdminProduct(productId, { image: created.url })
        notifyPrimaryImageChange(created.url)
      } catch (syncError) {
        console.error(
          '[ProductImageManager] primary sync failed:',
          syncError.message
        )
        setError(
          'The image was uploaded, but the storefront’s primary image could not be updated. Try "Set Primary" on this image again.'
        )
      }
    }

    setUploading(false)
  }

  const handleSetPrimary = async (image) => {
    setBusyImageId(image.id)
    setError('')
    try {
      const others = images.filter((img) => img.id !== image.id && img.is_primary)
      for (const other of others) {
        await updateProductImageRecord(other.id, { isPrimary: false })
      }
      const updated = await updateProductImageRecord(image.id, { isPrimary: true })
      await updateAdminProduct(productId, { image: updated.url })

      setImages((prev) =>
        prev.map((img) =>
          img.id === updated.id ? updated : { ...img, is_primary: false }
        )
      )
      notifyPrimaryImageChange(updated.url)
    } catch (err) {
      setError(err.message || 'Could not set this image as primary.')
      await refreshImages()
    } finally {
      setBusyImageId(null)
    }
  }

  const handleAltTextBlur = async (image, nextValue) => {
    if (nextValue === (image.alt_text ?? '')) return
    setBusyImageId(image.id)
    setError('')
    try {
      const updated = await updateProductImageRecord(image.id, {
        altText: nextValue,
      })
      setImages((prev) =>
        prev.map((img) => (img.id === updated.id ? updated : img))
      )
    } catch (err) {
      setError(err.message || 'Could not update alt text.')
      await refreshImages()
    } finally {
      setBusyImageId(null)
    }
  }

  const handleDeleteImage = async (image) => {
    const wasPrimary = image.is_primary
    const remainingCount = images.length - 1

    if (wasPrimary && remainingCount > 0) {
      setError(
        'This is the primary image. Set another image as primary before deleting it.'
      )
      return
    }

    if (!window.confirm('Delete this image? This cannot be undone.')) return

    setBusyImageId(image.id)
    setError('')
    try {
      await deleteProductImageRecord(image.id)
      setImages((prev) => prev.filter((img) => img.id !== image.id))

      if (wasPrimary) {
        // The only image was just removed — safe-empty, never a
        // fabricated URL, matching the same convention the Add Product
        // flow already uses before any image exists.
        await updateAdminProduct(productId, { image: '' })
        notifyPrimaryImageChange('')
      }

      try {
        await deleteProductImage(image.url)
      } catch (storageError) {
        console.error(
          '[ProductImageManager] storage cleanup failed:',
          storageError.message
        )
        setError(
          'The image was removed, but its file could not be cleaned up from storage. This does not affect the storefront.'
        )
      }
    } catch (err) {
      setError(err.message || 'Could not delete this image.')
      await refreshImages()
    } finally {
      setBusyImageId(null)
    }
  }

  const moveImage = async (index, direction) => {
    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= images.length) return

    const reordered = [...images]
    const [moved] = reordered.splice(index, 1)
    reordered.splice(nextIndex, 0, moved)

    const previous = images
    setImages(reordered)
    setError('')
    try {
      await reorderProductImages(reordered.map((img) => img.id))
    } catch (err) {
      setError(err.message || 'Could not save the new image order.')
      setImages(previous)
    }
  }

  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-600">
        Product Images
      </label>

      {images.length === 0 && (
        <p className="mb-3 text-xs text-slate-400">
          {primaryImageUrl
            ? 'Primary image exists, but no gallery images have been added yet.'
            : 'No images yet.'}
        </p>
      )}

      {images.length > 0 && (
        <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="flex flex-col gap-2 rounded-md border border-slate-200 p-2"
            >
              <div className="relative aspect-square overflow-hidden rounded-md bg-slate-50">
                <img
                  src={image.url}
                  alt={image.alt_text || ''}
                  className="h-full w-full object-cover"
                />
                {image.is_primary && (
                  <span className="absolute left-1 top-1 rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-semibold text-white">
                    Primary
                  </span>
                )}
              </div>

              <input
                type="text"
                defaultValue={image.alt_text ?? ''}
                onBlur={(e) => handleAltTextBlur(image, e.target.value)}
                placeholder="Alt text"
                disabled={busyImageId === image.id}
                className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs outline-none focus:border-slate-500 disabled:opacity-50"
              />

              <div className="flex flex-wrap gap-1">
                {!image.is_primary && (
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(image)}
                    disabled={busyImageId === image.id}
                    className="rounded-md border border-slate-300 px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    Set Primary
                  </button>
                )}
                <button
                  type="button"
                  aria-label="Move image earlier"
                  onClick={() => moveImage(index, -1)}
                  disabled={index === 0 || busyImageId === image.id}
                  className="rounded-md border border-slate-300 px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-30"
                >
                  ←
                </button>
                <button
                  type="button"
                  aria-label="Move image later"
                  onClick={() => moveImage(index, 1)}
                  disabled={index === images.length - 1 || busyImageId === image.id}
                  className="rounded-md border border-slate-300 px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-30"
                >
                  →
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteImage(image)}
                  disabled={busyImageId === image.id}
                  className="rounded-md border border-red-200 px-2 py-1 text-[11px] font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {uploading && (
        <p className="mb-2 text-xs text-slate-500">Uploading…</p>
      )}
      {error && <p className="mb-2 text-xs text-red-600">{error}</p>}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelected}
        disabled={uploading}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
      >
        Upload Image
      </button>
      <p className="mt-1 text-xs text-slate-400">JPG, PNG or WebP · Max 5MB</p>
    </div>
  )
}
