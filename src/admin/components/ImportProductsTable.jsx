import { memo } from 'react'
import { ImportRowDetails } from './ImportRowDetails'

// Matches AdminProductsPage.jsx's own table styling (overflow-x-auto
// rounded border, uppercase tracking-wide header, bordered rows). Each row
// is memoized since a workbook can hold up to ~300 products — only the
// rows whose own props actually changed (expansion toggle) re-render.

const STATUS_BADGE = {
  ready: { label: 'READY', className: 'bg-green-50 text-green-700' },
  warning: { label: 'WARNING', className: 'bg-amber-50 text-amber-700' },
  error: { label: 'ERROR', className: 'bg-red-50 text-red-700' },
  exists: { label: 'EXISTS', className: 'bg-slate-100 text-slate-600' },
}

function formatInr(amount) {
  if (amount === undefined || Number.isNaN(amount)) return '—'
  return `₹${Number(amount).toLocaleString('en-IN')}`
}

function ImageCell({ product }) {
  if (!product.main_image) {
    return <span className="text-xs font-medium text-red-600">Missing Image</span>
  }
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50 text-[9px] text-slate-400">
        IMG
      </div>
      <span className="max-w-[140px] truncate text-xs text-slate-500" title={product.main_image}>
        {product.main_image}
      </span>
    </div>
  )
}

const ImportTableRow = memo(function ImportTableRow({ row, isExpanded, onToggle }) {
  const { product, status } = row
  const badge = STATUS_BADGE[status]

  return (
    <>
      <tr
        className="cursor-pointer border-b border-slate-100 last:border-0 hover:bg-slate-50"
        onClick={() => onToggle(row.product.rowNumber)}
      >
        <td className="px-4 py-3">
          <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${badge.className}`}>
            {badge.label}
          </span>
        </td>
        <td className="px-4 py-3">
          <ImageCell product={product} />
        </td>
        <td className="px-4 py-3 font-medium text-slate-900">{product.product_code || '—'}</td>
        <td className="px-4 py-3 text-slate-700">{product.name || '—'}</td>
        <td className="px-4 py-3 text-slate-500">{product.category || '—'}</td>
        <td className="px-4 py-3 text-slate-900">{formatInr(product.price)}</td>
        <td className="px-4 py-3 text-slate-500">{product.availability || '—'}</td>
        <td className="px-4 py-3 text-slate-500">{product.badge || '—'}</td>
        <td className="px-4 py-3 text-slate-500">
          {product.rating === undefined ? '—' : product.rating}
        </td>
        <td className="px-4 py-3 text-slate-400">{isExpanded ? '▲' : '▼'}</td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={10} className="p-0">
            <ImportRowDetails row={row} />
          </td>
        </tr>
      )}
    </>
  )
})

/**
 * @param {object} props
 * @param {object[]} props.rows - filtered/searched rows from buildImportReview()
 * @param {Set<number>} props.expandedRowNumbers
 * @param {(rowNumber: number) => void} props.onToggleRow
 */
export function ImportProductsTable({ rows, expandedRowNumbers, onToggleRow }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
        <p className="text-sm font-semibold text-slate-600">No products match this filter</p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-slate-400">
          Try a different status filter or search term.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Product Image</th>
            <th className="px-4 py-3 font-medium">Product Code</th>
            <th className="px-4 py-3 font-medium">Product Name</th>
            <th className="px-4 py-3 font-medium">Category</th>
            <th className="px-4 py-3 font-medium">Price</th>
            <th className="px-4 py-3 font-medium">Availability</th>
            <th className="px-4 py-3 font-medium">Badge</th>
            <th className="px-4 py-3 font-medium">Rating</th>
            <th className="px-4 py-3 font-medium" />
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <ImportTableRow
              key={row.product.rowNumber}
              row={row}
              isExpanded={expandedRowNumbers.has(row.product.rowNumber)}
              onToggle={onToggleRow}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}
