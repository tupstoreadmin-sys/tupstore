// Pure formatting — no I/O, no encoding (the caller applies
// encodeURIComponent when building the WhatsApp URL, see utils/whatsapp.js).

/**
 * @param {object} params
 * @param {import('../models/Enquiry').EnquiryItem[]} params.items
 * @param {import('../models/Enquiry').CustomerDetails} params.customerDetails
 * @param {{title: string, price?: number, originalPrice?: number, includedProductNames?: string[]}} [params.promotion] -
 *   present only when this enquiry is "about" a promotion/combo (see
 *   useAddPromotionToEnquiry.js). `includedProductNames` (the promotion's
 *   own tagged products) are listed by name only for reference — never
 *   priced/totaled individually, since the promotion's own `price` is its
 *   own real total, not a sum of its tagged products' prices. `items` here
 *   are always independently-added products (a promotion and products
 *   coexist in one enquiry — client decision), listed separately under
 *   "Additional Products" when both are present.
 * @returns {string}
 */
export function buildEnquiryMessage({ items, customerDetails, promotion }) {
  const { customerName, customerPhone, customerEmail, customerMessage } =
    customerDetails

  const lines = promotion
    ? buildPromotionLines(items, promotion)
    : buildProductLines(items)

  lines.push('Customer Details:')
  lines.push(`Name: ${customerName}`)
  lines.push(`Phone: ${customerPhone}`)
  if (customerEmail) lines.push(`Email: ${customerEmail}`)
  if (customerMessage) lines.push(`Message: ${customerMessage}`)
  lines.push('')
  lines.push('Thank you.')

  return lines.join('\n')
}

function buildProductLines(items) {
  const lines = [
    'Hello Tupperware Store,',
    '',
    'I would like to enquire about the following products:',
    '',
  ]

  let grandTotal = 0
  items.forEach((item, index) => {
    const lineTotal = item.price * item.qty
    grandTotal += lineTotal

    lines.push(`${index + 1}. ${item.name}`)
    lines.push(`   Quantity: ${item.qty}`)
    if (item.selectedColor) lines.push(`   Color: ${item.selectedColor}`)
    lines.push(`   Unit Price: ₹${item.price.toLocaleString('en-IN')}`)
    lines.push(`   Total: ₹${lineTotal.toLocaleString('en-IN')}`)
    lines.push('')
  })

  lines.push(`Grand Total: ₹${grandTotal.toLocaleString('en-IN')}`)
  lines.push('')
  return lines
}

function buildPromotionLines(items, promotion) {
  const lines = [
    'Hello Tupperware Store,',
    '',
    'I would like to enquire about the following offer:',
    '',
    `Promotion: ${promotion.title}`,
  ]

  if (promotion.price != null) {
    lines.push(`Offer Price: ₹${promotion.price.toLocaleString('en-IN')}`)
    if (promotion.originalPrice != null && promotion.originalPrice > promotion.price) {
      lines.push(`Original Price: ₹${promotion.originalPrice.toLocaleString('en-IN')}`)
    }
  }
  lines.push('')

  // Byte-identical to the pre-combined-enquiry behavior when there are no
  // independently-added products (`items` was previously auto-populated
  // with these same names for a promotion-only enquiry, in the same order).
  const includedNames = promotion.includedProductNames ?? []
  if (includedNames.length > 0) {
    lines.push(
      items.length > 0 ? 'Included Products:' : 'Included Products (for reference):'
    )
    includedNames.forEach((name) => lines.push(`- ${name}`))
    lines.push('')
  }

  // Independently-added products, only ever present alongside a promotion
  // now that one no longer replaces the other — kept deliberately simple
  // (name × qty, no per-item price/line-total) since the promotion's own
  // price is already the enquiry's real total, not these products' sum.
  if (items.length > 0) {
    lines.push('Additional Products:')
    items.forEach((item) => lines.push(`- ${item.name} × ${item.qty}`))
    lines.push('')
  }

  return lines
}
