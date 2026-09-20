import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  getProductCount,
  getCategoryCount,
  getTotalEnquiryCount,
  getNewEnquiryCount,
  getRecentEnquiries,
} from '../api/adminDashboardApi'

// `comingSoon` cards still link to a real, already-built page (its own
// "Coming soon" placeholder — see AdminProductsPage/AdminEnquiriesPage), so
// the link is never broken; the badge just keeps the card from implying
// that module is fully built the way the Categories card correctly is.
const CARD_DEFS = [
  {
    key: 'products',
    label: 'Total Products',
    fetcher: getProductCount,
    to: '/admin/products',
    comingSoon: false,
  },
  {
    key: 'categories',
    label: 'Total Categories',
    fetcher: getCategoryCount,
    to: '/admin/categories',
    comingSoon: false,
  },
  {
    key: 'newEnquiries',
    label: 'New Enquiries',
    fetcher: getNewEnquiryCount,
    to: '/admin/enquiries?filter=new',
    comingSoon: false,
  },
  {
    key: 'totalEnquiries',
    label: 'Total Enquiries',
    fetcher: getTotalEnquiryCount,
    to: '/admin/enquiries',
    comingSoon: false,
  },
]

function SummaryCard({ label, state, to, comingSoon }) {
  return (
    <Link
      to={to}
      className="relative block rounded-lg border border-slate-200 bg-white p-5 transition-colors hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
    >
      {comingSoon && (
        <span className="absolute right-3 top-3 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          Coming soon
        </span>
      )}
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      {state.status === 'loading' && (
        <p className="mt-2 text-2xl font-bold text-slate-300">—</p>
      )}
      {state.status === 'ready' && (
        <p className="mt-2 text-2xl font-bold text-slate-900">
          {state.value}
        </p>
      )}
      {state.status === 'unavailable' && (
        <p className="mt-2 text-sm font-medium text-slate-400">
          Not available yet
        </p>
      )}
    </Link>
  )
}

// Every card and the Recent Enquiries table below fetch independently and
// fail independently — a permission error on one (expected today for all
// of them; see adminDashboardApi.js) never blocks the others from trying,
// and never crashes the page. This is a read-only page: nothing here
// inserts, updates, or deletes anything.
export default function AdminDashboardPage() {
  const [cardStates, setCardStates] = useState(
    Object.fromEntries(CARD_DEFS.map((c) => [c.key, { status: 'loading' }]))
  )
  const [recentEnquiries, setRecentEnquiries] = useState({
    status: 'loading',
    items: [],
  })

  useEffect(() => {
    let cancelled = false

    CARD_DEFS.forEach(({ key, fetcher }) => {
      fetcher()
        .then((value) => {
          if (!cancelled) {
            setCardStates((s) => ({ ...s, [key]: { status: 'ready', value } }))
          }
        })
        .catch((error) => {
          console.error(`[AdminDashboard] ${key} count failed:`, error.message)
          if (!cancelled) {
            setCardStates((s) => ({ ...s, [key]: { status: 'unavailable' } }))
          }
        })
    })

    getRecentEnquiries(5)
      .then((items) => {
        if (!cancelled) setRecentEnquiries({ status: 'ready', items })
      })
      .catch((error) => {
        console.error(
          '[AdminDashboard] recent enquiries failed:',
          error.message
        )
        if (!cancelled) setRecentEnquiries({ status: 'unavailable', items: [] })
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          A quick overview of the store.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {CARD_DEFS.map(({ key, label, to, comingSoon }) => (
          <SummaryCard
            key={key}
            label={label}
            state={cardStates[key]}
            to={to}
            comingSoon={comingSoon}
          />
        ))}
      </div>

      <div className="rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-800">
            Recent Enquiries
          </h2>
        </div>

        {recentEnquiries.status === 'loading' && (
          <p className="px-5 py-8 text-center text-sm text-slate-400">
            Loading…
          </p>
        )}

        {recentEnquiries.status === 'unavailable' && (
          <p className="px-5 py-8 text-center text-sm text-slate-500">
            Enquiry management will be available in the next admin module.
          </p>
        )}

        {recentEnquiries.status === 'ready' &&
          recentEnquiries.items.length === 0 && (
            <p className="px-5 py-8 text-center text-sm text-slate-500">
              No enquiries yet.
            </p>
          )}

        {recentEnquiries.status === 'ready' &&
          recentEnquiries.items.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-5 py-3 font-medium">Name</th>
                    <th className="px-5 py-3 font-medium">Phone</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentEnquiries.items.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="px-5 py-3">{item.customer_name}</td>
                      <td className="px-5 py-3">{item.customer_phone}</td>
                      <td className="px-5 py-3 capitalize">{item.status}</td>
                      <td className="px-5 py-3 text-slate-500">
                        {new Date(item.created_at).toLocaleDateString(
                          'en-IN'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>
    </div>
  )
}
