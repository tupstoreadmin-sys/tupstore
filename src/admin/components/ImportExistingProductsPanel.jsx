// Read-only comparison for every row whose product_code already exists in
// Supabase (status === 'exists', see productImportReview.js). Nothing here
// updates anything — this panel exists purely so the admin understands
// exactly which rows would need a real update-mode importer (not built
// yet, see Step 1/Step 2 scope) rather than a fresh insert.

/**
 * @param {object} props
 * @param {object[]} props.rows - rows from buildImportReview() with status === 'exists'
 */
export function ImportExistingProductsPanel({ rows }) {
  if (rows.length === 0) return null

  return (
    <div className="flex flex-col gap-3">
      {rows.map((row) => (
        <div
          key={row.product.rowNumber}
          className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
        >
          <p className="font-semibold text-slate-800">
            Product Code {row.product.product_code} already exists.
          </p>
          <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Excel Value
              </p>
              <p className="text-slate-700">{row.product.name || '—'}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Existing Product
              </p>
              <p className="text-slate-700">{row.existingMatch?.name || row.existingMatch?.slug}</p>
            </div>
          </div>
          <p className="mt-2 text-xs font-medium text-slate-500">
            Status: Existing product. No update performed.
          </p>
        </div>
      ))}
    </div>
  )
}
