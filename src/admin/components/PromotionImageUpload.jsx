import { useRef, useState } from 'react'
import {
  uploadPromotionImage,
  validatePromotionImageFile,
} from '../api/adminPromotionApi'

// Mirrors CategoryImageUpload.jsx's eager-upload-on-select pattern exactly.
// Unlike a category's optional image, promotions.image is `not null` — so
// unlike CategoryImageUpload there is no "Remove" button here, only
// "Upload Image" / "Change Image": the field can be replaced but never
// cleared back to empty, matching AdminProductFormPage's own main-image
// field (also required, also change-only). Uploading a replacement does
// NOT delete the previous Storage object — matching every existing image
// field in this project (Category/Product/Social Video all leave a
// replaced image's old file in place too).
//
// @param {object} props
// @param {string} props.value - current image URL, or '' before the first
//   upload on a new promotion
// @param {(url: string) => void} props.onChange
// @param {boolean} [props.disabled]
export function PromotionImageUpload({ value, onChange, disabled }) {
  const fileInputRef = useRef(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [status, setStatus] = useState('idle') // idle | uploading | error
  const [error, setError] = useState('')

  const displayImage = previewUrl || value

  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-selecting the same file again later
    if (!file) return

    const validationError = validatePromotionImageFile(file)
    if (validationError) {
      setError(validationError)
      setStatus('error')
      return
    }

    const localPreview = URL.createObjectURL(file)
    setPreviewUrl(localPreview)
    setStatus('uploading')
    setError('')

    try {
      const publicUrl = await uploadPromotionImage(file)
      onChange(publicUrl)
      setPreviewUrl(null)
      setStatus('idle')
    } catch (err) {
      setError(err.message || 'Upload failed. Please try again.')
      setStatus('error')
      setPreviewUrl(null) // fall back to showing the existing image, if any
    } finally {
      URL.revokeObjectURL(localPreview)
    }
  }

  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-600">
        Promotion Image *
      </label>

      <div className="flex h-36 w-full items-center justify-center overflow-hidden rounded-md border border-slate-300 bg-slate-50">
        {displayImage ? (
          <img
            src={displayImage}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-xs text-slate-400">No image selected</span>
        )}
      </div>

      {status === 'uploading' && (
        <p className="mt-2 text-xs text-slate-500">Uploading…</p>
      )}
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelected}
        disabled={disabled || status === 'uploading'}
        className="hidden"
      />

      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || status === 'uploading'}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          {value || previewUrl ? 'Change Image' : 'Upload Image'}
        </button>
      </div>
      <p className="mt-1 text-xs text-slate-400">JPG, PNG or WebP · Max 5MB</p>
    </div>
  )
}
