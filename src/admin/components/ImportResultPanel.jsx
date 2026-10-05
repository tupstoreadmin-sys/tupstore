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
        {item.rowNumber ? `Row ${item.rowNumber} · ` : ''}
        {item.productCode || '(no product code)'} — {item.productName || '(no name)'}
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
  const {
    created,
    failed,
    skippedExisting,
    skippedErrors,
    duplicateProductCodes = [],
    missingRequired = [],
    unmappedCategories = [],
    totals,
  } = result
  const otherSkipped = skippedErrors.filter((item) => item.kind === 'other')
  const skippedTotal = skippedExisting.length + skippedErrors.length
  const createdWithNotes = created.filter((item) => item.notes?.length > 0)

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-bold text-slate-900">Import Complete</h2>
        <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <div>
            <dt className="text-xs text-slate-500">Created (Draft)</dt>
            <dd className="text-2xl font-bold text-green-600">{created.length}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Skipped</dt>
            <dd className="text-2xl font-bold text-slate-600">{skippedTotal}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Duplicate Product Code</dt>
            <dd className="text-2xl font-bold text-slate-600">{duplicateProductCodes.length}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Missing Name / Product Code</dt>
            <dd className="text-2xl font-bold text-slate-600">{missingRequired.length}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Unmapped Categories</dt>
            <dd className="text-2xl font-bold text-amber-600">{unmappedCategories.length}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Failed</dt>
            <dd className="text-2xl font-bold text-red-600">{failed.length}</dd>
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
        {created.length > 0 && (
          <p className="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-600">
            Imported products were created as <strong>Drafts</strong> and are not
            visible to customers yet. Open each one in Products and set its Status to
            Published when it is ready.
          </p>
        )}
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

      {duplicateProductCodes.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h3 className="mb-3 text-sm font-semibold text-slate-900">
            Duplicate Product Code ({duplicateProductCodes.length})
          </h3>
          <p className="mb-3 text-xs text-slate-400">
            Not imported. Existing products are never modified or overwritten.
          </p>
          <div className="flex flex-col gap-2">
            {duplicateProductCodes.map((item, index) => (
              <SkippedCard key={index} item={item} reasonLabel={item.reason} />
            ))}
          </div>
        </div>
      )}

      {missingRequired.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h3 className="mb-3 text-sm font-semibold text-slate-900">
            Missing Name / Product Code ({missingRequired.length})
          </h3>
          <div className="flex flex-col gap-2">
            {missingRequired.map((item, index) => (
              <SkippedCard key={index} item={item} reasonLabel={item.reason} />
            ))}
          </div>
        </div>
      )}

      {otherSkipped.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h3 className="mb-3 text-sm font-semibold text-slate-900">
            Skipped — Other Errors ({otherSkipped.length})
          </h3>
          <div className="flex flex-col gap-2">
            {otherSkipped.map((item, index) => (
              <SkippedCard key={index} item={item} reasonLabel={item.reason} />
            ))}
          </div>
        </div>
      )}

      {unmappedCategories.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-6">
          <h3 className="mb-1 text-sm font-semibold text-amber-900">
            Unmapped Categories ({unmappedCategories.length})
          </h3>
          <p className="mb-3 text-xs text-amber-800">
            These products were imported as Drafts without the category below. No category was
            created &mdash; assign an existing category in Admin Products.
          </p>
          <ul className="flex flex-col gap-1 text-sm text-amber-900">
            {unmappedCategories.map((item, index) => (
              <li key={index}>
                Row {item.rowNumber} · {item.productCode} — {item.productName}:{' '}
                {item.unmapped.map((n) => `"${n}"`).join(', ')}
              </li>
            ))}
          </ul>
        </div>
      )}

      {createdWithNotes.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h3 className="mb-3 text-sm font-semibold text-slate-900">
            Created with notes ({createdWithNotes.length})
          </h3>
          <ul className="flex flex-col gap-1 text-sm text-slate-600">
            {createdWithNotes.map((item, index) => (
              <li key={index}>
                Row {item.rowNumber} · {item.productCode} — {item.productName}: {item.notes.join(' ')}
              </li>
            ))}
          </ul>
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
