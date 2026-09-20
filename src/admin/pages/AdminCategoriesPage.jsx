import { useEffect, useState } from 'react'
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../api/adminCategoryApi'
import { CategoryFormModal } from '../components/CategoryFormModal'
import { AdminBackLink } from '../components/AdminBackLink'

function isPermissionError(error) {
  return error?.code === '42501'
}

// Real Category CRUD, reading/writing live production Supabase data as the
// signed-in admin. Every operation depends on
// db/migrations/0002_admin_categories.sql being applied — until then,
// `getCategories()` fails with a 42501 permission error and this page
// shows the "not available yet" state below, exactly like the Dashboard's
// cards do for the same reason.
export default function AdminCategoriesPage() {
  const [state, setState] = useState({ status: 'loading', items: [] })
  const [modal, setModal] = useState(null) // null | { mode: 'add' } | { mode: 'edit', category }
  const [deletingId, setDeletingId] = useState(null)
  const [banner, setBanner] = useState(null) // { type: 'success' | 'error', text }

  // Inline .then/.catch (matching src/hooks/useAsync.js's established
  // pattern) rather than an async function called from the effect body —
  // the latter trips eslint-plugin-react-hooks' set-state-in-effect rule
  // even when the setState calls only happen after an await.
  useEffect(() => {
    let cancelled = false

    getCategories()
      .then((items) => {
        if (!cancelled) setState({ status: 'ready', items })
      })
      .catch((error) => {
        console.error('[AdminCategories] load failed:', error.message)
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

  const handleCreate = async (values) => {
    const created = await createCategory(values)
    setState((s) => ({
      ...s,
      items: [...s.items, created].sort((a, b) =>
        a.name.localeCompare(b.name)
      ),
    }))
    setModal(null)
    setBanner({ type: 'success', text: `"${created.name}" was added.` })
  }

  const handleUpdate = async (values) => {
    const updated = await updateCategory(modal.category.id, values)
    setState((s) => ({
      ...s,
      items: s.items
        .map((c) => (c.id === updated.id ? updated : c))
        .sort((a, b) => a.name.localeCompare(b.name)),
    }))
    setModal(null)
    setBanner({ type: 'success', text: `"${updated.name}" was updated.` })
  }

  const handleDelete = async (category) => {
    if (
      !window.confirm(`Delete "${category.name}"? This cannot be undone.`)
    ) {
      return
    }
    setDeletingId(category.id)
    setBanner(null)
    try {
      await deleteCategory(category.id)
      setState((s) => ({
        ...s,
        items: s.items.filter((c) => c.id !== category.id),
      }))
      setBanner({ type: 'success', text: `"${category.name}" was deleted.` })
    } catch (error) {
      setBanner({ type: 'error', text: error.message })
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <AdminBackLink to="/admin" label="Back to Dashboard" />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Categories</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage the product categories shown on the storefront.
          </p>
        </div>
        {state.status === 'ready' && (
          <button
            type="button"
            onClick={() => setModal({ mode: 'add' })}
            className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Add Category
          </button>
        )}
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

      {state.status === 'loading' && (
        <p className="text-sm text-slate-400">Loading categories…</p>
      )}

      {state.status === 'unavailable' && (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <p className="text-sm font-semibold text-slate-600">
            Category management isn&apos;t available yet
          </p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-slate-400">
            The admin database permissions for categories haven&apos;t been
            applied yet. Once that migration is applied, this page will show
            the real product categories.
          </p>
        </div>
      )}

      {state.status === 'error' && (
        <div className="rounded-lg border border-dashed border-red-300 bg-red-50 px-6 py-16 text-center">
          <p className="text-sm font-semibold text-red-700">
            Couldn&apos;t load categories
          </p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-red-500">
            Something went wrong loading category data. Please try again.
          </p>
        </div>
      )}

      {state.status === 'ready' && state.items.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <p className="text-sm font-semibold text-slate-600">
            No categories yet
          </p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-slate-400">
            Add your first category to get started.
          </p>
        </div>
      )}

      {state.status === 'ready' && state.items.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {state.items.map((category) => (
            <div
              key={category.id}
              className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4"
            >
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold text-slate-900">
                  {category.name}
                </h3>
                <p className="truncate text-xs text-slate-400">
                  /{category.slug}
                </p>
              </div>
              {category.tagline && (
                <p className="text-sm text-slate-500">{category.tagline}</p>
              )}
              <div className="mt-auto flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModal({ mode: 'edit', category })}
                  className="flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(category)}
                  disabled={deletingId === category.id}
                  className="flex-1 rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  {deletingId === category.id ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <CategoryFormModal
          mode={modal.mode}
          initialValues={modal.mode === 'edit' ? modal.category : undefined}
          onSubmit={modal.mode === 'edit' ? handleUpdate : handleCreate}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
