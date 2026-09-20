import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  getAdminProducts,
  getAdminProductCategories,
  deleteAdminProduct,
} from '../api/adminProductApi'
import { AdminBackLink } from '../components/AdminBackLink'

function isPermissionError(error) {
  return error?.code === '42501'
}

const AVAILABILITY_OPTIONS = [
  { value: 'in_stock', label: 'In Stock' },
  { value: 'out_of_stock', label: 'Out of Stock' },
  { value: 'preorder', label: 'Preorder' },
]

const AVAILABILITY_LABELS = Object.fromEntries(
  AVAILABILITY_OPTIONS.map((option) => [option.value, option.label])
)

function formatInr(amount) {
  return `₹${Number(amount).toLocaleString('en-IN')}`
}

// Real Product list, reading live production Supabase data as the
// signed-in admin — mirrors AdminCategoriesPage.jsx's structure and
// states exactly (loading/unavailable/error/empty/ready), extended with
// search + category + availability filters since products have more of
// them to manage than categories do. Add/Edit navigate to
// AdminProductFormPage (a placeholder for now, per this step's scope);
// Delete reuses the same confirm-then-call-then-banner pattern as
// Category delete, and relies on deleteAdminProduct() already turning the
// expected 23503 (enquiry_items references this product) into a friendly
// message — this page just displays whatever error.message it gets.
export default function AdminProductsPage() {
  const [state, setState] = useState({
    status: 'loading',
    items: [],
    categories: [],
  })
  const [deletingId, setDeletingId] = useState(null)
  const [banner, setBanner] = useState(null)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [availabilityFilter, setAvailabilityFilter] = useState('all')
  const [featuredFilter, setFeaturedFilter] = useState('all')

  useEffect(() => {
    let cancelled = false

    Promise.all([getAdminProducts(), getAdminProductCategories()])
      .then(([products, categories]) => {
        if (!cancelled) {
          setState({ status: 'ready', items: products, categories })
        }
      })
      .catch((error) => {
        console.error('[AdminProducts] load failed:', error.message)
        if (!cancelled) {
          setState({
            status: isPermissionError(error) ? 'unavailable' : 'error',
            items: [],
            categories: [],
          })
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase()
    return state.items.filter((product) => {
      if (query && !product.name.toLowerCase().includes(query)) return false
      if (categoryFilter !== 'all' && product.category_id !== categoryFilter) {
        return false
      }
      if (
        availabilityFilter !== 'all' &&
        product.availability !== availabilityFilter
      ) {
        return false
      }
      if (featuredFilter === 'featured' && !product.featured) return false
      if (featuredFilter === 'not_featured' && product.featured) return false
      return true
    })
  }, [state.items, search, categoryFilter, availabilityFilter, featuredFilter])

  const hasActiveFilters =
    search.trim() !== '' ||
    categoryFilter !== 'all' ||
    availabilityFilter !== 'all' ||
    featuredFilter !== 'all'

  const handleClearFilters = () => {
    setSearch('')
    setCategoryFilter('all')
    setAvailabilityFilter('all')
    setFeaturedFilter('all')
  }

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) {
      return
    }
    setDeletingId(product.id)
    setBanner(null)
    try {
      await deleteAdminProduct(product.id)
      setState((s) => ({
        ...s,
        items: s.items.filter((p) => p.id !== product.id),
      }))
      setBanner({ type: 'success', text: `"${product.name}" was deleted.` })
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
          <h1 className="text-xl font-bold text-slate-900">Products</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage the products shown on the storefront.
          </p>
        </div>
        {state.status === 'ready' && (
          <div className="flex gap-2">
            <Link
              to="/admin/products/import"
              className="inline-flex items-center justify-center rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Import Products
            </Link>
            <Link
              to="/admin/products/new"
              className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Add Product
            </Link>
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

      {state.status === 'ready' && (
        <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row sm:flex-wrap sm:items-center">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product name…"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 sm:w-56"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 sm:w-48"
          >
            <option value="all">All Categories</option>
            {state.categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <select
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 sm:w-44"
          >
            <option value="all">All Availability</option>
            {AVAILABILITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            value={featuredFilter}
            onChange={(e) => setFeaturedFilter(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 sm:w-44"
          >
            <option value="all">All Products</option>
            <option value="featured">Featured Only</option>
            <option value="not_featured">Not Featured</option>
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
        <p className="text-sm text-slate-400">Loading products…</p>
      )}

      {state.status === 'unavailable' && (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <p className="text-sm font-semibold text-slate-600">
            Product management isn&apos;t available yet
          </p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-slate-400">
            The admin database permissions for products haven&apos;t been
            applied yet.
          </p>
        </div>
      )}

      {state.status === 'error' && (
        <div className="rounded-lg border border-dashed border-red-300 bg-red-50 px-6 py-16 text-center">
          <p className="text-sm font-semibold text-red-700">
            Couldn&apos;t load products
          </p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-red-500">
            Something went wrong loading product data. Please try again.
          </p>
        </div>
      )}

      {state.status === 'ready' && state.items.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <p className="text-sm font-semibold text-slate-600">
            No products yet
          </p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-slate-400">
            Add your first product to get started.
          </p>
        </div>
      )}

      {state.status === 'ready' &&
        state.items.length > 0 &&
        filteredProducts.length === 0 && (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <p className="text-sm font-semibold text-slate-600">
              No products match your filters
            </p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-slate-400">
              Try a different search term, or clear your filters.
            </p>
          </div>
        )}

      {state.status === 'ready' && filteredProducts.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 font-medium">Image</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Product Code</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Availability</th>
                <th className="px-4 py-3 font-medium">Featured</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-slate-100 last:border-0"
                >
                  <td className="px-4 py-3">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-12 w-12 rounded-md border border-slate-200 object-cover"
                    />
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {product.name}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {product.product_code || '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {product.categories?.name || '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-900">
                    {formatInr(product.price)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        product.availability === 'in_stock'
                          ? 'bg-green-50 text-green-700'
                          : product.availability === 'preorder'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {AVAILABILITY_LABELS[product.availability] ||
                        product.availability}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {product.featured ? 'Featured' : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link
                        to={`/admin/products/${product.id}/edit`}
                        className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(product)}
                        disabled={deletingId === product.id}
                        className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        {deletingId === product.id ? 'Deleting…' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
