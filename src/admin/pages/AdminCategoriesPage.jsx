import { useEffect, useState } from 'react'
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  saveCategoryOrder,
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
  // Working order (array of category ids) while the admin is dragging; the
  // saved order is state.items. Nothing is written until "Save Order".
  const [order, setOrder] = useState([])
  const [draggingId, setDraggingId] = useState(null)
  const [savingOrder, setSavingOrder] = useState(false)

  // Inline .then/.catch (matching src/hooks/useAsync.js's established
  // pattern) rather than an async function called from the effect body —
  // the latter trips eslint-plugin-react-hooks' set-state-in-effect rule
  // even when the setState calls only happen after an await.
  useEffect(() => {
    let cancelled = false

    getCategories()
      .then((items) => {
        if (!cancelled) {
          setState({ status: 'ready', items })
          setOrder(items.map((c) => c.id))
        }
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
    setState((s) => ({ ...s, items: [...s.items, created] }))
    setOrder((o) => [...o, created.id])
    setModal(null)
    setBanner({ type: 'success', text: `"${created.name}" was added.` })
  }

  const handleUpdate = async (values) => {
    const updated = await updateCategory(modal.category.id, values)
    setState((s) => ({
      ...s,
      items: s.items.map((c) => (c.id === updated.id ? updated : c)),
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
      setOrder((o) => o.filter((id) => id !== category.id))
      setBanner({ type: 'success', text: `"${category.name}" was deleted.` })
    } catch (error) {
      setBanner({ type: 'error', text: error.message })
    } finally {
      setDeletingId(null)
    }
  }

  const itemsById = new Map(state.items.map((c) => [c.id, c]))
  const orderedItems = order.map((id) => itemsById.get(id)).filter(Boolean)
  const orderDirty =
    orderedItems.length === state.items.length &&
    orderedItems.some((c, index) => c.id !== state.items[index]?.id)

  // Dragging over a row moves the dragged category into that row's slot.
  const moveCategory = (fromId, toId) => {
    if (fromId === toId) return
    setOrder((o) => {
      const fromIndex = o.indexOf(fromId)
      const toIndex = o.indexOf(toId)
      if (fromIndex === -1 || toIndex === -1) return o
      const next = o.filter((id) => id !== fromId)
      next.splice(toIndex, 0, fromId)
      return next
    })
  }

  const shiftCategory = (id, delta) => {
    setOrder((o) => {
      const index = o.indexOf(id)
      const target = index + delta
      if (index === -1 || target < 0 || target >= o.length) return o
      const next = [...o]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  const handleSaveOrder = async () => {
    setSavingOrder(true)
    setBanner(null)
    try {
      await saveCategoryOrder(order)
      // Re-read from the database so what is shown is what was persisted.
      const fresh = await getCategories()
      setState({ status: 'ready', items: fresh })
      setOrder(fresh.map((c) => c.id))
      setBanner({ type: 'success', text: 'Category order saved.' })
    } catch (error) {
      setBanner({ type: 'error', text: error.message || 'Could not save the order.' })
    } finally {
      setSavingOrder(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <AdminBackLink to="/admin" label="Back to Dashboard" />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Categories</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage the product categories shown on the storefront. Drag the
            handle to set the order they appear in, then click Save Order.
          </p>
        </div>
        {state.status === 'ready' && (
          <div className="flex gap-2">
            {orderDirty && (
              <>
                <button
                  type="button"
                  onClick={() => setOrder(state.items.map((c) => c.id))}
                  disabled={savingOrder}
                  className="inline-flex items-center justify-center rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={handleSaveOrder}
                  disabled={savingOrder}
                  className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {savingOrder ? 'Saving…' : 'Save Order'}
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => setModal({ mode: 'add' })}
              disabled={savingOrder}
              className="inline-flex items-center justify-center rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Add Category
            </button>
          </div>
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
        <div className="flex flex-col gap-2">
          {orderDirty && (
            <p className="text-xs text-amber-700">
              The order has changed but is not saved yet.
            </p>
          )}
          {orderedItems.map((category, index) => (
            <div
              key={category.id}
              draggable={!savingOrder}
              onDragStart={(e) => {
                setDraggingId(category.id)
                e.dataTransfer.effectAllowed = 'move'
              }}
              onDragOver={(e) => {
                if (!draggingId) return
                e.preventDefault()
                if (draggingId !== category.id) moveCategory(draggingId, category.id)
              }}
              onDragEnd={() => setDraggingId(null)}
              className={`flex items-center gap-3 rounded-lg border bg-white p-3 ${
                draggingId === category.id
                  ? 'border-slate-400 opacity-60'
                  : 'border-slate-200'
              }`}
            >
              <span
                className="cursor-grab select-none px-1 text-lg leading-none text-slate-400"
                aria-hidden="true"
                title="Drag to reorder"
              >
                ☰
              </span>
              <span className="w-6 text-right text-xs font-medium text-slate-400">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-semibold text-slate-900">
                  {category.name}
                </h3>
                <p className="truncate text-xs text-slate-400">
                  /{category.slug}
                  {category.tagline ? ` · ${category.tagline}` : ''}
                </p>
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => shiftCategory(category.id, -1)}
                  disabled={savingOrder || index === 0}
                  aria-label={`Move ${category.name} up`}
                  className="rounded-md border border-slate-300 px-2 py-1.5 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-30"
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => shiftCategory(category.id, 1)}
                  disabled={savingOrder || index === orderedItems.length - 1}
                  aria-label={`Move ${category.name} down`}
                  className="rounded-md border border-slate-300 px-2 py-1.5 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-30"
                >
                  ▼
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setModal({ mode: 'edit', category })}
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(category)}
                  disabled={deletingId === category.id}
                  className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
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
