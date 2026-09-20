import { Button } from '../../components/ui'
import { SectionHeader } from '../../components/layout'
import { IconArrowRight } from '../../components/layout/icons'

// New Home section — visual parity with the approved home-final1 design's
// "Trusted Destination" block. Structurally mirrors AboutStorePage.jsx's
// existing two-column story section (SectionHeader + placeholder body
// copy + image) rather than inventing a new pattern. Body paragraphs stay
// placeholder pending a content milestone; `onLearnMore` is a callback
// prop (this file stays router-free, per ARCHITECTURE.md's features/*
// rule) — the caller decides where the button navigates.

/**
 * @param {object} props
 * @param {() => void} [props.onLearnMore]
 * @param {string} [props.className]
 */
export function TrustedDestination({ onLearnMore, className }) {
  const handleLearnMore = () => {
    if (onLearnMore) {
      onLearnMore()
    } else {
      const el = document.getElementById('featured-offers')
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <div className={className}>
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
        <div>
          <SectionHeader
            align="left"
            eyebrow="Official Exclusive Store"
            title="Your Trusted Destination for Genuine Tupperware in Kerala"
            className="mb-6"
          />
          <p className="mb-4 text-[15px] leading-relaxed text-ink-secondary">
            Welcome to our Official Tupperware Exclusive Store franchise.
            Serving families, working professionals, and culinary enthusiasts
            across Kochi, Trivandrum, Kozhikode, and all of Kerala.
          </p>
          <p className="mb-4 text-[15px] leading-relaxed text-ink-secondary">
            We believe in offering only 100% genuine, BPA-free, high-quality
            Tupperware storage solutions and thermalware directly from verified
            company stocks. All products displayed here feature standard prices,
            and are backed by Tupperware's legendary warranty against chipping,
            cracking, or breaking under normal household usage.
          </p>
          <p className="mb-8 text-[15px] leading-relaxed text-ink-secondary">
            Browse our interactive catalog, add your preferred items to the
            Enquiry List, and send it directly to our WhatsApp consultation
            team. We provide price quotes, combo discounts, and secure home
            delivery options anywhere in Kerala.
          </p>
          <Button variant="primary" onClick={handleLearnMore}>
            Learn About Ongoing Offers
            <IconArrowRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="overflow-hidden rounded-lg bg-surface-subtle">
          <img
            src="/images/hero_kitchen.png"
            alt="Store interior"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </div>
  )
}
