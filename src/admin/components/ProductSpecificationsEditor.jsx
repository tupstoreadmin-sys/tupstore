import { useState } from 'react'
import { saveProductSpecifications } from '../api/adminProductApi'

// Same local-edit-then-explicit-save shape as ProductFeaturesEditor.jsx —
// saveProductSpecifications() also has replace-all semantics. Saving here
// only ever calls saveProductSpecifications() — it never touches products,
// product_images, or product_features, so this can never affect the
// Features section or the rest of the form.
//
// db/schema.sql: product_specifications.spec_value is NOT NULL (unlike
// product_features, which is a single required column) — so both key and
// value are required here, not just the key.

function validateRows(specs) {
  const errors = {}
  const seenKeys = new Set()

  for (const spec of specs) {
    const key = spec.key.trim()
    const value = spec.value.trim()
    if (!key && !value) continue // fully blank row — ignored, not an error

    if (!key) {
      errors[spec.id] = 'Key is required.'
    } else if (!value) {
      errors[spec.id] = 'Value is required.'
    } else if (seenKeys.has(key.toLowerCase())) {
      errors[spec.id] = 'This key is already used above.'
    } else {
      seenKeys.add(key.toLowerCase())
    }
  }

  return errors
}

export function ProductSpecificationsEditor({ productId, initialSpecifications }) {
  const [specs, setSpecs] = useState(
    [...(initialSpecifications ?? [])]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((s) => ({ id: s.id, key: s.spec_key, value: s.spec_value }))
  )
  const [rowErrors, setRowErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const addSpec = () => {
    // Don't stack a second fully-blank row on top of an existing one.
    if (specs.some((s) => !s.key.trim() && !s.value.trim())) return
    setSpecs((prev) => [
      ...prev,
      { id: crypto.randomUUID(), key: '', value: '' },
    ])
    setSuccess('')
  }

  const updateField = (id, field, value) => {
    setSpecs((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    )
    setSuccess('')
  }

  const removeSpec = (id) => {
    setSpecs((prev) => prev.filter((s) => s.id !== id))
    setRowErrors((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
    setSuccess('')
  }

  const moveSpec = (index, direction) => {
    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= specs.length) return
    setSpecs((prev) => {
      const reordered = [...prev]
      const [moved] = reordered.splice(index, 1)
      reordered.splice(nextIndex, 0, moved)
      return reordered
    })
    setSuccess('')
  }

  const handleSave = async () => {
    const errors = validateRows(specs)
    setRowErrors(errors)
    if (Object.keys(errors).length > 0) return

    setSaving(true)
    setError('')
    setSuccess('')
    try {
      // Fully blank rows are silently dropped; every remaining row already
      // passed validation above (both key and value present, no duplicates).
      const entries = specs
        .map((s) => ({ key: s.key.trim(), value: s.value.trim() }))
        .filter((s) => s.key || s.value)

      const saved = await saveProductSpecifications(productId, entries)
      setSpecs(
        saved.map((row) => ({
          id: row.id,
          key: row.spec_key,
          value: row.spec_value,
        }))
      )
      setSuccess('Specifications saved.')
    } catch (err) {
      setError(err.message || 'Could not save specifications.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-600">
        Specifications
      </label>

      {specs.length === 0 && (
        <p className="mb-3 text-xs text-slate-400">No specifications yet.</p>
      )}

      {specs.length > 0 && (
        <div className="mb-3 flex flex-col gap-2">
          {specs.map((spec, index) => (
            <div key={spec.id} className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={spec.key}
                  onChange={(e) => updateField(spec.id, 'key', e.target.value)}
                  disabled={saving}
                  placeholder="Key, e.g. Material"
                  className="w-full min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 disabled:opacity-50"
                />
                <input
                  type="text"
                  value={spec.value}
                  onChange={(e) => updateField(spec.id, 'value', e.target.value)}
                  disabled={saving}
                  placeholder="Value, e.g. Food-grade plastic"
                  className="w-full min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 disabled:opacity-50"
                />
                <button
                  type="button"
                  aria-label="Move specification earlier"
                  onClick={() => moveSpec(index, -1)}
                  disabled={index === 0 || saving}
                  className="rounded-md border border-slate-300 px-2 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  type="button"
                  aria-label="Move specification later"
                  onClick={() => moveSpec(index, 1)}
                  disabled={index === specs.length - 1 || saving}
                  className="rounded-md border border-slate-300 px-2 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-30"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => removeSpec(spec.id)}
                  disabled={saving}
                  className="rounded-md border border-red-200 px-2 py-2 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
              {rowErrors[spec.id] && (
                <p className="text-xs text-red-600">{rowErrors[spec.id]}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {error && <p className="mb-2 text-xs text-red-600">{error}</p>}
      {success && <p className="mb-2 text-xs text-green-600">{success}</p>}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={addSpec}
          disabled={saving}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          Add Specification
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save Specifications'}
        </button>
      </div>
    </div>
  )
}
