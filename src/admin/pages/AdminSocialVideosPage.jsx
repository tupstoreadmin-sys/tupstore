import { useEffect, useMemo, useState } from 'react'
import {
  getSocialVideos,
  getTaggedProducts,
  createSocialVideo,
  updateSocialVideo,
  deleteSocialVideo,
  replaceTaggedProducts,
} from '../api/adminSocialVideoApi'
import { SocialVideoFormModal } from '../components/SocialVideoFormModal'
import { AdminBackLink } from '../components/AdminBackLink'

function isPermissionError(error) {
  return error?.code === '42501'
}

function taggedCount(video) {
  return video.social_video_products?.[0]?.count ?? 0
}

// Real Social Videos ("Watch Us In Action" Reels) CRUD, reading/writing
// live production Supabase data as the signed-in admin — mirrors
// AdminCategoriesPage.jsx's structure and states exactly (loading/
// unavailable/error/empty/ready), extended with a search box (matching
// AdminProductsPage.jsx's pattern) since the admin list intentionally
// shows every record, not just the customer-facing "latest 15 published"
// window (see db/migrations/0008_social_videos.sql's own comments — that
// windowing belongs only to a future customer-facing read query, never to
// this admin view).
//
// This is Step 2 (admin management only) — no customer-facing component
// (InstagramReels.jsx, InstagramReelModal.jsx, HomePage.jsx) is read from
// or connected to Supabase here; that is Step 3.
export default function AdminSocialVideosPage() {
  const [state, setState] = useState({ status: 'loading', items: [] })
  const [modal, setModal] = useState(null) // null | { mode: 'add' } | { mode: 'edit', video, taggedProducts, taggedLoading }
  const [deletingId, setDeletingId] = useState(null)
  const [togglingId, setTogglingId] = useState(null)
  const [banner, setBanner] = useState(null) // { type: 'success' | 'error', text }
  const [search, setSearch] = useState('')

  useEffect(() => {
    let cancelled = false

    getSocialVideos()
      .then((items) => {
        if (!cancelled) setState({ status: 'ready', items })
      })
      .catch((error) => {
        console.error('[AdminSocialVideos] load failed:', error.message)
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

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return state.items
    return state.items.filter(
      (video) =>
        video.title.toLowerCase().includes(query) ||
        (video.account ?? '').toLowerCase().includes(query)
    )
  }, [state.items, search])

  const handleOpenAdd = () => {
    setModal({ mode: 'add' })
  }

  const handleOpenEdit = async (video) => {
    setModal({ mode: 'edit', video, taggedProducts: [], taggedLoading: true })
    try {
      const taggedProducts = await getTaggedProducts(video.id)
      setModal((m) =>
        m && m.mode === 'edit' && m.video.id === video.id
          ? { ...m, taggedProducts, taggedLoading: false }
          : m
      )
    } catch (error) {
      console.error('[AdminSocialVideos] tagged products load failed:', error.message)
      setModal((m) =>
        m && m.mode === 'edit' && m.video.id === video.id
          ? { ...m, taggedLoading: false }
          : m
      )
      setBanner({
        type: 'error',
        text: 'Could not load this Reel’s tagged products. You can still edit its other fields.',
      })
    }
  }

  const handleCreate = async ({ row, taggedProductIds }) => {
    const created = await createSocialVideo(row)
    await replaceTaggedProducts(created.id, taggedProductIds)
    setState((s) => ({
      ...s,
      items: [
        { ...created, social_video_products: [{ count: taggedProductIds.length }] },
        ...s.items,
      ],
    }))
    setModal(null)
    setBanner({ type: 'success', text: `"${created.title}" was added.` })
  }

  const handleUpdate = async ({ row, taggedProductIds }) => {
    const updated = await updateSocialVideo(modal.video.id, row)
    await replaceTaggedProducts(modal.video.id, taggedProductIds)
    setState((s) => ({
      ...s,
      items: s.items.map((v) =>
        v.id === updated.id
          ? {
              ...updated,
              social_video_products: [{ count: taggedProductIds.length }],
            }
          : v
      ),
    }))
    setModal(null)
    setBanner({ type: 'success', text: `"${updated.title}" was updated.` })
  }

  const handleTogglePublished = async (video) => {
    setTogglingId(video.id)
    setBanner(null)
    try {
      const updated = await updateSocialVideo(video.id, {
        is_published: !video.is_published,
      })
      setState((s) => ({
        ...s,
        items: s.items.map((v) =>
          v.id === updated.id
            ? { ...updated, social_video_products: v.social_video_products }
            : v
        ),
      }))
    } catch (error) {
      setBanner({ type: 'error', text: error.message })
    } finally {
      setTogglingId(null)
    }
  }

  const handleDelete = async (video) => {
    if (!window.confirm(`Delete "${video.title}"? This cannot be undone.`)) {
      return
    }
    setDeletingId(video.id)
    setBanner(null)
    try {
      await deleteSocialVideo(video.id)
      setState((s) => ({
        ...s,
        items: s.items.filter((v) => v.id !== video.id),
      }))
      setBanner({ type: 'success', text: `"${video.title}" was deleted.` })
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
          <h1 className="text-xl font-bold text-slate-900">Social Videos</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage the Reels shown in Watch Us In Action on the storefront.
          </p>
        </div>
        {state.status === 'ready' && (
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Add Reel
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

      {state.status === 'ready' && state.items.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or account…"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 sm:w-72"
          />
        </div>
      )}

      {state.status === 'loading' && (
        <p className="text-sm text-slate-400">Loading Reels…</p>
      )}

      {state.status === 'unavailable' && (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <p className="text-sm font-semibold text-slate-600">
            Social Video management isn&apos;t available yet
          </p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-slate-400">
            The admin database permissions for social videos haven&apos;t
            been applied yet.
          </p>
        </div>
      )}

      {state.status === 'error' && (
        <div className="rounded-lg border border-dashed border-red-300 bg-red-50 px-6 py-16 text-center">
          <p className="text-sm font-semibold text-red-700">
            Couldn&apos;t load Reels
          </p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-red-500">
            Something went wrong loading Reel data. Please try again.
          </p>
        </div>
      )}

      {state.status === 'ready' && state.items.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <p className="text-sm font-semibold text-slate-600">
            No Reels yet
          </p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-slate-400">
            Add your first Reel to get started.
          </p>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="mt-4 inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Add your first Reel
          </button>
        </div>
      )}

      {state.status === 'ready' &&
        state.items.length > 0 &&
        filteredItems.length === 0 && (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <p className="text-sm font-semibold text-slate-600">
              No Reels match your search
            </p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-slate-400">
              Try a different search term.
            </p>
          </div>
        )}

      {state.status === 'ready' && filteredItems.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 font-medium">Thumbnail</th>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Account</th>
                <th className="px-4 py-3 font-medium">Views</th>
                <th className="px-4 py-3 font-medium">Duration</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium">Tagged</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((video) => (
                <tr
                  key={video.id}
                  className="border-b border-slate-100 last:border-0"
                >
                  <td className="px-4 py-3">
                    <img
                      src={video.image}
                      alt={video.title}
                      className="h-12 w-12 rounded-md border border-slate-200 object-cover"
                    />
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {video.title}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {video.account || '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {video.views || '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {video.duration || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleTogglePublished(video)}
                      disabled={togglingId === video.id}
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium disabled:opacity-50 ${
                        video.is_published
                          ? 'bg-green-50 text-green-700 hover:bg-green-100'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {togglingId === video.id
                        ? 'Updating…'
                        : video.is_published
                          ? 'Published'
                          : 'Draft'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(video.created_at).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {taggedCount(video)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(video)}
                        className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(video)}
                        disabled={deletingId === video.id}
                        className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        {deletingId === video.id ? 'Deleting…' : 'Delete'}
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
            Loading Reel…
          </div>
        </div>
      )}

      {modal && modal.mode === 'add' && (
        <SocialVideoFormModal
          mode="add"
          onSubmit={handleCreate}
          onClose={() => setModal(null)}
        />
      )}

      {modal && modal.mode === 'edit' && !modal.taggedLoading && (
        <SocialVideoFormModal
          mode="edit"
          initialValues={{ ...modal.video, taggedProducts: modal.taggedProducts }}
          onSubmit={handleUpdate}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
