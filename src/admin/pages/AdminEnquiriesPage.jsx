import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  getAdminEnquiries,
  getAdminEnquiryById,
  deleteEnquiry,
} from '../api/adminEnquiryApi'
import { AdminEnquiryDetailModal } from '../components/AdminEnquiryDetailModal'
import { AdminBackLink } from '../components/AdminBackLink'

function isPermissionError(error) {
  return error?.code === '42501'
}

function itemCount(enquiry) {
  return enquiry.enquiry_items?.[0]?.count ?? 0
}

const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'closed', label: 'Closed' },
]

const STATUS_PILL_CLASSES = {
  new: 'bg-amber-50 text-amber-700',
  contacted: 'bg-slate-100 text-slate-600',
  closed: 'bg-green-50 text-green-700',
}

const STATUS_LABELS = {
  new: 'New',
  contacted: 'Contacted',
  closed: 'Closed',
}

function formatDateTime(value) {
  return new Date(value).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

// Real Enquiry list, reading live production Supabase data as the
// signed-in admin — mirrors AdminProductsPage.jsx's/AdminSocialVideosPage.jsx's
// structure and states exactly (loading/unavailable/error/empty/ready),
// with search + a status filter matching AdminProductsPage's existing
// filter-row pattern. The status filter is synced to the URL's `?filter=`
// param (defaulting to 'new' when arriving via the Dashboard's "New
// Enquiries" card link, matching ShopPage's own `?category=` URL-sync
// convention) so that existing navigation entry point stays meaningful now
// that a real page exists here.
export default function AdminEnquiriesPage() {
  const [state, setState] = useState({ status: 'loading', items: [] })
  const [searchParams, setSearchParams] = useSearchParams()
  const statusFilter = searchParams.get('filter') || 'all'
  const [search, setSearch] = useState('')
  const [detailModal, setDetailModal] = useState(null) // null | { loading: true } | { enquiry }
  const [banner, setBanner] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    let cancelled = false

    getAdminEnquiries()
      .then((items) => {
        if (!cancelled) setState({ status: 'ready', items })
      })
      .catch((error) => {
        console.error('[AdminEnquiries] load failed:', error.message)
        if (!cancelled) {
          setState({
            status: isPermissionError(error) ? 'unavailable' : 'error',
            items: [],
          })
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  const filteredEnquiries = useMemo(() => {
    const query = search.trim().toLowerCase()
    return state.items.filter((enquiry) => {
      if (statusFilter !== 'all' && enquiry.status !== statusFilter) return false
      if (query) {
        const haystack = [
          enquiry.customer_name,
          enquiry.customer_phone,
          enquiry.customer_email,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        if (!haystack.includes(query)) return false
      }
      return true
    })
  }, [state.items, search, statusFilter])

  const hasActiveFilters = search.trim() !== '' || statusFilter !== 'all'

  const handleClearFilters = () => {
    setSearch('')
    setSearchParams({})
  }

  const handleOpenDetail = async (enquiry) => {
    setDetailModal({ loading: true })
    try {
      const full = await getAdminEnquiryById(enquiry.id)
      setDetailModal({ enquiry: full })
    } catch (error) {
      console.error('[AdminEnquiries] detail load failed:', error.message)
      setDetailModal(null)
      setBanner({
        type: 'error',
        text: 'Could not load this enquiry’s details. Please try again.',
      })
    }
  }

  const handleStatusChange = (updated) => {
    setState((s) => ({
      ...s,
      items: s.items.map((e) =>
        e.id === updated.id ? { ...e, status: updated.status } : e
      ),
    }))
    setDetailModal((m) =>
      m?.enquiry ? { enquiry: { ...m.enquiry, status: updated.status } } : m
    )
  }

  // search/statusFilter are untouched here, so the current search/filter
  // state is naturally preserved across a delete — no explicit
  // preservation logic needed.
  const handleDelete = async (enquiry) => {
    if (!window.confirm('Delete this enquiry? This action cannot be undone.')) {
      return
    }
    setDeletingId(enquiry.id)
    setBanner(null)
    try {
      await deleteEnquiry(enquiry.id)
      setState((s) => ({
        ...s,
        items: s.items.filter((e) => e.id !== enquiry.id),
      }))
      // Close the detail modal too, if it happened to be open on the
      // enquiry just deleted — matches AdminPromotionsPage/AdminHeroPage's
      // own delete-from-list convention.
      setDetailModal((m) => (m?.enquiry?.id === enquiry.id ? null : m))
      setBanner({ type: 'success', text: 'Enquiry deleted.' })
    } catch (error) {
      setBanner({ type: 'error', text: error.message })
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <AdminBackLink to="/admin" label="Back to Dashboard" />

      <div>
        <h1 className="text-xl font-bold text-slate-900">Enquiries</h1>
        <p className="mt-1 text-sm text-slate-500">
          View customer enquiries and manage their status.
        </p>
      </div>

      {banner && (
        <div
          role="status"
          className={`rounded-md px-4 py-3 text-sm ${
            banner.type === 'success'
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-700'
          }`}
        >
          {banner.text}
        </div>
      )}

      {state.status === 'ready' && (
        <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row sm:flex-wrap sm:items-center">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, or email…"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 sm:w-64"
          />
          <select
            value={statusFilter}
            onChange={(e) =>
              setSearchParams(
                e.target.value === 'all' ? {} : { filter: e.target.value }
              )
            }
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 sm:w-44"
          >
            {STATUS_FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="rounded-md border border-slate-300 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {state.status === 'loading' && (
        <p className="text-sm text-slate-400">Loading enquiries…</p>
      )}

      {state.status === 'unavailable' && (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <p className="text-sm font-semibold text-slate-600">
            Enquiry management isn&apos;t available yet
          </p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-slate-400">
            The admin database permissions for enquiries haven&apos;t been
            applied yet.
          </p>
        </div>
      )}

      {state.status === 'error' && (
        <div className="rounded-lg border border-dashed border-red-300 bg-red-50 px-6 py-16 text-center">
          <p className="text-sm font-semibold text-red-700">
            Couldn&apos;t load enquiries
          </p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-red-500">
            Something went wrong loading enquiry data. Please try again.
          </p>
        </div>
      )}

      {state.status === 'ready' && state.items.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <p className="text-sm font-semibold text-slate-600">
            No enquiries yet.
          </p>
        </div>
      )}

      {state.status === 'ready' &&
        state.items.length > 0 &&
        filteredEnquiries.length === 0 && (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <p className="text-sm font-semibold text-slate-600">
              No enquiries match your filters
            </p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-slate-400">
              Try a different search term, or clear your filters.
            </p>
          </div>
        )}

      {state.status === 'ready' && filteredEnquiries.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Items</th>
                <th className="px-4 py-3 font-medium">Submitted</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEnquiries.map((enquiry) => (
                <tr
                  key={enquiry.id}
                  className="border-b border-slate-100 last:border-0"
                >
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {enquiry.customer_name || '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {enquiry.customer_phone || '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {enquiry.customer_email || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_PILL_CLASSES[enquiry.status]}`}
                    >
                      {STATUS_LABELS[enquiry.status] || enquiry.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {itemCount(enquiry)}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {formatDateTime(enquiry.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenDetail(enquiry)}
                        className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(enquiry)}
                        disabled={deletingId === enquiry.id}
                        className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        {deletingId === enquiry.id ? 'Deleting…' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {detailModal?.loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="rounded-lg bg-white px-6 py-4 text-sm text-slate-500 shadow-xl">
            Loading enquiry…
          </div>
        </div>
      )}

      {detailModal?.enquiry && (
        <AdminEnquiryDetailModal
          enquiry={detailModal.enquiry}
          onStatusChange={handleStatusChange}
          onClose={() => setDetailModal(null)}
        />
      )}
    </div>
  )
}
