// Same modal shell as CategoryFormModal.jsx (fixed inset-0 bg-black/40,
// centered white rounded card) — the last checkpoint before any Supabase
// write happens. No write occurs until the admin clicks "Confirm Import"
// here.

/**
 * @param {object} props
 * @param {number} props.readyCount
 * @param {number} props.warningCount
 * @param {number} props.errorCount
 * @param {number} props.existingCount
 * @param {boolean} props.warningsAcknowledged
 * @param {() => void} props.onCancel
 * @param {() => void} props.onConfirm
 */
export function ImportConfirmDialog({
  readyCount,
  warningCount,
  errorCount,
  existingCount,
  warningsAcknowledged,
  onCancel,
  onConfirm,
}) {
  const willImportCount = readyCount + (warningsAcknowledged ? warningCount : 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-lg font-bold text-slate-900">Import {willImportCount} products?</h2>

        <div className="mt-4 flex flex-col gap-2 text-sm text-slate-700">
          <p>{readyCount} products are ready to import.</p>
          {warningCount > 0 && (
            <p>
              {warningCount} products contain warnings
              {warningsAcknowledged ? ' and will be imported as acknowledged.' : ' and will NOT be imported unless acknowledged.'}
            </p>
          )}
          {errorCount > 0 && <p>{errorCount} products have errors and will be skipped.</p>}
          {existingCount > 0 && <p>{existingCount} existing products will be skipped.</p>}
        </div>

        <p className="mt-4 text-xs text-slate-400">
          This will write directly to Supabase. This cannot be undone automatically.
        </p>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={willImportCount === 0}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
          >
            Confirm Import
          </button>
        </div>
      </div>
    </div>
  )
}
