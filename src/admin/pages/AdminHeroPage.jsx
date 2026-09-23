import { useEffect, useState } from 'react'
import {
  getAdminHeroSlides,
  getAdminHeroSlideById,
  createHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
  replaceHeroSlideFeatures,
} from '../api/adminHeroApi'
import { HeroSlideFormModal } from '../components/HeroSlideFormModal'
import { AdminBackLink } from '../components/AdminBackLink'

function isPermissionError(error) {
  return error?.code === '42501'
}

// Real Hero Slides CRUD, reading/writing live production Supabase data as
// the signed-in admin — mirrors AdminPromotionsPage.jsx's structure and
// states exactly (loading/unavailable/error/empty/ready), including its
// quick Active/Inactive toggle pill in the list.
//
// This is Step 1 (admin management only) — no customer-facing component
// (HomePage.jsx, HeroCarousel.jsx) is read from or connected to this table
// here; that is a later step.
export default function AdminHeroPage() {
  const [state, setState] = useState({ status: 'loading', items: [] })
  const [modal, setModal] = useState(null) // null | { mode: 'add' } | { mode: 'edit', slide, featuresLoading }
  const [deletingId, setDeletingId] = useState(null)
  const [togglingId, setTogglingId] = useState(null)
  const [banner, setBanner] = useState(null) // { type: 'success' | 'error', text }

  useEffect(() => {
    let cancelled = false

    getAdminHeroSlides()
      .then((items) => {
        if (!cancelled) setState({ status: 'ready', items })
      })
      .catch((error) => {
        console.error('[AdminHero] load failed:', error.message)
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

  const handleOpenEdit = async (slide) => {
    setModal({ mode: 'edit', slide, fullSlide: null, featuresLoading: true })
    try {
      const full = await getAdminHeroSlideById(slide.id)
      setModal((m) =>
        m && m.mode === 'edit' && m.slide.id === slide.id
          ? { ...m, fullSlide: full, featuresLoading: false }
          : m
      )
    } catch (error) {
      console.error('[AdminHero] slide detail load failed:', error.message)
      setModal((m) =>
        m && m.mode === 'edit' && m.slide.id === slide.id
          ? { ...m, featuresLoading: false }
          : m
      )
      setBanner({
        type: 'error',
        text: 'Could not load this slide’s feature bullets. You can still edit its other fields.',
      })
    }
  }

  const handleCreate = async ({ row, featureTexts }) => {
    const created = await createHeroSlide(row)
    await replaceHeroSlideFeatures(created.id, featureTexts)
    setState((s) => ({ ...s, items: [created, ...s.items] }))
    setModal(null)
    setBanner({ type: 'success', text: `"${created.title}" was added.` })
  }

  const handleUpdate = async ({ row, featureTexts }) => {
    const updated = await updateHeroSlide(modal.slide.id, row)
    await replaceHeroSlideFeatures(modal.slide.id, featureTexts)
    setState((s) => ({
      ...s,
      items: s.items.map((slide) => (slide.id === updated.id ? updated : slide)),
    }))
    setModal(null)
    setBanner({ type: 'success', text: `"${updated.title}" was updated.` })
  }

  const handleToggleActive = async (slide) => {
    setTogglingId(slide.id)
    setBanner(null)
    try {
      const updated = await updateHeroSlide(slide.id, { is_active: !slide.is_active })
      setState((s) => ({
        ...s,
        items: s.items.map((item) => (item.id === updated.id ? updated : item)),
      }))
    } catch (error) {
      setBanner({ type: 'error', text: error.message })
    } finally {
      setTogglingId(null)
    }
  }

  const handleDelete = async (slide) => {
    if (
      !window.confirm(
        `Delete "${slide.title}"? This will remove the slide and its feature bullets. This cannot be undone.`
      )
    ) {
      return
    }
    setDeletingId(slide.id)
    setBanner(null)
    try {
      await deleteHeroSlide(slide.id)
      setState((s) => ({ ...s, items: s.items.filter((item) => item.id !== slide.id) }))
      setBanner({ type: 'success', text: `"${slide.title}" was deleted.` })
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
          <h1 className="text-xl font-bold text-slate-900">Hero Slides</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage the Home page hero carousel — slides, images, CTA buttons, and
            feature bullets.
          </p>
        </div>
        {state.status === 'ready' && (
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            + Add Hero Slide
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
        <p className="text-sm text-slate-400">Loading hero slides…</p>
      )}

      {state.status === 'unavailable' && (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <p className="text-sm font-semibold text-slate-600">
            Hero slide management isn&apos;t available yet
          </p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-slate-400">
            The admin database permissions for hero slides haven&apos;t been applied
            yet.
          </p>
        </div>
      )}

      {state.status === 'error' && (
        <div className="rounded-lg border border-dashed border-red-300 bg-red-50 px-6 py-16 text-center">
          <p className="text-sm font-semibold text-red-700">
            Couldn&apos;t load hero slides
          </p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-red-500">
            Something went wrong loading hero slide data. Please try again.
          </p>
        </div>
      )}

      {state.status === 'ready' && state.items.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <p className="text-sm font-semibold text-slate-600">No hero slides yet.</p>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="mt-4 inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            + Add Hero Slide
          </button>
        </div>
      )}

      {state.status === 'ready' && state.items.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 font-medium">Image</th>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Sort Order</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {state.items.map((slide) => (
                <tr key={slide.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3">
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="h-12 w-20 rounded-md border border-slate-200 object-cover"
                    />
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">{slide.title}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(slide)}
                      disabled={togglingId === slide.id}
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium disabled:opacity-50 ${
                        slide.is_active
                          ? 'bg-green-50 text-green-700 hover:bg-green-100'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {togglingId === slide.id
                        ? 'Updating…'
                        : slide.is_active
                          ? 'Active'
                          : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{slide.sort_order}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(slide)}
                        className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(slide)}
                        disabled={deletingId === slide.id}
                        className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        {deletingId === slide.id ? 'Deleting…' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && modal.mode === 'edit' && modal.featuresLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="rounded-lg bg-white px-6 py-4 text-sm text-slate-500 shadow-xl">
            Loading hero slide…
          </div>
        </div>
      )}

      {modal && modal.mode === 'add' && (
        <HeroSlideFormModal mode="add" onSubmit={handleCreate} onClose={() => setModal(null)} />
      )}

      {modal && modal.mode === 'edit' && !modal.featuresLoading && (
        <HeroSlideFormModal
          mode="edit"
          initialValues={modal.fullSlide}
          onSubmit={handleUpdate}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
