// Pure formatting — no I/O, no encoding (the caller applies
// encodeURIComponent when building the WhatsApp URL, see utils/whatsapp.js).

/**
 * @param {object} params
 * @param {import('../models/Enquiry').EnquiryItem[]} params.items
 * @param {import('../models/Enquiry').CustomerDetails} params.customerDetails
 * @param {{title: string, price?: number, originalPrice?: number, includedProductNames?: string[], quantity?: number}} [params.promotion] -
 *   present only when this enquiry is "about" a promotion/combo (see
 *   useAddPromotionToEnquiry.js). `quantity` (default 1) is how many units
 *   of the offer were requested — the message shows `Offer Price ... each`
 *   plus a `Promotion Total` (price × quantity), never the promotion's own
 *   `originalPrice` and never `includedProductNames` (informational only,
 *   never shown to the customer in this message — client decision). `items`
 *   here are always independently-added products (a promotion and products
 *   coexist in one enquiry), listed separately under "Additional Products"
 *   when both are present, and folded into one "Total Enquiry Value" with
 *   the promotion total.
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
  const quantity = promotion.quantity ?? 1

  const lines = [
    'Hello Tupperware Store,',
    '',
    'I would like to enquire about the following:',
    '',
    'Promotion:',
    promotion.title,
    `Qty: ${quantity}`,
  ]

  // Never `originalPrice` and never `includedProductNames` here — both are
  // informational-only (drawer/Admin), deliberately excluded from the
  // customer-facing WhatsApp text (client decision).
  let promotionTotal = 0
  if (promotion.price != null) {
    promotionTotal = promotion.price * quantity
    lines.push(`Offer Price: ₹${promotion.price.toLocaleString('en-IN')} each`)
    lines.push(`Promotion Total: ₹${promotionTotal.toLocaleString('en-IN')}`)
  }
  lines.push('')

  // Independently-added products, only ever present alongside a promotion
  // now that one no longer replaces the other. Each gets its own unit
  // price line (no per-item line-total) — the combined grand total below
  // does that multiplication once.
  let productsTotal = 0
  if (items.length > 0) {
    lines.push('Additional Products:')
    items.forEach((item) => {
      productsTotal += item.price * item.qty
      lines.push(`${item.name} × ${item.qty}`)
      lines.push(`Price: ₹${item.price.toLocaleString('en-IN')}`)
      lines.push('')
    })
  }

  lines.push(
    `Total Enquiry Value: ₹${(promotionTotal + productsTotal).toLocaleString('en-IN')}`
  )
  lines.push('')

  return lines
}
