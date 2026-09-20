import { Link } from 'react-router-dom'

/**
 * Reusable, deterministic "back" navigation for every /admin/* page except
 * the Dashboard itself. Always navigates to an explicit `to` destination —
 * never `window.history.back()` — so it behaves identically whether the
 * page was reached via in-app navigation, a bookmark, a direct URL, or a
 * refresh.
 *
 * Meant to sit above a page's own <h1>, inside that page's own content
 * (not inside AdminLayout's shared header, which already carries unrelated
 * branding/logout and has no per-page context to point "back" from).
 *
 * @param {object} props
 * @param {string} props.to
 * @param {string} props.label - e.g. "Back to Dashboard" (the arrow is added automatically)
 */
export function AdminBackLink({ to, label }) {
  return (
    <Link
      to={to}
      className="-ml-1 inline-flex w-fit items-center gap-1.5 rounded-sm px-1 py-2 text-sm font-medium text-slate-500 hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        <path
          d="M9.5 3 4.5 8l5 5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {label}
    </Link>
  )
}
