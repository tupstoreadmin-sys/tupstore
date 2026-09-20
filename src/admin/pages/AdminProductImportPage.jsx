import { useCallback, useMemo, useRef, useState } from 'react'
import { getAdminProductCategories, getAdminProducts } from '../api/adminProductApi'
import { parseProductImportWorkbook, ProductImportParseError } from '../utils/productImportParser'
import { validateProductImport } from '../utils/productImportValidator'
import { buildImportReview } from '../utils/productImportReview'
import { runProductImport } from '../utils/productImportEngine'
import { AdminBackLink } from '../components/AdminBackLink'
import { ImportSummaryCards } from '../components/ImportSummaryCards'
import { ImportFilters } from '../components/ImportFilters'
import { ImportProductsTable } from '../components/ImportProductsTable'
import { ImportErrorPanel, ImportWarningPanel } from '../components/ImportValidationReport'
import { ImportReadyPanel } from '../components/ImportReadyPanel'
import { ImportExistingProductsPanel } from '../components/ImportExistingProductsPanel'
import { ImportSlugCollisionPanel } from '../components/ImportSlugCollisionPanel'
import { ImportConfirmDialog } from '../components/ImportConfirmDialog'
import { ImportProgressPanel } from '../components/ImportProgressPanel'
import { ImportResultPanel } from '../components/ImportResultPanel'

// STEP 1 (upload → parse → validate, productImportParser.js/
// productImportValidator.js) and STEP 2 (the review screen below the
// Workbook Summary) are untouched. STEP 3 adds the only thing this page
// was still missing: an actual, working "Import Products" action.
//
// Every write goes through productImportEngine.js, which itself only ever
// calls the SAME functions AdminProductFormPage.jsx/ProductImageManager.jsx
// already use — no new Supabase call, no service-role key, no RLS change.
// Only READY rows (plus WARNING rows once explicitly acknowledged below)
// are ever attempted; ERROR and EXISTS rows are never written. See
// productImportEngine.js for the full per-product sequence, preflight,
// and cleanup-on-failure behavior.
function isPermissionError(error) {
  return error?.code === '42501'
}

function friendlyErrorMessage(error) {
  if (error instanceof ProductImportParseError) return error.message
  return 'Something went wrong while reading this file. Please check it and try again.'
}

const STATUS_MATCHES_FILTER = (row, filter) => filter === 'all' || row.status === filter

function matchesSearch(row, query) {
  if (!query) return true
  const haystack = `${row.product.product_code} ${row.product.name} ${row.product.category}`.toLowerCase()
  return haystack.includes(query)
}

