// Final summary after runProductImport() completes. Shows the headline
// counts, then every failed product with its exact failure stage/reason
// and cleanup outcome (never hidden — see productImportEngine.js's own
// cleanup tracking), then every skipped-existing/skipped-error product.

function FailedCard({ item }) {
  return (
    <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm">
      <p className="font-semibold text-red-700">
        {item.productCode} — {item.productName}
      </p>
      <p className="mt-1 text-slate-600">
        <span className="font-medium">Stage:</span> {item.stage}
      </p>
      <p className="text-slate-600">
        <span className="font-medium">Reason:</span> {item.reason}
      </p>
      {item.productRowCreated && (
        <p className="mt-1 text-xs text-slate-500">
          A product row was created before this failure and has been rolled back.
        </p>
      )}
      {item.cleanup && (
        <p
          className={`mt-1 text-xs font-medium ${
            item.cleanup.storageFailed.length > 0 ||
            item.cleanup.storageDeletionUnverifiable ||
            (item.productRowCreated && !item.cleanup.productRowDeleted)
              ? 'text-red-700'
              : 'text-slate-500'
          }`}
        >
          Cleanup:{' '}
          {item.cleanup.storageFailed.length > 0
            ? `Incomplete — ${item.cleanup.storageFailed.length} Storage file(s) could not be removed and may need manual cleanup.`
            : item.productRowCreated && !item.cleanup.productRowDeleted
              ? 'Incomplete — the product row could not be rolled back automatically.'
              : item.cleanup.storageDeletionUnverifiable
                ? 'Product row rolled back. Storage file removal was requested but could not be independently verified (see known limitation in the final report).'
                : 'Completed'}
        </p>
      )}
    </div>
  )
}

function SkippedCard({ item, reasonLabel }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
      <p className="font-semibold text-slate-700">
        {item.productCode} — {item.productName}
      </p>
      <p className="text-xs text-slate-500">{reasonLabel}</p>
    </div>
  )
}

/**
 * @param {object} props
 * @param {object} props.result - runProductImport() return value
 * @param {() => void} props.onReturnToReview
 */
export function ImportResultPanel({ result, onReturnToReview }) {
  const { created, failed, skippedExisting, skippedErrors, totals } = result

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-bold text-slate-900">Import Complete</h2>
        <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <dt className="text-xs text-slate-500">Created</dt>
            <dd className="text-2xl font-bold text-green-600">{created.length}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Failed</dt>
            <dd className="text-2xl font-bold text-red-600">{failed.length}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Skipped — Existing</dt>
            <dd className="text-2xl font-bold text-slate-600">{skippedExisting.length}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Skipped — Errors</dt>
            <dd className="text-2xl font-bold text-slate-600">{skippedErrors.length}</dd>
          </div>
        </dl>
        <dl className="mt-4 grid grid-cols-3 gap-4 border-t border-slate-100 pt-4">
          <div>
            <dt className="text-xs text-slate-500">Images uploaded</dt>
            <dd className="text-lg font-bold text-slate-900">{totals.imagesUploaded}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Features created</dt>
            <dd className="text-lg font-bold text-slate-900">{totals.featuresCreated}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Specifications created</dt>
            <dd className="text-lg font-bold text-slate-900">{totals.specificationsCreated}</dd>
          </div>
        </dl>
      </div>

      {failed.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h3 className="mb-3 text-sm font-semibold text-slate-900">Failed ({failed.length})</h3>
          <div className="flex flex-col gap-2">
            {failed.map((item, index) => (
              <FailedCard key={index} item={item} />
            ))}
          </div>
        </div>
      )}

      {skippedExisting.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h3 className="mb-3 text-sm font-semibold text-slate-900">
            Skipped — Existing ({skippedExisting.length})
          </h3>
          <div className="flex flex-col gap-2">
            {skippedExisting.map((item, index) => (
              <SkippedCard key={index} item={item} reasonLabel={item.reason} />
            ))}
          </div>
        </div>
      )}

      {skippedErrors.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h3 className="mb-3 text-sm font-semibold text-slate-900">
            Skipped — Errors ({skippedErrors.length})
          </h3>
          <div className="flex flex-col gap-2">
            {skippedErrors.map((item, index) => (
              <SkippedCard key={index} item={item} reasonLabel={item.reason} />
            ))}
          </div>
        </div>
      )}

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <button
          type="button"
          onClick={onReturnToReview}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Return to Review
        </button>
      </div>
    </div>
  )
}
