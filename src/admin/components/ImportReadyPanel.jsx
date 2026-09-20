import { useState } from 'react'

// A plain <details>-style expandable list of every READY product — the
// ones with zero errors, no existing-code/slug conflict, and no warnings.
// List-only (code + name); full detail is already available by expanding
// that same row in the main ImportProductsTable.

/**
 * @param {object} props
 * @param {object[]} props.rows - rows from buildImportReview() with status === 'ready'
 */
export function ImportReadyPanel({ rows }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-md border border-green-200 bg-green-50 px-4 py-3 text-left text-sm font-semibold text-green-700 hover:bg-green-100"
      >
        <span>Ready to Import ({rows.length})</span>
        <span>{expanded ? '▲' : '▼'}</span>
      </button>
      {expanded && (
        <div className="mt-2 flex flex-col gap-1 rounded-md border border-slate-200 bg-white p-3">
          {rows.length === 0 ? (
            <p className="text-sm text-slate-400">No products are ready yet.</p>
          ) : (
            rows.map((row) => (
              <p key={row.product.rowNumber} className="text-sm text-slate-700">
                <span className="font-medium">{row.product.product_code}</span> — {row.product.name}
              </p>
            ))
          )}
        </div>
      )}
    </div>
  )
}
