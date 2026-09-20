import { useSEO } from '../hooks/useSEO'
import {
  Container,
  Section,
  SectionHeader,
  Breadcrumb,
  PageBanner,
} from '../components/layout'
import { WhyChooseUs } from '../features/home'
import { MOCK_WHY_US } from '../data'

export default function AboutStorePage() {
  useSEO({
    title: 'About Our Store | Tupperware Exclusive Store',
    description: 'Placeholder about-store page description.',
  })

  return (
    <>
      <PageBanner
        title="About Our Exclusive Store"
        image="/images/hero_kitchen.png"
      />
      <Breadcrumb
        items={[{ label: 'Home', href: '/' }, { label: 'About Store' }]}
      />

      <Section>
        <Container>
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div>
              <SectionHeader
                align="left"
                eyebrow="Our Story"
                title="Your Trusted Destination"
                className="mb-6"
              />
              <p className="mb-4 text-[15px] leading-relaxed text-ink-secondary">
                Placeholder paragraph describing the store&rsquo;s mission,
                history, and commitment to offering 100% genuine products.
              </p>
              <p className="text-[15px] leading-relaxed text-ink-secondary">
                Placeholder paragraph describing service coverage, delivery
                options, and customer commitment.
              </p>
            </div>
            <div className="overflow-hidden rounded-lg bg-surface-subtle">
              <img
                src="/images/hero_kitchen.png"
                alt="Store interior"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </Container>
      </Section>

      <Section grey>
        <Container>
          <SectionHeader
            eyebrow="Why Choose Us"
            title="What Sets Us Apart"
            description="Discover why households across Kerala trust our exclusive store for authentic Tupperware solutions and dependable warranty support."
          />
          <WhyChooseUs items={MOCK_WHY_US} />
        </Container>
      </Section>
    </>
  )
}
