import { useState } from 'react'
import { useSEO } from '../hooks/useSEO'
import { useSubmitContactEnquiry } from '../hooks/useSubmitContactEnquiry'
import {
  Container,
  Section,
  Breadcrumb,
  PageBanner,
} from '../components/layout'
import { Card, Input, Select, Textarea, Button, Badge } from '../components/ui'
import { IconWhatsApp } from '../components/layout/icons'
import { STORE_WHATSAPP_NUMBER } from '../utils/whatsapp'

const PUBLIC_EMAIL = 'info@tupstore.in'

// Milestone 11 — this form now persists via the same enquiries table the
// Product Enquiry flow uses (see useSubmitContactEnquiry.js), with no
// enquiry_items since there's no product. City/Category have no columns of
// their own, so they're folded into customer_message on submit rather than
// silently discarded.

const MIN_PHONE_DIGITS = 10

function validateContactForm({ name, phone }) {
  const errors = {}
  if (!name.trim()) errors.name = 'Name is required.'

  const digitCount = phone.replace(/\D/g, '').length
  if (!phone.trim()) {
    errors.phone = 'Phone number is required.'
  } else if (digitCount < MIN_PHONE_DIGITS) {
    errors.phone = 'Enter a valid phone number.'
  }

  return errors
}

const CITY_OPTIONS = [
  'Ernakulam / Kochi',
  'Thiruvananthapuram',
  'Kozhikode',
  'Thrissur',
  'Kottayam',
  'Other Kerala District',
]

const CATEGORY_OPTIONS = [
  'All Categories / General Enquiry',
  'Hydration Bottles & Flasks',
  'Lunch Boxes & Sets',
  'Modular Kitchen Storage',
  'Thermals & Vacuum Flasks',
]

const initialForm = {
  name: '',
  phone: '',
  email: '',
  city: CITY_OPTIONS[0],
  category: CATEGORY_OPTIONS[0],
  message: '',
}

