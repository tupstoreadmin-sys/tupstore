import { AdminBackLink } from './AdminBackLink'

// Shared placeholder for admin sections not built yet (Products,
// Enquiries). Deliberately not a fake CRUD UI — just a clear, honest state.
export function AdminComingSoon({ title, description }) {
  return (
    <div className="flex flex-col gap-6">
      <AdminBackLink to="/admin" label="Back to Dashboard" />
      <h1 className="text-xl font-bold text-slate-900">{title}</h1>
      <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
        <p className="text-sm font-semibold text-slate-500">Coming soon</p>
        <p className="mt-2 max-w-sm text-sm text-slate-400">{description}</p>
      </div>
    </div>
  )
}
