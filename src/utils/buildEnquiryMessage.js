// Pure formatting — no I/O, no encoding (the caller applies
// encodeURIComponent when building the WhatsApp URL, see utils/whatsapp.js).

/**
 * @param {object} params
 * @param {import('../models/Enquiry').EnquiryItem[]} params.items
 * @param {import('../models/Enquiry').CustomerDetails} params.customerDetails
 * @returns {string}
 */
export function buildEnquiryMessage({ items, customerDetails }) {
  const { customerName, customerPhone, customerEmail, customerMessage } =
    customerDetails

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
  lines.push('Customer Details:')
  lines.push(`Name: ${customerName}`)
  lines.push(`Phone: ${customerPhone}`)
  if (customerEmail) lines.push(`Email: ${customerEmail}`)
  if (customerMessage) lines.push(`Message: ${customerMessage}`)
  lines.push('')
  lines.push('Thank you.')

  return lines.join('\n')
}
