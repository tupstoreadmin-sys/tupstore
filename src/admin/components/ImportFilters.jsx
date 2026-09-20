// Status filter tabs + search box, matching AdminProductsPage.jsx's own
// filter bar styling (bordered white card, plain inputs). Purely
// presentational/controlled — filtering itself happens in the page via
// useMemo, not here.

const STATUS_TABS = [
  { value: 'all', label: 'All' },
  { value: 'ready', label: 'Ready' },
  { value: 'warning', label: 'Warning' },
  { value: 'error', label: 'Error' },
  { value: 'exists', label: 'Existing' },
]

const ACTIVE_TAB_CLASS = {
  all: 'bg-slate-900 text-white',
  ready: 'bg-green-600 text-white',
  warning: 'bg-amber-500 text-white',
  error: 'bg-red-600 text-white',
  exists: 'bg-slate-500 text-white',
}

/**
 * @param {object} props
 * @param {string} props.activeFilter
 * @param {(value: string) => void} props.onFilterChange
 * @param {Record<string, number>} props.counts - row count per status value, plus `all`
 * @param {string} props.search
 * @param {(value: string) => void} props.onSearchChange
 */
export function ImportFilters({ activeFilter, onFilterChange, counts, search, onSearchChange }) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => {
          const isActive = activeFilter === tab.value
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => onFilterChange(tab.value)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                isActive ? ACTIVE_TAB_CLASS[tab.value] : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label} ({counts[tab.value] ?? 0})
            </button>
          )
        })}
      </div>
      <input
        type="text"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search by product code, name, or category…"
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 sm:w-72"
      />
    </div>
  )
}
