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
// Only the fields that already exist on `categories` in db/schema.sql are
// used: id, slug, name, tagline, image, created_at, updated_at. There is
// no description, sort_order, or active/status column — none are invented
// here.

const CATEGORY_FIELDS = 'id, slug, name, tagline, image, created_at, updated_at'

export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select(CATEGORY_FIELDS)
    .order('name', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function createCategory({ slug, name, tagline, image }) {
  const { data, error } = await supabase
    .from('categories')
    .insert({
      slug,
      name,
      tagline: tagline || null,
      image: image || null,
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
