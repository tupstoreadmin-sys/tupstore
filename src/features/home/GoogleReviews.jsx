import { Button } from '../../components/ui'
import { IconExternalLink } from '../../components/layout/icons'
import { GOOGLE_REVIEWS } from '../../data/googleReviews'
import { GOOGLE_MAPS_LISTING_URL } from '../../utils/googleMaps'
import { TestimonialCarousel } from './TestimonialCarousel'

/**
 * "What Our Customers Say" — five genuine Google reviews of the store, selected and entered by
 * hand (src/data/googleReviews.js). Reuses the testimonial carousel so the cards, arrows and
 * responsive behaviour match the approved design. Each card, and the button, opens the store's
 * Google Maps listing in a new tab. Nothing is fetched from Google, so the reviews do not update
 * automatically.
 *
 * @param {object} props
 * @param {string} [props.listingUrl]
 * @param {string} [props.className]
 */
export function GoogleReviews({ listingUrl = GOOGLE_MAPS_LISTING_URL, className }) {
  const reviews = GOOGLE_REVIEWS.map((review) => ({
    ...review,
    href: listingUrl,
    source: 'google',
  }))

  return (
    <TestimonialCarousel
      className={className}
      eyebrow="GOOGLE REVIEWS"
      title="What Our Customers Say"
      description="Read genuine customer experiences from our store on Google."
      testimonials={reviews}
      action={
        <Button
          variant="primary"
          href={listingUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Read All Google Reviews
          <IconExternalLink className="h-4 w-4" />
        </Button>
      }
      footerNote="Reviews shown as posted on Google. This is a hand-picked selection of five reviews from our Google Maps listing; select a review or the button to read all reviews on Google."
    />
  )
}
