// JSDoc-only model definition — no runtime code. Mirrors the item shape
// EnquiryContext stores (see src/contexts/EnquiryContext.jsx).

/**
 * @typedef {object} EnquiryItem
 * @property {string|number} id
 * @property {string} name
 * @property {string} image
 * @property {string} [capacity]
 * @property {number} price
 * @property {number} qty
 * @property {string} [selectedColor]
 */

/**
 * The customer-details form collected in Milestone 8 before submission.
 * Mirrors `enquiries.customer_name`/`customer_phone`/`customer_email`/
 * `customer_message` (see DATABASE_DESIGN.md §7). Name and phone are
 * required by the form; email and message are optional.
 * @typedef {object} CustomerDetails
 * @property {string} customerName
 * @property {string} customerPhone
 * @property {string} [customerEmail]
 * @property {string} [customerMessage]
 */

export {}
