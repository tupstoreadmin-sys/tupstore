// Live progress while runProductImport() works through the batch
// sequentially. Purely presentational — driven entirely by the `progress`
// object productImportEngine.js's onProgress callback produces.

/**
 * @param {object} props
 * @param {object} props.progress
 */
export function ImportProgressPanel({ progress }) {
  if (!progress || progress.phase === 'preflight') {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-900">Importing products…</h2>
        <p className="mt-2 text-sm text-slate-500">Running final preflight checks…</p>
      </div>
    )
  }

  const { current, total, productCode, productName, stage, counts } = progress
  const percent = total > 0 ? Math.round((current / total) * 100) : 0

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6">
      <h2 className="text-sm font-semibold text-slate-900">Importing products…</h2>

      <p className="mt-3 text-lg font-bold text-slate-900">
        {current} / {total}
      </p>

      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full bg-slate-900 transition-all duration-fast"
          style={{ width: `${percent}%` }}
        />
      </div>

      <p className="mt-4 text-sm text-slate-700">
        <span className="font-medium">Current:</span> {productCode} — {productName}
      </p>
      <p className="mt-1 text-sm text-slate-500">
        <span className="font-medium">Stage:</span> {stage}
      </p>

      <dl className="mt-4 grid grid-cols-3 gap-3">
        <div>
          <dt className="text-xs text-slate-500">Imported</dt>
          <dd className="text-lg font-bold text-green-600">{counts.created}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Failed</dt>
          <dd className="text-lg font-bold text-red-600">{counts.failed}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Skipped</dt>
          <dd className="text-lg font-bold text-slate-600">{counts.skippedExisting}</dd>
        </div>
      </dl>
    </div>
  )
}
