// Supabase Edge Function — sends an internal notification email whenever a
// new enquiry (product or contact) has been successfully persisted.
//
// Invoked by the frontend (src/api/enquiryApi.js) with only `{ enquiryId }`
// AFTER both `enquiries` and (if applicable) `enquiry_items` have already
// been inserted — never before, and never with any other customer/product
// data supplied by the browser. Every field in the email is re-fetched here
// from the database using the service-role key, which is available
// automatically in this runtime and is never exposed to, or duplicated in,
// the frontend. This function never runs client-side and is not part of
// the Vite/React bundle.
//
// Failure here must never surface as an enquiry failure — see the calling
// code's try/catch. This function itself never throws past its own
// boundary; every path returns a Response.

import { createClient } from 'npm:@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const NOTIFICATION_EMAIL = Deno.env.get('NOTIFICATION_EMAIL')

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}

function escapeHtml(value) {
  if (value === null || value === undefined) return ''
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function formatDateTime(isoString) {
  return new Date(isoString).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  })
}

function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '—'
  return `₹${Number(amount).toLocaleString('en-IN')}`
}

/**
 * @param {object} enquiry - a row from `enquiries`
 * @param {object[]} items - related `enquiry_items` rows, each with a
 *   nested `products` object (name) via the FK join; empty for a Contact
 *   enquiry, per requirement 18.
 */