export default function AdminProductImportPage() {
  const fileInputRef = useRef(null)
  const imageInputRef = useRef(null)
  const [fileName, setFileName] = useState('')
  const [status, setStatus] = useState('idle') // idle | parsing | error | unavailable | ready
  const [errorMessage, setErrorMessage] = useState('')
  const [parsed, setParsed] = useState(null)
  const [review, setReview] = useState(null)
  const [activeFilter, setActiveFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [expandedRowNumbers, setExpandedRowNumbers] = useState(() => new Set())

  const [imageAssets, setImageAssets] = useState(() => new Map()) // filename -> File
  const [warningsAcknowledged, setWarningsAcknowledged] = useState(false)
  const [importPhase, setImportPhase] = useState('review') // review | confirming | importing | complete
  const [importProgress, setImportProgress] = useState(null)
  const [importResult, setImportResult] = useState(null)
  const [importAbortReason, setImportAbortReason] = useState('')

  const resetWorkbookState = () => {
    setParsed(null)
    setReview(null)
    setActiveFilter('all')
    setSearch('')
    setExpandedRowNumbers(new Set())
    setImageAssets(new Map())
    setWarningsAcknowledged(false)
    setImportPhase('review')
    setImportProgress(null)
    setImportResult(null)
    setImportAbortReason('')
  }

  const handleClear = () => {
    setFileName('')
    setStatus('idle')
    setErrorMessage('')
    resetWorkbookState()
  }

  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-selecting the same file again later
    if (!file) return

    setFileName(file.name)
    resetWorkbookState()
    setErrorMessage('')

    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      setStatus('error')
      setErrorMessage('Please upload an Excel (.xlsx) file.')
      return
    }

    setStatus('parsing')

    let workbook
    try {
      workbook = await parseProductImportWorkbook(file)
    } catch (error) {
      console.error('[AdminProductImport] parse failed:', error.message)
      setStatus('error')
      setErrorMessage(friendlyErrorMessage(error))
      return
    }

    let categories
    let existingProducts
    try {
      ;[categories, existingProducts] = await Promise.all([
        getAdminProductCategories(),
        getAdminProducts(),
      ])
    } catch (error) {
      console.error('[AdminProductImport] reference data load failed:', error.message)
      setStatus(isPermissionError(error) ? 'unavailable' : 'error')
      if (!isPermissionError(error)) {
        setErrorMessage('Could not load categories/products to validate against. Please try again.')
      }
      return
    }

    const validation = validateProductImport(workbook, { categories, existingProducts })
    setParsed(workbook)
    setReview(buildImportReview(workbook, validation, existingProducts))
    setStatus('ready')
  }

  const handleImageAssetsSelected = (e) => {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ''
    if (files.length === 0) return
    setImageAssets((prev) => {
      const next = new Map(prev)
      for (const file of files) next.set(file.name, file)
      return next
    })
  }

  const handleClearImages = () => setImageAssets(new Map())

  const toggleRow = useCallback((rowNumber) => {
    setExpandedRowNumbers((prev) => {
      const next = new Set(prev)
      if (next.has(rowNumber)) next.delete(rowNumber)
      else next.add(rowNumber)
      return next
    })
  }, [])

  const counts = useMemo(() => {
    if (!review) return { all: 0, ready: 0, warning: 0, error: 0, exists: 0 }
    return {
      all: review.rows.length,
      ready: review.summary.readyCount,
      warning: review.summary.warningCount,
      error: review.summary.errorCount,
      exists: review.summary.existingCodeCount,
    }
  }, [review])

  const filteredRows = useMemo(() => {
    if (!review) return []
    const query = search.trim().toLowerCase()
    return review.rows.filter(
      (row) => STATUS_MATCHES_FILTER(row, activeFilter) && matchesSearch(row, query)
    )
  }, [review, activeFilter, search])

  const readyRows = useMemo(() => (review ? review.rows.filter((r) => r.status === 'ready') : []), [review])
  const warningRows = useMemo(
    () => (review ? review.rows.filter((r) => r.status === 'warning') : []),
    [review]
  )
  const existingRows = useMemo(
    () => (review ? review.rows.filter((r) => r.status === 'exists') : []),
    [review]
  )

  const importableRowNumbers = useMemo(() => {
    const rows = warningsAcknowledged ? [...readyRows, ...warningRows] : readyRows
    return new Set(rows.map((r) => r.product.rowNumber))
  }, [readyRows, warningRows, warningsAcknowledged])

  const canImport =
    status === 'ready' &&
    importableRowNumbers.size > 0 &&
    imageAssets.size > 0 &&
    importPhase === 'review'

  const handleStartImport = () => setImportPhase('confirming')
  const handleCancelConfirm = () => setImportPhase('review')

  const handleConfirmImport = async () => {
    setImportPhase('importing')
    setImportProgress({ phase: 'preflight' })
    setImportAbortReason('')

    const result = await runProductImport(
      parsed,
      importableRowNumbers,
      imageAssets,
      (progress) => setImportProgress(progress),
      review
    )

    if (result.aborted) {
      setImportAbortReason(result.reason)
      setImportPhase('review')
      return
    }

    setImportResult(result)
    setImportPhase('complete')
  }

  const handleReturnToReview = () => {
    setImportPhase('review')
    setImportResult(null)
    setImportProgress(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <AdminBackLink to="/admin/products" label="Back to Products" />

      <div>
        <h1 className="text-xl font-bold text-slate-900">Import Product Catalogue</h1>
        <p className="mt-1 text-sm text-slate-500">
          Upload the approved Excel catalogue to validate products before importing them.
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <label className="mb-1 block text-xs font-medium text-slate-600">
          Catalogue Workbook
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx"
          onChange={handleFileSelected}
          disabled={status === 'parsing' || importPhase === 'importing'}
          className="hidden"
        />
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={status === 'parsing' || importPhase === 'importing'}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            {fileName ? 'Choose a Different File' : 'Choose File'}
          </button>
          {fileName && (
            <button
              type="button"
              onClick={handleClear}
              disabled={status === 'parsing' || importPhase === 'importing'}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Clear
            </button>
          )}
          {fileName && <span className="text-xs text-slate-500">{fileName}</span>}
        </div>
        <p className="mt-1 text-xs text-slate-400">
          .xlsx only, using the approved Products / Images / Features / Specifications template.
        </p>

        {status === 'parsing' && (
          <p className="mt-3 text-sm text-slate-400">Reading and validating…</p>
        )}

        {status === 'error' && (
          <div role="status" className="mt-3 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        {status === 'unavailable' && (
          <div role="status" className="mt-3 rounded-md bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Product/category data isn&apos;t available to validate against right now.
          </div>
        )}
      </div>

      {status === 'ready' && parsed && review && (
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Product Image Files
          </label>
          <p className="mb-2 text-xs text-slate-400">
            Select every image file referenced by the workbook&apos;s main_image/image_file columns
            (multiple files at once). Matched by exact filename — no folder or naming convention is
            assumed.
          </p>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleImageAssetsSelected}
            disabled={importPhase === 'importing'}
            className="hidden"
          />
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              disabled={importPhase === 'importing'}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Select Image Files
            </button>
            {imageAssets.size > 0 && (
              <button
                type="button"
                onClick={handleClearImages}
                disabled={importPhase === 'importing'}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Clear Images
              </button>
            )}
            <span className="text-xs text-slate-500">
              {imageAssets.size} image file(s) selected
            </span>
          </div>
        </div>
      )}

      {status === 'ready' && parsed && review && importPhase !== 'complete' && (
        <>
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="text-sm font-semibold text-slate-900">Workbook Summary</h2>
            <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ['Products', parsed.products.length],
                ['Images', parsed.images.length],
                ['Features', parsed.features.length],
                ['Specifications', parsed.specifications.length],
              ].map(([label, count]) => (
                <div key={label}>
                  <dt className="text-xs text-slate-500">{label}</dt>
                  <dd className="text-lg font-bold text-slate-900">{count}</dd>
                </div>
              ))}
            </dl>
            {parsed.ignoredSheets.length > 0 && (
              <p className="mt-3 text-xs text-slate-400">
                Ignored non-data sheet(s): {parsed.ignoredSheets.join(', ')}
              </p>
            )}
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold text-slate-900">Import Review</h2>
            <ImportSummaryCards summary={review.summary} />
          </div>

          <ImportFilters
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            counts={counts}
            search={search}
            onSearchChange={setSearch}
          />

          <ImportProductsTable
            rows={filteredRows}
            expandedRowNumbers={expandedRowNumbers}
            onToggleRow={toggleRow}
          />

          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">
              Errors ({review.summary.errorCount})
            </h2>
            <ImportErrorPanel errorGroups={review.errorGroups} />
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">
              Warnings ({review.summary.warningCount})
            </h2>
            <p className="mb-3 text-xs text-slate-400">
              Warnings do not block import — but a product with a warning is only included once you
              acknowledge it below.
            </p>
            <ImportWarningPanel warnings={review.warningsWithNames} />
            {review.summary.warningCount > 0 && (
              <label className="mt-4 inline-flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={warningsAcknowledged}
                  onChange={(e) => setWarningsAcknowledged(e.target.checked)}
                  disabled={importPhase === 'importing'}
                  className="h-4 w-4 rounded border-slate-300"
                />
                I have reviewed the {review.summary.warningCount} warning(s) and want to include
                those products in this import.
              </label>
            )}
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <ImportReadyPanel rows={readyRows} />
          </div>

          {existingRows.length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-white p-6">
              <h2 className="mb-3 text-sm font-semibold text-slate-900">
                Existing Products ({existingRows.length})
              </h2>
              <ImportExistingProductsPanel rows={existingRows} />
            </div>
          )}

          {review.slugCollisions.length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-white p-6">
              <h2 className="mb-3 text-sm font-semibold text-slate-900">
                Slug Collisions ({review.slugCollisions.length})
              </h2>
              <ImportSlugCollisionPanel slugCollisions={review.slugCollisions} />
            </div>
          )}

          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <p
              className={`mb-4 text-sm font-medium ${
                review.summary.errorCount > 0 && importableRowNumbers.size === 0
                  ? 'text-red-700'
                  : 'text-green-700'
              }`}
            >
              {importableRowNumbers.size > 0
                ? `${importableRowNumbers.size} product(s) will be imported.`
                : 'Fix errors in the workbook, or acknowledge warnings, before importing.'}
            </p>

            {importAbortReason && (
              <div role="status" className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
                Import could not start: {importAbortReason}
              </div>
            )}

            <button
              type="button"
              onClick={handleStartImport}
              disabled={!canImport}
              title={!canImport ? 'Select a workbook, image files, and at least one importable product' : undefined}
              className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
            >
              Import Products
            </button>
            {imageAssets.size === 0 && importableRowNumbers.size > 0 && (
              <p className="mt-2 text-xs text-slate-400">
                Select the product image files above before importing.
              </p>
            )}
          </div>
        </>
      )}

      {importPhase === 'importing' && <ImportProgressPanel progress={importProgress} />}

      {importPhase === 'complete' && importResult && (
        <ImportResultPanel result={importResult} onReturnToReview={handleReturnToReview} />
      )}

      {importPhase === 'confirming' && review && (
        <ImportConfirmDialog
          readyCount={review.summary.readyCount}
          warningCount={review.summary.warningCount}
          errorCount={review.summary.errorCount}
          existingCount={review.summary.existingCodeCount}
          warningsAcknowledged={warningsAcknowledged}
          onCancel={handleCancelConfirm}
          onConfirm={handleConfirmImport}
        />
      )}
    </div>
  )
}
