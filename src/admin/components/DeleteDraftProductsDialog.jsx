import { useEffect, useState } from 'react'
import {
  getDraftProductCount,
  getDraftProductsReferencedByEnquiries,
  deleteAllDraftProducts,
} from '../api/adminProductApi'

// Same modal shell as ImportConfirmDialog.jsx. Fresh counts are fetched every
// time it opens (never the possibly-stale list on the page behind it), and
// nothing is deleted until the admin clicks "Delete Draft Products".
//
// phase: checking | none | blocked | ready | deleting | error
export function DeleteDraftProductsDialog({ onClose, onDeleted, onFailed }) {
  const [phase, setPhase] = useState('checking')
  const [draftCount, setDraftCount] = useState(0)
  const [blocked, setBlocked] = useState({ total: 0, sample: [] })
  const [errorText, setErrorText] = useState('')

  useEffect(() => {
    let cancelled = false
    Promise.all([getDraftProductCount(), getDraftProductsReferencedByEnquiries()])
      .then(([count, referenced]) => {
        if (cancelled) return
        setDraftCount(count)
        setBlocked(referenced)
        if (count === 0) setPhase('none')
        else if (referenced.total > 0) setPhase('blocked')
        else setPhase('ready')
      })
      .catch((error) => {
        if (cancelled) return
        setErrorText(error.message || 'Could not check the draft products.')
        setPhase('error')
      })
    return () => {
      cancelled = true
    }
  }, [])

  const handleDelete = async () => {
    setPhase('deleting')
    try {
      const deleted = await deleteAllDraftProducts()
      onDeleted(deleted)
    } catch (error) {
      onFailed(error.message || 'Draft products could not be deleted.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        {phase === 'checking' && (
          <p className="text-sm text-slate-500">Checking draft products…</p>
        )}

        {phase === 'none' && (
          <>
            <h2 className="text-lg font-bold text-slate-900">Delete all draft products</h2>
            <p className="mt-3 text-sm text-slate-600">No draft products to delete.</p>
          </>
        )}

        {phase === 'error' && (
          <>
            <h2 className="text-lg font-bold text-slate-900">Delete all draft products</h2>
            <p className="mt-3 text-sm text-red-700">{errorText}</p>
          </>
        )}

        {phase === 'blocked' && (
          <>
            <h2 className="text-lg font-bold text-slate-900">Cannot delete all draft products</h2>
            <p className="mt-3 text-sm text-slate-700">
              {blocked.total} draft product{blocked.total === 1 ? ' is' : 's are'} referenced by
              existing customer enquiries and cannot be deleted. Nothing was deleted. Handle these
              products separately first (for example, delete or edit the related enquiries).
            </p>
            <ul className="mt-3 max-h-48 overflow-y-auto rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
              {blocked.sample.map((p) => (
                <li key={p.id}>
                  {p.name} {p.code ? `(${p.code})` : ''}
                </li>
              ))}
              {blocked.total > blocked.sample.length && (
                <li className="mt-1 text-slate-500">
                  …and {blocked.total - blocked.sample.length} more
                </li>
              )}
            </ul>
          </>
        )}

        {(phase === 'ready' || phase === 'deleting') && (
          <>
            <h2 className="text-lg font-bold text-slate-900">Delete all draft products?</h2>
            <p className="mt-3 text-sm text-slate-700">
              This will permanently delete <strong>{draftCount}</strong> draft product
              {draftCount === 1 ? '' : 's'}. Published products will not be affected.
            </p>
            <p className="mt-2 text-xs text-red-600">This cannot be undone.</p>
          </>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={phase === 'deleting'}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            {phase === 'ready' || phase === 'deleting' ? 'Cancel' : 'Close'}
          </button>
          {(phase === 'ready' || phase === 'deleting') && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={phase === 'deleting'}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            >
              {phase === 'deleting' ? 'Deleting…' : 'Delete Draft Products'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
