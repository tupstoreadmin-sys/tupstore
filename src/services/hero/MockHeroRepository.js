import { HeroRepository } from './HeroRepository'
import { MOCK_HERO_SLIDES } from '../../data/promotions'

// Implements HeroRepository against the existing MOCK_HERO_SLIDES dataset —
// unlike MockPromotionsRepository (which has no mock dataset to fall back
// to and is required to always return []), MOCK_HERO_SLIDES already IS the
// real content the customer-facing Hero has always shown in mock/dev mode,
// so this keeps that working exactly as before rather than breaking
// VITE_DATA_SOURCE=mock dev/demo usage.
//
// Every mock slide's primaryCta always navigated internally (href: '/shop')
// and secondaryCta always opened WhatsApp regardless of its own href — see
// HomePage.jsx's previous hardcoded mapping — so those exact two behaviors
// are reproduced here as type: 'url' (a relative path, which the CTA
// click-handler in HomePage.jsx opens via in-app navigation, not a new
// tab — see its own comment) and type: 'whatsapp'.
export class MockHeroRepository extends HeroRepository {
  /** @returns {Promise<import('./HeroRepository').HeroSlide[]>} */
  async getActiveHeroSlides() {
    return MOCK_HERO_SLIDES.map((slide, index) => ({
      id: `mock-hero-${index}`,
      tag: slide.tag,
      title: slide.title,
      image: slide.image,
      mobileImage: undefined,
      altText: '',
      primaryCta: slide.primaryCta
        ? { label: slide.primaryCta.label, type: 'url', href: slide.primaryCta.href }
        : undefined,
      secondaryCta: slide.secondaryCta
        ? { label: slide.secondaryCta.label, type: 'whatsapp' }
        : undefined,
      trustBadges: slide.trustBadges ?? [],
    }))
  }
}
