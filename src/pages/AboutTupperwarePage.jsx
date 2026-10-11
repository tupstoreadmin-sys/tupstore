import { Link } from 'react-router-dom'
import { useSEO } from '../hooks/useSEO'
import { Container, Section, Breadcrumb, PageBanner } from '../components/layout'
import {
  IconShield,
  IconStarOutline,
  IconClock,
  IconLeaf,
  IconPlus,
  IconArrowRight,
} from '../components/layout/icons'

export default function AboutTupperwarePage() {
  useSEO({
    title: 'About Tupperware | Official Exclusive Store Kerala',
    description:
      'Learn about authentic Tupperware food safety, 100% virgin BPA-free plastic materials, lifetime guarantee, and kitchen organization solutions in Kerala.',
  })

  const advantages = [
    {
      icon: <IconShield className="h-5 w-5 text-ink" />,
      title: '100% Genuine Products',
      description:
        'Guaranteed authentic Tupperware directly from authorized exclusive store inventory.',
    },
    {
      icon: <IconStarOutline className="h-5 w-5 text-ink" />,
      title: 'Premium World-Class Quality',
      description:
        'Precision Swiss & German engineering for unmatched durability and lifetime seal integrity.',
    },
    {
      icon: <IconClock className="h-5 w-5 text-ink" />,
      title: 'Trusted Kerala Franchise',
      description:
        'Based in Changanassery, Kottayam, and serving customers across Kerala.',
    },
    {
      icon: <IconLeaf className="h-5 w-5 text-ink" />,
      title: '100% BPA Free & Safe',
      description:
        'Made from non-toxic virgin materials that meet stringent international food safety standards.',
    },
    {
      icon: <IconPlus className="h-5 w-5 text-ink" />,
      title: 'Long-lasting Guarantee',
      description:
        "Backed by Tupperware's legendary quality assurance against chipping, warping, and cracking.",
    },
  ]

  return (
    <div className="bg-surface">
      {/* Page Banner */}
      <PageBanner
        title="Authentic Tupperware Excellence"
        image="/images/hero_banner_kitchen.png"
      />

      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'About', href: '#' },
          { label: 'About Tupperware' },
        ]}
      />

      {/* Section 1: Our Franchise Mission */}
      <Section className="py-12 md:py-20">
        <Container>
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
            {/* Left Content */}
            <div className="lg:col-span-7 flex flex-col items-start">
              <div className="inline-flex items-center gap-2 mb-3">
                <span className="h-2 w-2 rounded-full bg-[#00C853]"></span>
                <span className="text-xs font-bold uppercase tracking-widest text-[#00C853]">
                  OUR FRANCHISE MISSION
                </span>
              </div>
              <h2 className="font-heading text-2xl font-bold tracking-tight text-ink md:text-3xl lg:text-4xl leading-tight mb-6">
                Zero Compromise on Food Safety & Kitchen Organization
              </h2>
              <p className="text-sm sm:text-base text-ink-secondary leading-relaxed mb-4">
                At{' '}
                <strong className="text-ink font-semibold">tupstore.in</strong>{' '}
                (Official Exclusive Store Franchise, Changanassery, Kottayam), we
                believe that healthy living starts in the kitchen. Every product
                in our catalogue is manufactured from 100% virgin food-grade
                polymer materials, completely free from harmful BPA, lead, and
                phthalates.
              </p>
              <p className="text-sm sm:text-base text-ink-secondary leading-relaxed mb-8">
                Whether you are organizing a traditional Kerala kitchen with
                airtight spice and rice storage, packing fresh homemade lunches
                for school and work, or upgrading to eco-friendly borosilicate
                glassware, we guarantee 100% authentic inventory sourced
                directly from Tupperware India manufacturing units.
              </p>
              <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
                <Link
                  to="/shop"
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-md bg-ink px-6 py-3.5 text-sm font-semibold text-white shadow-btn-primary transition-all duration-fast hover:bg-black hover:shadow-btn-primary-hover"
                >
                  Browse Full Catalogue
                </Link>
                <Link
                  to="/contact"
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-md bg-surface-subtle px-6 py-3.5 text-sm font-semibold text-ink border border-hairline transition-all duration-fast hover:bg-neutral-200"
                >
                  Contact Store Manager
                </Link>
              </div>
            </div>

            {/* Right Image & Stats Card */}
            <div className="lg:col-span-5">
              <div className="overflow-hidden rounded-2xl border border-hairline bg-white shadow-subtle">
                <div className="h-64 sm:h-72 w-full overflow-hidden">
                  <img
                    src="/images/cat_kitchen.png"
                    alt="Tupperware Pantry Organization"
                    className="h-full w-full object-cover transition-transform duration-smooth hover:scale-105"
                  />
                </div>
                <div className="grid grid-cols-2 divide-x divide-hairline bg-surface-subtle p-6 text-center">
                  <div className="px-2">
                    <div className="font-heading text-2xl md:text-3xl font-extrabold text-ink">
                      25,000+
                    </div>
                    <div className="mt-1 text-xs md:text-sm font-medium text-ink-secondary">
                      Happy Kerala Households
                    </div>
                  </div>
                  <div className="px-2">
                    <div className="font-heading text-2xl md:text-3xl font-extrabold text-ink">
                      100%
                    </div>
                    <div className="mt-1 text-xs md:text-sm font-medium text-ink-secondary">
                      Virgin BPA-Free Plastic
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Section 2: Why Choose Us - The Official Tupperware Advantage */}
      <Section className="bg-surface py-12 md:py-20 border-t border-hairline">
        <Container>
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-ink-muted block mb-2">
              WHY CHOOSE US
            </span>
            <h2 className="font-heading text-2xl md:text-4xl font-extrabold text-ink tracking-tight">
              The Official Tupperware Advantage
            </h2>
            <p className="mt-3 text-sm md:text-base text-ink-secondary">
              Why families across Kerala trust our exclusive store franchise,
              based in Changanassery, Kottayam.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {advantages.map((adv, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-hairline bg-surface-subtle/50 p-5 md:p-6 text-left md:text-center transition-all duration-fast hover:bg-white hover:shadow-hover"
              >
                <div className="flex items-center gap-3.5 mb-3 text-left md:flex-col md:items-center md:text-center md:mb-0">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white shadow-sm border border-hairline md:mb-5">
                    {adv.icon}
                  </div>
                  <h3 className="font-heading text-base font-bold text-ink text-left md:text-center md:mb-2 flex-1 min-w-0 leading-tight">
                    {adv.title}
                  </h3>
                </div>
                <p className="text-sm sm:text-base text-ink-secondary leading-relaxed text-left md:text-center">
                  {adv.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Section 4: Ready to Upgrade Your Kitchen CTA */}
      <Section className="pt-0 pb-12 md:pb-20 bg-surface">
        <Container>
          <div className="relative overflow-hidden rounded-3xl bg-[#0B131E] px-6 py-12 text-center text-white md:px-12 md:py-16 shadow-drawer">
            <div className="relative z-10 max-w-2xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-widest text-neutral-300 block mb-2">
                UPGRADE TODAY
              </span>
              <h2 className="font-heading text-2xl md:text-4xl font-extrabold tracking-tight text-white mb-4">
                Ready to Upgrade Your Kitchen?
              </h2>
              <p className="text-sm md:text-base text-neutral-300 mb-8 leading-relaxed">
                Explore our complete catalogue of authentic Tupperware products
                and find the perfect storage solutions for your home.
              </p>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 rounded-md bg-white px-8 py-4 text-sm font-bold text-ink transition-all duration-fast hover:bg-neutral-100 hover:scale-105 shadow-btn-primary"
              >
                <span>Browse Full Catalogue</span>
                <IconArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  )
}