function buildEmail(enquiry, items) {
  const isProductEnquiry = items.length > 0
  const refId = enquiry.id
  const dateStr = formatDateTime(enquiry.created_at)
  const grandTotal = items.reduce(
    (sum, item) => sum + item.price_at_enquiry * item.quantity,
    0
  )

  const subject = isProductEnquiry
    ? `New Product Enquiry — ${enquiry.customer_name}`
    : `New Contact Enquiry — ${enquiry.customer_name}`

  const detailRows = [
    ['Reference ID', refId],
    ['Name', enquiry.customer_name],
    ['Phone', enquiry.customer_phone],
    ['Email', enquiry.customer_email || '—'],
    ['Status', enquiry.status],
    ['Date', dateStr],
  ]

  const detailRowsHtml = detailRows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 12px 6px 0;color:#6e6e73;">${escapeHtml(label)}</td><td style="padding:6px 0;font-weight:600;">${escapeHtml(value)}</td></tr>`
    )
    .join('')

  const itemRowsHtml = items
    .map((item) => {
      const name = escapeHtml(item.products?.name ?? 'Unknown product')
      const color = item.selected_color ? escapeHtml(item.selected_color) : '—'
      const lineTotal = item.price_at_enquiry * item.quantity
      return `<tr>
        <td style="padding:8px;border:1px solid #e5e5e5;">${name}</td>
        <td style="padding:8px;border:1px solid #e5e5e5;text-align:center;">${item.quantity}</td>
        <td style="padding:8px;border:1px solid #e5e5e5;text-align:center;">${color}</td>
        <td style="padding:8px;border:1px solid #e5e5e5;text-align:right;">${formatCurrency(item.price_at_enquiry)}</td>
        <td style="padding:8px;border:1px solid #e5e5e5;text-align:right;">${formatCurrency(lineTotal)}</td>
      </tr>`
    })
    .join('')

  const productsHtml = isProductEnquiry
    ? `
      <h3 style="margin:24px 0 8px;font-size:15px;color:#111;">Products</h3>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <thead>
          <tr style="background:#f5f5f7;">
            <th style="padding:8px;border:1px solid #e5e5e5;text-align:left;">Product</th>
            <th style="padding:8px;border:1px solid #e5e5e5;">Qty</th>
            <th style="padding:8px;border:1px solid #e5e5e5;">Color</th>
            <th style="padding:8px;border:1px solid #e5e5e5;text-align:right;">Unit Price</th>
            <th style="padding:8px;border:1px solid #e5e5e5;text-align:right;">Line Total</th>
          </tr>
        </thead>
        <tbody>${itemRowsHtml}</tbody>
      </table>
      <p style="text-align:right;font-weight:700;margin:12px 0 0;">Grand Total: ${formatCurrency(grandTotal)}</p>
    `
    : ''

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;color:#111;">
      <h2 style="margin:0 0 16px;font-size:18px;">${isProductEnquiry ? 'New Product Enquiry' : 'New Contact Enquiry'}</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:8px;">
        ${detailRowsHtml}
      </table>
      ${productsHtml}
      <h3 style="margin:24px 0 8px;font-size:15px;color:#111;">Message</h3>
      <p style="white-space:pre-wrap;font-size:14px;line-height:1.5;background:#f5f5f7;padding:12px;border-radius:8px;">${escapeHtml(enquiry.customer_message || '—')}</p>
    </div>
  `

  const textLines = [
    isProductEnquiry ? 'New Product Enquiry' : 'New Contact Enquiry',
    '',
    ...detailRows.map(([label, value]) => `${label}: ${value}`),
    '',
  ]
  if (isProductEnquiry) {
    textLines.push('Products:')
    for (const item of items) {
      const name = item.products?.name ?? 'Unknown product'
      const color = item.selected_color ? ` (${item.selected_color})` : ''
      const lineTotal = item.price_at_enquiry * item.quantity
      textLines.push(
        `- ${name}${color} x${item.quantity} — ${formatCurrency(item.price_at_enquiry)} each, total ${formatCurrency(lineTotal)}`
      )
    }
    textLines.push('', `Grand Total: ${formatCurrency(grandTotal)}`, '')
  }
  textLines.push('Message:', enquiry.customer_message || '—')

  return { subject, html, text: textLines.join('\n') }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS })
  }
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405)
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('notify-enquiry: missing Supabase runtime configuration')
    return jsonResponse({ error: 'Server misconfigured' }, 500)
  }
  if (!RESEND_API_KEY || !NOTIFICATION_EMAIL) {
    console.error(
      'notify-enquiry: missing RESEND_API_KEY or NOTIFICATION_EMAIL'
    )
    return jsonResponse({ error: 'Server misconfigured' }, 500)
  }

  let enquiryId
  try {
    const body = await req.json()
    enquiryId = body?.enquiryId
  } catch {
    return jsonResponse({ error: 'Invalid request body' }, 400)
  }

  if (!enquiryId) {
    return jsonResponse({ error: 'enquiryId is required' }, 400)
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  // Retrieve the enquiry by id only — every field used in the email comes
  // from this trusted, service-role read, never from the request body
  // (requirement 16).
  const { data: enquiry, error: enquiryError } = await supabase
    .from('enquiries')
    .select('*')
    .eq('id', enquiryId)
    .maybeSingle()

  if (enquiryError) {
    console.error('notify-enquiry: enquiry lookup failed', enquiryError.code)
    return jsonResponse({ error: 'Lookup failed' }, 500)
  }
  if (!enquiry) {
    return jsonResponse({ error: 'Enquiry not found' }, 404)
  }

  const { data: items, error: itemsError } = await supabase
    .from('enquiry_items')
    .select('quantity, selected_color, price_at_enquiry, products ( name )')
    .eq('enquiry_id', enquiryId)

  if (itemsError) {
    console.error('notify-enquiry: items lookup failed', itemsError.code)
    return jsonResponse({ error: 'Lookup failed' }, 500)
  }

  const { subject, html, text } = buildEmail(enquiry, items ?? [])

  try {
    const sendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Tupperware Store <enquiries@tupstore.in>',
        to: [NOTIFICATION_EMAIL],
        subject,
        html,
        text,
      }),
    })

    if (!sendRes.ok) {
      console.error('notify-enquiry: Resend send failed', sendRes.status)
      return jsonResponse({ error: 'Email send failed' }, 502)
    }
  } catch (err) {
    console.error('notify-enquiry: Resend request error', err.message)
    return jsonResponse({ error: 'Email send failed' }, 502)
  }

  return jsonResponse({ ok: true })
})
