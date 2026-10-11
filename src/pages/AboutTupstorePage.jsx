import { Link } from 'react-router-dom'
import { useSEO } from '../hooks/useSEO'
import { Container, Section, Breadcrumb, PageBanner } from '../components/layout'
import {
  IconMapPin,
  IconClock,
  IconPhone,
  IconMail,
} from '../components/layout/icons'
import { STORE_WHATSAPP_NUMBER } from '../utils/whatsapp'
import { SOCIAL_LINKS } from '../utils/socialLinks'

export default function AboutTupstorePage() {
  useSEO({
    title: 'About Tupstore | Tupperware Exclusive Store Changanassery',
    description:
      'Visit our physical Tupperware Exclusive Store showroom in Changanassery, Kottayam, Kerala. Experience authentic products, expert guidance, and custom kitchen storage sets.',
  })

  const storeDetails = [
    {
      icon: <IconMapPin className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />,
      label: 'Location:',
      value: 'Laikkad Signal Jn., M.C. Road, Changanassery, Kottayam 686102',
    },
    {
      icon: <IconClock className="h-5 w-5 text-ink-muted shrink-0 mt-0.5" />,
      label: 'Hours:',
      value: 'Mon - Sat: 10:00 AM - 8:00 PM',
    },
    {
      icon: <IconPhone className="h-5 w-5 text-ink-muted shrink-0 mt-0.5" />,
      label: 'Phone / WA:',
      value: '+91 7736730041',
    },
    {
      icon: <IconMail className="h-5 w-5 text-ink-muted shrink-0 mt-0.5" />,
      label: 'Email:',
      value: 'info@tupstore.in',
    },
  ]

  return (
    <div className="bg-surface">
      {/* Page Banner */}
      <PageBanner
        title="Your Authorized Exclusive Store"
        image="/images/hero_kitchen.png"
      />

      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'About', href: '#' },
          { label: 'About Tupstore' },
        ]}
      />

      {/* Section 1: Visit Our Physical Store */}
      <Section className="py-12 md:py-20">
        <Container>
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
            {/* Left Content */}
            <div className="lg:col-span-7 flex flex-col items-start">
              <span className="text-xs font-bold uppercase tracking-widest text-ink-muted block mb-2">
                STORE SHOWROOM
              </span>
              <h2 className="font-heading text-2xl font-bold tracking-tight text-ink md:text-3xl lg:text-4xl leading-tight mb-4">
                Visit Our Physical Store
              </h2>
              <p className="text-sm sm:text-base text-ink-secondary leading-relaxed mb-8">
                Experience the premium quality, feel the robust airtight seals,
                and see the vibrant colors of authentic Tupperware in person.
                Our expert store representatives are always ready to demonstrate
                products, suggest the best kitchen storage systems, and help you
                pick perfect gifts.
              </p>

              {/* Store details info list */}
              <div className="flex flex-col gap-4 mb-8 w-full">
                {storeDetails.map((detail, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 text-sm md:text-base"
                  >
                    {detail.icon}
                    <div>
                      <strong className="font-bold text-ink mr-2">
                        {detail.label}
                      </strong>
                      <span className="text-ink-secondary">{detail.value}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
                <a
                  href={SOCIAL_LINKS.storeLocation}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-md bg-ink px-6 py-3.5 text-sm font-semibold text-white shadow-btn-primary transition-all duration-fast hover:bg-black hover:shadow-btn-primary-hover"
                >
                  Get Directions
                </a>
                <Link
                  to="/contact"
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-md bg-surface-subtle px-6 py-3.5 text-sm font-semibold text-ink border border-hairline transition-all duration-fast hover:bg-neutral-200"
                >
                  Contact Us
                </Link>
              </div>
            </div>

            {/* Right Image Card */}
            <div className="lg:col-span-5">
              <div className="overflow-hidden rounded-2xl border border-hairline bg-white shadow-subtle">
                <img
                  src="/images/hero_kitchen.png"
                  alt="Tupperware Showroom Interior"
                  className="h-80 sm:h-96 w-full object-cover transition-transform duration-smooth hover:scale-105"
                />
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Section 3: Visit Our Showroom Card */}
      <Section className="pt-0 pb-12 md:pb-20 bg-surface">
        <Container>
          <div className="overflow-hidden rounded-3xl bg-[#0B131E] p-8 md:p-14 text-white shadow-drawer">
            <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
              <div className="lg:col-span-7 flex flex-col items-start">
                <span className="text-xs font-bold uppercase tracking-widest text-[#00C853] mb-3 block">
                  VISIT OUR SHOWROOM
                </span>
                <h2 className="font-heading text-2xl md:text-4xl font-extrabold tracking-tight text-white mb-4 leading-tight">
                  Tupperware Exclusive Store Changanassery, Kottayam
                </h2>
                <p className="text-sm md:text-base text-neutral-300 mb-8 leading-relaxed">
                  Experience the full product range in person! Our showroom
                  staff will help you choose exact container sizes, test
                  liquid-tight seals, and assemble custom kitchen storage sets.
                </p>
                <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
                  <Link
                    to="/shop"
                    className="w-full sm:w-auto inline-flex items-center justify-center rounded-md bg-[#00C853] px-6 py-3.5 text-sm font-bold text-white shadow-btn-wa-hover transition-all duration-fast hover:bg-[#00b048] hover:scale-105"
                  >
                    Check Products
                  </Link>
                  <a
                    href={`https://wa.me/${STORE_WHATSAPP_NUMBER}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center rounded-md bg-neutral-800 px-6 py-3.5 text-sm font-semibold text-white border border-neutral-700 transition-all duration-fast hover:bg-neutral-700"
                  >
                    WhatsApp Store Helpline
                  </a>
                </div>
              </div>
              <div className="lg:col-span-5">
                <div className="overflow-hidden rounded-2xl border border-white/10 shadow-modal">
                  <img
                    src="/images/hero_kitchen.png"
                    alt="Tupperware Showroom Changanassery"
                    className="h-64 sm:h-72 w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  )
}
