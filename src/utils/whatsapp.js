// Single source of truth for the store's WhatsApp number. Reads
// VITE_WHATSAPP_NUMBER (see .env.example); falls back to the client's
// confirmed real WhatsApp Business number (+91 77367 30041) if that env
// var isn't set.
export const STORE_WHATSAPP_NUMBER =
  import.meta.env.VITE_WHATSAPP_NUMBER || '917736730041'

/**
 * @param {string} message - plain text, not yet encoded
 * @returns {string}
 */
export function buildWhatsAppUrl(message) {
  return `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}