export default function ContactPage() {
  useSEO({
    title: 'Contact Us | Tupperware Exclusive Store Kerala',
    description:
      'Get in touch with Tupperware Exclusive Store Kerala for product enquiries, instant WhatsApp quotes, and bulk order discounts.',
  })

  const [form, setForm] = useState(initialForm)
  const [submitted, setSubmitted] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [result, setResult] = useState(null)
  const { submit, submitting, error } = useSubmitContactEnquiry()

  const setField = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errors = validateContactForm(form)
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    const customerMessage = [
      `Category: ${form.category}`,
      `City: ${form.city}`,
      form.message.trim(),
    ]
      .filter(Boolean)
      .join('\n')

    try {
      const outcome = await submit({
        customerName: form.name,
        customerPhone: form.phone,
        customerEmail: form.email,
        customerMessage,
      })
      setResult(outcome)
      setForm(initialForm)
      setSubmitted(true)
    } catch {
      // `error` (from the hook) is already set and rendered below; stay on
      // the form so the customer's entered values are preserved for retry.
    }
  }

  const handleReset = () => {
    setForm(initialForm)
    setFieldErrors({})
    setResult(null)
    setSubmitted(false)
  }

  return (
    <>
      <PageBanner
        title="Get in Touch with Our Exclusive Store"
        image="/images/hero_banner_glass.png"
      />
      <Breadcrumb
        items={[{ label: 'Home', href: '/' }, { label: 'Contact Us' }]}
      />

      <Section grey>
        <Container>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Left column: store details */}
            <div className="flex flex-col gap-6 lg:col-span-5">
              <Card className="p-6 sm:p-7">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-wa text-white">
                    <IconWhatsApp className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-heading text-base font-bold text-ink">
                      Instant WhatsApp Assistance
                    </h3>
                    <div className="text-xs font-bold text-wa">
                      Active Store Representative Online
                    </div>
                  </div>
                </div>
                <p className="mb-4 text-sm leading-relaxed text-ink-secondary">
                  Connect directly with our store representative on WhatsApp for
                  real-time inventory checks, price quotes, and delivery
                  booking.
                </p>
                <Button
                  variant="wa"
                  fullWidth
                  onClick={() =>
                    window.open(
                      `https://wa.me/${STORE_WHATSAPP_NUMBER}`,
                      '_blank',
                      'noopener'
                    )
                  }
                >
                  Chat on WhatsApp
                </Button>
              </Card>

              <Card className="p-6 sm:p-7">
                <h3 className="mb-4 font-heading text-base font-bold text-ink">
                  Store &amp; Franchise Details
                </h3>
                <ul className="flex flex-col gap-4 text-sm">
                  <li>
                    <strong className="text-ink">Store Location:</strong>
                    <p className="mt-0.5 text-ink-secondary">
                      MG Road, Ernakulam / Kochi, Kerala 682016, India
                    </p>
                  </li>
                  <li>
                    <strong className="text-ink">Phone Helpline:</strong>
                    <p className="mt-0.5 text-ink-secondary">+91 7736730041</p>
                  </li>
                  <li>
                    <strong className="text-ink">Email Support:</strong>
                    <p className="mt-0.5 text-ink-secondary">
                      <a
                        href={`mailto:${PUBLIC_EMAIL}`}
                        className="hover:text-ink"
                      >
                        {PUBLIC_EMAIL}
                      </a>
                    </p>
                  </li>
                  <li>
                    <strong className="text-ink">Operating Hours:</strong>
                    <p className="mt-0.5 text-ink-secondary">
                      Mon – Sat: 10:00 AM – 8:00 PM
                    </p>
                  </li>
                </ul>
              </Card>

              <Card className="p-6 sm:p-7">
                <h3 className="mb-4 font-heading text-base font-bold text-ink">
                  Serving All Districts in Kerala
                </h3>
                <div className="flex flex-wrap gap-2">
                  {CITY_OPTIONS.slice(0, 5).map((city) => (
                    <Badge key={city} variant="solid" className="normal-case">
                      {city}
                    </Badge>
                  ))}
                </div>
              </Card>
            </div>

            {/* Right column: enquiry form */}
            <Card className="p-8 lg:col-span-7">
              {submitted ? (
                <div className="py-6 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-wa text-2xl text-white">
                    ✓
                  </div>
                  <h3 className="mb-2 font-heading text-2xl font-bold text-ink">
                    Enquiry Submitted Successfully!
                  </h3>
                  <p className="mx-auto mb-2 max-w-md text-sm text-ink-secondary">
                    Thank you! Our team will contact you shortly.
                  </p>
                  <p className="mx-auto mb-6 max-w-md text-xs text-ink-muted">
                    {result?.persisted
                      ? `Reference ID: ${result.id}`
                      : 'This was a demo submission — no database record was created.'}
                  </p>
                  <Button variant="secondary" onClick={handleReset}>
                    Send Another Enquiry
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                  <div>
                    <span className="mb-2 inline-block text-[13px] font-semibold uppercase tracking-widest text-ink-secondary">
                      GET IN TOUCH
                    </span>
                    <h2 className="mb-2 font-heading text-2xl font-bold text-ink md:text-[38px]">
                      Send a Product &amp; Pricing Enquiry
                    </h2>
                    <p className="text-sm text-ink-secondary">
                      Fill out the form below and our team will get back to you
                      with pricing and availability.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-2">
                    <Input
                      label="Full Name *"
                      value={form.name}
                      onChange={setField('name')}
                      error={fieldErrors.name}
                      placeholder="e.g. Anjali Nair"
                      disabled={submitting}
                    />
                    <Input
                      label="WhatsApp / Phone Number *"
                      value={form.phone}
                      onChange={setField('phone')}
                      error={fieldErrors.phone}
                      placeholder="e.g. 98470 12345"
                      disabled={submitting}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-2">
                    <Input
                      type="email"
                      label="Email Address"
                      value={form.email}
                      onChange={setField('email')}
                      placeholder="e.g. anjali@example.com"
                      disabled={submitting}
                    />
                    <Select
                      label="Nearest District / City"
                      value={form.city}
                      onChange={setField('city')}
                      disabled={submitting}
                    >
                      {CITY_OPTIONS.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <Select
                    label="Product Category of Interest"
                    value={form.category}
                    onChange={setField('category')}
                    disabled={submitting}
                  >
                    {CATEGORY_OPTIONS.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </Select>

                  <Textarea
                    label="Enquiry Details / Message"
                    rows={4}
                    value={form.message}
                    onChange={setField('message')}
                    placeholder="Specify products, quantities, or delivery address..."
                    disabled={submitting}
                  />

                  {error && <p className="text-xs text-error">{error}</p>}

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button
                      type="submit"
                      variant="primary"
                      fullWidth
                      disabled={submitting}
                    >
                      {submitting ? 'Submitting…' : 'Submit Direct Enquiry'}
                    </Button>
                    <Button
                      type="button"
                      variant="wa"
                      fullWidth
                      onClick={() => {
                        const msgParts = [
                          'Hello Tupperware Kerala! I have an enquiry.',
                          form.name ? `Name: ${form.name}` : null,
                          form.phone ? `Phone: ${form.phone}` : null,
                          form.city ? `City: ${form.city}` : null,
                          form.category ? `Category: ${form.category}` : null,
                          form.message ? `Message: ${form.message}` : null,
                        ].filter(Boolean)
                        const waMsg = encodeURIComponent(msgParts.join('\n'))
                        window.open(
                          `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${waMsg}`,
                          '_blank',
                          'noopener'
                        )
                      }}
                    >
                      Send Enquiry via WhatsApp
                    </Button>
                  </div>
                </form>
              )}
            </Card>
          </div>
        </Container>
      </Section>
    </>
  )
}
