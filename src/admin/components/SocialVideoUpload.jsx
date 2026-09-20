import { useRef, useState } from 'react'
import {
  uploadSocialVideo,
  validateSocialVideoFile,
} from '../api/adminSocialVideoApi'

// Same eager-upload pattern as SocialVideoThumbnailUpload.jsx/
// CategoryImageUpload.jsx, for the optional `video_url` field. Unlike the
// thumbnail, a video is optional — "Remove" clears it back to '' (stored
// as null by the caller), matching CategoryImageUpload's own Remove
// behavior for an optional field.
//
// @param {object} props
// @param {string} props.value - current video URL, or ''
// @param {(url: string) => void} props.onChange
// @param {boolean} [props.disabled]
export function SocialVideoUpload({ value, onChange, disabled }) {
  const fileInputRef = useRef(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [status, setStatus] = useState('idle') // idle | uploading | error
  const [error, setError] = useState('')

  const displayVideo = previewUrl || value

  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-selecting the same file again later
    if (!file) return

    const validationError = validateSocialVideoFile(file)
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
      const publicUrl = await uploadSocialVideo(file)
      onChange(publicUrl)
      setPreviewUrl(null)
      setStatus('idle')
    } catch (err) {
      setError(err.message || 'Upload failed. Please try again.')
      setStatus('error')
      setPreviewUrl(null) // fall back to showing the existing video, if any
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
        Video
      </label>

      {displayVideo ? (
        <video
          src={displayVideo}
          controls
          className="h-40 w-full rounded-md border border-slate-300 bg-black object-contain"
        />
      ) : (
        <div className="flex h-24 w-full items-center justify-center rounded-md border border-slate-300 bg-slate-50">
          <span className="text-xs text-slate-400">No video selected</span>
        </div>
      )}

      {status === 'uploading' && (
        <p className="mt-2 text-xs text-slate-500">Uploading…</p>
      )}
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm"
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
          {value || previewUrl ? 'Replace Video' : 'Upload Video'}
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
      <p className="mt-1 text-xs text-slate-400">
        MP4 or WebM · Max 50MB · Optional — falls back to the thumbnail if
        omitted
      </p>
    </div>
  )
}
