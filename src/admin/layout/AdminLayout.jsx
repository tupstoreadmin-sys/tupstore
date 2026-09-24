import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAdminAuth } from '../AdminAuthContext'

// Shared shell for every protected /admin/* page (see AdminApp.jsx — this
// is the `element` of a layout Route wrapping index/products/categories/
// enquiries, which render into the <Outlet/> below). Entirely self-styled
// with plain Tailwind utilities — no import from src/components/ui or any
// other customer design-system file.
const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/categories', label: 'Categories' },
  { to: '/admin/hero', label: 'Hero' },
  { to: '/admin/social-videos', label: 'Social Videos' },
  { to: '/admin/promotions', label: 'Promotions' },
  { to: '/admin/enquiries', label: 'Enquiries' },
]

function NavList({ onNavigate }) {
  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            `rounded-md px-3 py-2 text-sm font-medium ${
              isActive
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}

export default function AdminLayout() {
  const { user, signOut } = useAdminAuth()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileNavOpen((open) => !open)}
            aria-label="Toggle navigation"
            aria-expanded={mobileNavOpen}
            className="-ml-1 rounded-md p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              aria-hidden="true"
            >
              <path d="M2.5 5h15M2.5 10h15M2.5 15h15" strokeLinecap="round" />
            </svg>
          </button>
          <img src="/logo.webp" alt="The Tupperware Store" className="h-6 w-auto sm:h-7" />
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Admin
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden max-w-[160px] truncate text-xs text-slate-500 sm:inline">
            {user?.email}
          </span>
          <button
            type="button"
            onClick={signOut}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1400px] flex-col lg:flex-row">
        <aside
          className={`${
            mobileNavOpen ? 'block' : 'hidden'
          } w-full shrink-0 border-b border-slate-200 bg-white px-3 py-3 lg:block lg:w-56 lg:border-b-0 lg:border-r lg:px-4 lg:py-6`}
        >
          <NavList onNavigate={() => setMobileNavOpen(false)} />
        </aside>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
