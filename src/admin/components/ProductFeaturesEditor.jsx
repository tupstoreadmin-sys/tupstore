import { useState } from 'react'
import { saveProductFeatures } from '../api/adminProductApi'

// Local-edit-then-explicit-save, unlike ProductImageManager's
// immediate-per-action calls — saveProductFeatures() has replace-all
// semantics (delete everything for this product, re-insert the given
// ordered list), so the natural, API-appropriate UX is "edit the whole
// list, then Save" rather than firing a network call per keystroke.
//
// Saving here only ever calls saveProductFeatures() — it never touches
// products, product_images, or product_specifications, so this can never
// affect the rest of the form or the Specifications section.
export function ProductFeaturesEditor({ productId, initialFeatures }) {
  const [features, setFeatures] = useState(
    [...(initialFeatures ?? [])]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((f) => ({ id: f.id, label: f.label }))
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const addFeature = () => {
    // Don't stack a second blank row on top of an existing one.
    if (features.some((f) => !f.label.trim())) return
    setFeatures((prev) => [...prev, { id: crypto.randomUUID(), label: '' }])
    setSuccess('')
  }

  const updateLabel = (id, value) => {
    setFeatures((prev) =>
      prev.map((f) => (f.id === id ? { ...f, label: value } : f))
    )
    setSuccess('')
  }

  const removeFeature = (id) => {
    setFeatures((prev) => prev.filter((f) => f.id !== id))
    setSuccess('')
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
    setSuccess('')
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      // Blank rows (never filled in) are silently dropped rather than
      // blocking the save — per this task's "ignore ... completely empty
      // entries" requirement.
      const labels = features.map((f) => f.label.trim()).filter(Boolean)
      const saved = await saveProductFeatures(productId, labels)
      setFeatures(saved.map((row) => ({ id: row.id, label: row.label })))
      setSuccess('Features saved.')
    } catch (err) {
      setError(err.message || 'Could not save features.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-600">
        Features
      </label>

      {features.length === 0 && (
        <p className="mb-3 text-xs text-slate-400">No features yet.</p>
      )}

      {features.length > 0 && (
        <div className="mb-3 flex flex-col gap-2">
          {features.map((feature, index) => (
            <div key={feature.id} className="flex items-center gap-2">
              <input
                type="text"
                value={feature.label}
                onChange={(e) => updateLabel(feature.id, e.target.value)}
                disabled={saving}
                placeholder="e.g. Leak-proof design"
                className="w-full min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 disabled:opacity-50"
              />
              <button
                type="button"
                aria-label="Move feature earlier"
                onClick={() => moveFeature(index, -1)}
                disabled={index === 0 || saving}
                className="rounded-md border border-slate-300 px-2 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-30"
              >
                ↑
              </button>
              <button
                type="button"
                aria-label="Move feature later"
                onClick={() => moveFeature(index, 1)}
                disabled={index === features.length - 1 || saving}
                className="rounded-md border border-slate-300 px-2 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-30"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => removeFeature(feature.id)}
                disabled={saving}
                className="rounded-md border border-red-200 px-2 py-2 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <p className="mb-2 text-xs text-red-600">{error}</p>}
      {success && <p className="mb-2 text-xs text-green-600">{success}</p>}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={addFeature}
          disabled={saving}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          Add Feature
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save Features'}
        </button>
      </div>
    </div>
  )
}
