import { supabase } from '../../lib/supabase'

// Admin-only category CRUD. Isolated from src/api/productApi.js (the
// customer read path, gated by VITE_DATA_SOURCE) and from
// src/services/products/* (the customer repository pattern) — this always
// operates as the signed-in admin's own `authenticated` Supabase session,
// relying entirely on RLS (via public.is_admin(), see
// db/migrations/0002_admin_categories.sql) rather than any elevated key.
// No service-role key is used or referenced anywhere in this file.
//
// Until that migration is reviewed and applied, every call below fails
// with a Postgres permission error (42501) — expected, and handled by the
// calling page (AdminCategoriesPage), not worked around here.
//
// Only columns that already exist on `categories` are used: id, slug, name,
// tagline, image, sort_order, created_at, updated_at. `sort_order` is the
// admin-controlled display order the storefront reads (ascending); no new
// column was added for ordering.

const CATEGORY_FIELDS =
  'id, slug, name, tagline, image, sort_order, created_at, updated_at'

// Display order: the admin-defined sort_order is the source of truth. `name`
// is only a stable tiebreaker for rows that share a value (legacy data had a
// couple at 0) so the list never shuffles between loads.
export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select(CATEGORY_FIELDS)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function createCategory({ slug, name, tagline, image }) {
  // A new category goes to the END of the admin-defined order (not to the
  // column default of 0, which would put it first).
  const { data: last, error: lastError } = await supabase
    .from('categories')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
  if (lastError) throw lastError
  const nextSortOrder = (last?.[0]?.sort_order ?? 0) + 1

  const { data, error } = await supabase
    .from('categories')
    .insert({
      slug,
      name,
      tagline: tagline || null,
      image: image || null,
      sort_order: nextSortOrder,
    })
    .select(CATEGORY_FIELDS)
    .single()
  if (error) {
    if (error.code === '23505') {
      throw new Error('A category with this slug already exists.')
    }
    throw error
  }
  return data
}

export async function updateCategory(id, { slug, name, tagline, image }) {
  const { data, error } = await supabase
    .from('categories')
    .update({
      slug,
      name,
      tagline: tagline || null,
      image: image || null,
    })
    .eq('id', id)
    .select(CATEGORY_FIELDS)
    .single()
  if (error) {
    if (error.code === '23505') {
      throw new Error('A category with this slug already exists.')
    }
    throw error
  }
  return data
}

// db/schema.sql defines products.category_id references categories(id) on
// delete restrict — Postgres itself refuses this delete at the constraint
// level if any product still points to the category (error 23503), before
// any row is touched. That check happens inside the database regardless of
// whether the admin session can read `products` (it currently can't — see
// adminDashboardApi.js — and this task doesn't change that), so no
// products-table read is needed here to stay safe. This never cascades:
// a blocked delete leaves both the category and every product untouched.
export async function deleteCategory(id) {
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) {
    if (error.code === '23503') {
      throw new Error(
        'This category cannot be deleted because one or more products are still assigned to it.'
      )
    }
    throw error
  }
}

// Persists a manual drag-and-drop order. `orderedIds` is the COMPLETE list of
// category ids in the desired order; each gets sort_order 1..N, so values are
// sequential and unique.
//
// All rows are written by ONE upsert request, which PostgREST runs as a single
// transaction — it either applies in full or not at all, so a partial failure
// can never leave the ordering half-updated. The rows sent are re-read just
// beforehand (current slug/name/tagline/image echoed back unchanged), and the
// save is refused if the category set differs from what the admin was
// looking at (a category added/deleted elsewhere), so a deleted category can
// never be re-created by this call.
export async function saveCategoryOrder(orderedIds) {
  const { data: current, error: readError } = await supabase
    .from('categories')
    .select('id, slug, name, tagline, image')
  if (readError) throw readError

  const currentIds = new Set(current.map((c) => c.id))
  const uniqueOrdered = new Set(orderedIds)
  if (
    uniqueOrdered.size !== orderedIds.length ||
    orderedIds.length !== currentIds.size ||
    !orderedIds.every((id) => currentIds.has(id))
  ) {
    throw new Error(
      'The category list has changed since this page was loaded. Reload the page and try again.'
    )
  }

  const byId = new Map(current.map((c) => [c.id, c]))
  const rows = orderedIds.map((id, index) => ({ ...byId.get(id), sort_order: index + 1 }))

  const { data, error } = await supabase
    .from('categories')
    .upsert(rows, { onConflict: 'id' })
    .select('id, sort_order')
  if (error) throw error
  if ((data?.length ?? 0) !== rows.length) {
    throw new Error('Not every category was updated. Reload the page and check the order.')
  }
}
