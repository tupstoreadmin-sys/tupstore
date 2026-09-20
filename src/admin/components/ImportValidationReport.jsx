// Step 1's flat finding card, still used for the Warning Panel — unchanged
// visual language. Errors now render through the sheet-grouped
// ImportErrorPanel below instead of this flat list, per Step 2's "improve
// grouping" requirement.
function FindingCard({ finding }) {
  const isError = finding.severity === 'error'
  return (
    <div
      className={`rounded-md border px-4 py-3 text-sm ${
        isError ? 'border-red-200 bg-red-50' : 'border-amber-200 bg-amber-50'
      }`}
    >
      <span
        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
          isError ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
        }`}
      >
        {isError ? 'Error' : 'Warning'}
      </span>
      <p className="mt-2 text-xs text-slate-500">
        {finding.sheet} · Row {finding.rowNumber}
        {finding.productCode && <> · Product Code: {finding.productCode}</>}
        {finding.productName && <> · {finding.productName}</>}
      </p>
      <p className={`mt-1 font-medium ${isError ? 'text-red-700' : 'text-amber-800'}`}>
        {finding.message}
      </p>
    </div>
  )
}

// Errors grouped by sheet, then by exact message — e.g. "Products Sheet →
// Missing price (rows 24, 58) / Invalid category (row 12)" — instead of a
// flat list, so an admin fixing a bulk mistake (like a typo'd category
// used across 40 rows) sees it as one thing to fix, not 40 separate cards.
// `errorGroups` comes from productImportReview.js's buildImportReview(),
// which only re-shapes findings productImportValidator.js already
// computed — no new rule is evaluated here.
export function ImportErrorPanel({ errorGroups }) {
  const totalErrors = errorGroups.reduce(
    (sum, group) => sum + group.messageGroups.reduce((s, mg) => s + mg.findings.length, 0),
    0
  )

  if (totalErrors === 0) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 px-6 py-8 text-center">
        <p className="text-sm font-semibold text-green-700">No errors found.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {errorGroups.map((group) => (
        <div key={group.sheet}>
          <h4 className="mb-2 text-sm font-semibold text-slate-900">{group.sheet} Sheet</h4>
          <div className="flex flex-col gap-3">
            {group.messageGroups.map((messageGroup) => (
              <div key={messageGroup.message}>
                <p className="mb-1.5 text-xs font-semibold text-red-700">
                  {messageGroup.message} ({messageGroup.findings.length})
                </p>
                <div className="flex flex-col gap-2">
                  {messageGroup.findings.map((finding, index) => (
                    <FindingCard key={index} finding={finding} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// Warnings stay a flat list — they don't need sheet-grouping (Step 2 only
// asked for improved grouping on the Error Panel) and never block import.
export function ImportWarningPanel({ warnings }) {
  if (warnings.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-6 py-8 text-center">
        <p className="text-sm font-semibold text-slate-600">No warnings found.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {warnings.map((finding, index) => (
        <FindingCard key={index} finding={finding} />
      ))}
    </div>
  )
}
