import { useRef, useState } from 'react'
import { uploadHeroImage, validateHeroImageFile } from '../api/adminHeroApi'

// Mirrors PromotionImageUpload.jsx's eager-upload-on-select pattern
// exactly, generalized to serve both the required desktop image field and
// the optional mobile image field (same bucket, same validation) — the
// caller supplies its own `label`/`required` and whether a "Remove" button
// should exist (mobile image only; the desktop image, like
// promotions.image, can be replaced but never cleared).
//
// @param {object} props
// @param {string} props.label
// @param {string} props.value - current image URL, or '' before the first upload
// @param {(url: string) => void} props.onChange
// @param {boolean} [props.disabled]
// @param {boolean} [props.required] - shows a trailing * on the label only;
//   actual required-ness is enforced by the parent form's own validate()
// @param {boolean} [props.allowClear] - shows a "Remove" button that clears
//   the field back to '' (mobile image only)
export function HeroImageUpload({
  label,
  value,
  onChange,
  disabled,
  required = false,
  allowClear = false,
}) {
  const fileInputRef = useRef(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [status, setStatus] = useState('idle') // idle | uploading | error
  const [error, setError] = useState('')

  const displayImage = previewUrl || value

  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-selecting the same file again later
    if (!file) return

    const validationError = validateHeroImageFile(file)
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
      const publicUrl = await uploadHeroImage(file)
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
        {label}
        {required && ' *'}
      </label>

      <div className="flex h-36 w-full items-center justify-center overflow-hidden rounded-md border border-slate-300 bg-slate-50">
        {displayImage ? (
          <img src={displayImage} alt="" className="h-full w-full object-cover" />
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
        {allowClear && (value || previewUrl) && (
          <button
            type="button"
            onClick={() => {
              onChange('')
              setPreviewUrl(null)
              setError('')
              setStatus('idle')
            }}
            disabled={disabled || status === 'uploading'}
            className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            Remove
          </button>
        )}
      </div>
      <p className="mt-1 text-xs text-slate-400">JPG, PNG or WebP · Max 5MB</p>
    </div>
  )
}
