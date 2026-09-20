// Same visual shape as AdminDashboardPage.jsx's own SummaryCard (rounded
// border, uppercase label, large bold number) — not a Link here since
// these summarize the just-parsed workbook rather than navigate anywhere.

function Card({ label, value, tone }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${tone}`}>{value}</p>
    </div>
  )
}

/**
 * @param {object} props
 * @param {object} props.summary - the `summary` object from buildImportReview()
 */
export function ImportSummaryCards({ summary }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
      <Card label="Total Products" value={summary.totalProducts} tone="text-slate-900" />
      <Card label="Valid Products" value={summary.readyCount} tone="text-green-600" />
      <Card label="Products With Errors" value={summary.errorCount} tone="text-red-600" />
      <Card label="Products With Warnings" value={summary.warningCount} tone="text-amber-600" />
      <Card label="Existing Product Codes" value={summary.existingCodeCount} tone="text-slate-600" />
      <Card label="Existing Slugs" value={summary.existingSlugCount} tone="text-slate-600" />
    </div>
  )
}
