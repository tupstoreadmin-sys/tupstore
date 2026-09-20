import { useRef, useState } from 'react'
import {
  uploadCategoryImage,
  validateCategoryImageFile,
} from '../api/adminStorageApi'

/**
 * @param {object} props
 * @param {string} props.value - current image URL, or ''
 * @param {(url: string) => void} props.onChange
 * @param {boolean} [props.disabled]
 */
export function CategoryImageUpload({ value, onChange, disabled }) {
  const fileInputRef = useRef(null)
  // Local blob preview while a file is mid-upload — cleared the moment we
  // have either a real hosted URL (success) or nothing (error/cancelled),
  // so `value` (the actual saved image) is never at risk of being clobbered
  // by a failed upload.
  const [previewUrl, setPreviewUrl] = useState(null)
  const [status, setStatus] = useState('idle') // idle | uploading | error
  const [error, setError] = useState('')

  const displayImage = previewUrl || value

  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-selecting the same file again later
    if (!file) return

    const validationError = validateCategoryImageFile(file)
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
      const publicUrl = await uploadCategoryImage(file)
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

  const handleRemove = () => {
    setPreviewUrl(null)
    setError('')
    setStatus('idle')
    onChange('')
  }

  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-600">
        Category Image
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
        {value && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={disabled || status === 'uploading'}
            className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  )
}
