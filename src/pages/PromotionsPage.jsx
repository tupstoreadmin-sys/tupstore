import { useNavigate } from 'react-router-dom'
import { useSEO } from '../hooks/useSEO'
import {
  Container,
  Section,
  SectionHeader,
  Breadcrumb,
  PageBanner,
} from '../components/layout'
import { PromotionStrip, InstagramReels } from '../features/home'
import { IconWhatsApp } from '../components/layout/icons'
import { STORE_WHATSAPP_NUMBER } from '../utils/whatsapp'
import { MOCK_PROMOTIONS, MOCK_REELS } from '../data'

export default function PromotionsPage() {
  useSEO({
    title: 'Promotions & Special Offers | Tupperware Exclusive Store Kerala',
    description:
      'Discover special limited-time combos, seasonal discounts, and exclusive franchise offers from Tupperware Exclusive Store Kerala.',
  })

  const navigate = useNavigate()

  return (
    <>
      <PageBanner
        title="Special Offers & Featured Combos"
        image="/images/hero_banner_glass.png"
      />
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Promotions & Special Offers' },
        ]}
      />

      <Section grey>
        <Container>
          <PromotionStrip
            eyebrow="LIVE FEATURED DEALS"
            title="Current Exclusive Promotions"
            description="Enquire directly on WhatsApp to claim special franchise discount pricing and bundled gifts."
            promotions={MOCK_PROMOTIONS}
            onSelect={() => navigate('/shop')}
          />
        </Container>
      </Section>

      {/* Video Spotlight Section */}
      <Section>
        <Container>
          <SectionHeader
            eyebrow="Video Spotlight"
            title="See Products in Action"
            description="Watch quick recipe demonstrations, airtight seal testing, and kitchen makeover videos."
          />
          <InstagramReels reels={MOCK_REELS} />
        </Container>
      </Section>

      {/* Franchise Bulk Quote Banner */}
      <Section grey>
        <Container>
          <div className="overflow-hidden rounded-3xl bg-[#0B131E] p-8 md:p-12 text-white shadow-drawer">
            <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-10">
              <div className="lg:col-span-7 flex flex-col items-start">
                <span className="text-xs font-bold uppercase tracking-widest text-[#25D366] mb-3 block">
                  Wholesale &amp; Corporate Gifting
                </span>
                <h3 className="font-heading text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-white mb-4 leading-tight">
                  Looking for Custom Bulk Sets?
                </h3>
                <p className="text-sm md:text-base text-neutral-300 mb-6 leading-relaxed">
                  We offer special wholesale and corporate gifting discounts for festivals, office events, and family functions across Kerala. Get a personalized invoice and custom product combo quote within 15 minutes on WhatsApp.
                </p>
                <a
                  href={`https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encodeURIComponent(
                    'Hello Tupperware Kerala! I have a bulk / corporate order enquiry.'
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3.5 text-sm font-bold text-white shadow-md transition-all duration-fast hover:bg-[#20ba5a] hover:scale-105 active:scale-95"
                >
                  <IconWhatsApp className="h-5 w-5" />
                  <span>Request Custom Bulk Quote on WhatsApp</span>
                </a>
              </div>
              <div className="lg:col-span-5 overflow-hidden rounded-2xl border border-white/10 shadow-lg">
                <img
                  src="/images/consultation_tupperware.png"
                  alt="Tupperware Bulk Gifting Sets"
                  className="h-64 sm:h-72 w-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  )
}
