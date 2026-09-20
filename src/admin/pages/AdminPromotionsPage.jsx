import { useEffect, useState } from 'react'
import {
  getAdminPromotions,
  getAdminPromotionById,
  createPromotion,
  updatePromotion,
  deletePromotion,
  replaceTaggedPromotionProducts,
} from '../api/adminPromotionApi'
import { PromotionFormModal } from '../components/PromotionFormModal'
import { AdminBackLink } from '../components/AdminBackLink'

function isPermissionError(error) {
  return error?.code === '42501'
}

function taggedCount(promotion) {
  return promotion.promotion_products?.[0]?.count ?? 0
}

// Real Promotions CRUD, reading/writing live production Supabase data as
// the signed-in admin — mirrors AdminSocialVideosPage.jsx's structure and
// states exactly (loading/unavailable/error/empty/ready), including its
// quick Active/Inactive toggle pill in the list (a low-friction way to
// "simply manage the flag in Admin", this step's own words, without
// forcing a full edit-form open just to flip one field).
//
// This is Step 2 (admin management only) — no customer-facing component
// (HomePage.jsx, PromotionStrip.jsx) is read from or connected to this
// table here; that is a later step.
export default function AdminPromotionsPage() {
  const [state, setState] = useState({ status: 'loading', items: [] })
  const [modal, setModal] = useState(null) // null | { mode: 'add' } | { mode: 'edit', promotion, taggedProducts, taggedLoading }
  const [deletingId, setDeletingId] = useState(null)
  const [togglingId, setTogglingId] = useState(null)
  const [banner, setBanner] = useState(null) // { type: 'success' | 'error', text }

  useEffect(() => {
    let cancelled = false

    getAdminPromotions()
      .then((items) => {
        if (!cancelled) setState({ status: 'ready', items })
      })
      .catch((error) => {
        console.error('[AdminPromotions] load failed:', error.message)
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

  const handleOpenAdd = () => {
    setModal({ mode: 'add' })
  }

  const handleOpenEdit = async (promotion) => {
    setModal({ mode: 'edit', promotion, taggedProducts: [], taggedLoading: true })
    try {
      const full = await getAdminPromotionById(promotion.id)
      const taggedProducts = full?.promotion_products ?? []
      setModal((m) =>
        m && m.mode === 'edit' && m.promotion.id === promotion.id
          ? { ...m, taggedProducts, taggedLoading: false }
          : m
      )
    } catch (error) {
      console.error('[AdminPromotions] tagged products load failed:', error.message)
      setModal((m) =>
        m && m.mode === 'edit' && m.promotion.id === promotion.id
          ? { ...m, taggedLoading: false }
          : m
      )
      setBanner({
        type: 'error',
        text: 'Could not load this promotion’s tagged products. You can still edit its other fields.',
      })
    }
  }

  const handleCreate = async ({ row, taggedProductIds }) => {
    const created = await createPromotion(row)
    await replaceTaggedPromotionProducts(created.id, taggedProductIds)
    setState((s) => ({
      ...s,
      items: [
        { ...created, promotion_products: [{ count: taggedProductIds.length }] },
        ...s.items,
      ],
    }))
    setModal(null)
    setBanner({ type: 'success', text: `"${created.title}" was added.` })
  }

  const handleUpdate = async ({ row, taggedProductIds }) => {
    const updated = await updatePromotion(modal.promotion.id, row)
    await replaceTaggedPromotionProducts(modal.promotion.id, taggedProductIds)
    setState((s) => ({
      ...s,
      items: s.items.map((p) =>
        p.id === updated.id
          ? { ...updated, promotion_products: [{ count: taggedProductIds.length }] }
          : p
      ),
    }))
    setModal(null)
    setBanner({ type: 'success', text: `"${updated.title}" was updated.` })
  }

  const handleToggleActive = async (promotion) => {
    setTogglingId(promotion.id)
    setBanner(null)
    try {
      const updated = await updatePromotion(promotion.id, {
        is_active: !promotion.is_active,
      })
      setState((s) => ({
        ...s,
        items: s.items.map((p) =>
          p.id === updated.id
            ? { ...updated, promotion_products: p.promotion_products }
            : p
        ),
      }))
    } catch (error) {
      setBanner({ type: 'error', text: error.message })
    } finally {
      setTogglingId(null)
    }
  }

  const handleDelete = async (promotion) => {
    if (
      !window.confirm(
        `Delete "${promotion.title}"? This will remove the promotion and its tagged-product links. This cannot be undone.`
      )
    ) {
      return
    }
    setDeletingId(promotion.id)
    setBanner(null)
    try {
      await deletePromotion(promotion.id)
      setState((s) => ({
        ...s,
        items: s.items.filter((p) => p.id !== promotion.id),
      }))
      setBanner({ type: 'success', text: `"${promotion.title}" was deleted.` })
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
          <h1 className="text-xl font-bold text-slate-900">Promotions</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage promotion cards and the products tagged to each one.
          </p>
        </div>
        {state.status === 'ready' && (
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            + Add Promotion
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
        <p className="text-sm text-slate-400">Loading promotions…</p>
      )}

      {state.status === 'unavailable' && (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <p className="text-sm font-semibold text-slate-600">
            Promotion management isn&apos;t available yet
          </p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-slate-400">
            The admin database permissions for promotions haven&apos;t been
            applied yet.
          </p>
        </div>
      )}

      {state.status === 'error' && (
        <div className="rounded-lg border border-dashed border-red-300 bg-red-50 px-6 py-16 text-center">
          <p className="text-sm font-semibold text-red-700">
            Couldn&apos;t load promotions
          </p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-red-500">
            Something went wrong loading promotion data. Please try again.
          </p>
        </div>
      )}

      {state.status === 'ready' && state.items.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <p className="text-sm font-semibold text-slate-600">
            No promotions yet.
          </p>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="mt-4 inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            + Add Promotion
          </button>
        </div>
      )}

      {state.status === 'ready' && state.items.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 font-medium">Image</th>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Badge</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Tagged</th>
                <th className="px-4 py-3 font-medium">Sort Order</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {state.items.map((promotion) => (
                <tr
                  key={promotion.id}
                  className="border-b border-slate-100 last:border-0"
                >
                  <td className="px-4 py-3">
                    <img
                      src={promotion.image}
                      alt={promotion.title}
                      className="h-12 w-12 rounded-md border border-slate-200 object-cover"
                    />
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {promotion.title}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {promotion.badge || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(promotion)}
                      disabled={togglingId === promotion.id}
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium disabled:opacity-50 ${
                        promotion.is_active
                          ? 'bg-green-50 text-green-700 hover:bg-green-100'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {togglingId === promotion.id
                        ? 'Updating…'
                        : promotion.is_active
                          ? 'Active'
                          : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {taggedCount(promotion)}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {promotion.sort_order}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(promotion)}
                        className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(promotion)}
                        disabled={deletingId === promotion.id}
                        className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        {deletingId === promotion.id ? 'Deleting…' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && modal.mode === 'edit' && modal.taggedLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="rounded-lg bg-white px-6 py-4 text-sm text-slate-500 shadow-xl">
            Loading promotion…
          </div>
        </div>
      )}

      {modal && modal.mode === 'add' && (
        <PromotionFormModal
          mode="add"
          onSubmit={handleCreate}
          onClose={() => setModal(null)}
        />
      )}

      {modal && modal.mode === 'edit' && !modal.taggedLoading && (
        <PromotionFormModal
          mode="edit"
          initialValues={{ ...modal.promotion, taggedProducts: modal.taggedProducts }}
          onSubmit={handleUpdate}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
