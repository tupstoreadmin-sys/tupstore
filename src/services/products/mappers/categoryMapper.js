import { getImageUrl } from '../../../utils/imageUrl'

/** @typedef {import('../../../models/Category').Category} Category */

/**
 * @param {object} row - raw Supabase `categories` row
 * @returns {Category}
 */
export function mapCategory(row) {
  return {
    id: row.id,
    name: row.name,
    tagline: row.tagline ?? undefined,
    image: getImageUrl(row.image),
  }
}
