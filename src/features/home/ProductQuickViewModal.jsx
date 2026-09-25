import { useEffect, useRef } from 'react'
import { Badge, Button, ProductPrice, ProductRating } from '../../components/ui'
import { IconClose } from '../../components/layout/icons'

// Secondary modal layered above InstagramReelModal (z-[400], above the
// Reel's own z-[300]/z-[330] layers) — a compact preview built only from
// the tagged-product fields already flowing through
// socialVideoApi.js -> reelMapper.js -> InstagramReelModal.jsx. Never
// fetches its own data and never duplicates ProductDetailPage; "View
// Product Details" is the only way to see the full page. Every field below
// is rendered conditionally so a genuinely missing value (no badge, no
// rating, etc.) is simply omitted rather than shown as fake/default content.

/**
 * @param {object} props
 * @param {{id:string|number, slug?:string, name:string, image:string,
 *   price:number, originalPrice?:number, badge?:string, rating?:number,
 *   capacity?:string, description?:string}} props.product
 * @param {() => void} props.onClose
 * @param {(product: object) => void} props.onAddToEnquiry
 * @param {(product: object) => void} props.onViewDetails
 */
export function ProductQuickViewModal({
  product,
  onClose,
  onAddToEnquiry,
  onViewDetails,
}) {
  const closeButtonRef = useRef(null)

  // Starts the tab order inside the dialog (its close button) rather than
  // leaving focus on whatever tagged-product button opened it, so Tab
  // doesn't immediately land back on Reel controls hidden underneath.
  useEffect(() => {
    closeButtonRef.current?.focus()
  }, [])

  return (
    <div
      className="fixed inset-0 z-[400] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(e) => {
        e.stopPropagation()
        onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${product.name} quick view`}
        onClick={(e) => e.stopPropagation()}
        className="relative flex w-full max-w-[420px] max-h-[90vh] flex-col overflow-y-auto rounded-2xl bg-white shadow-2xl md:max-w-[600px] md:flex-row"
      >
        <button
          ref={closeButtonRef}
          type="button"
          aria-label="Close product details"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-ink shadow-md transition-colors duration-fast ease-brand hover:bg-surface-subtle"
        >
          <IconClose className="h-5 w-5" />
        </button>

        <div className="h-56 w-full shrink-0 overflow-hidden bg-surface-subtle sm:h-64 md:h-auto md:w-[45%]">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="flex flex-1 flex-col p-5 sm:p-6">
          {product.badge && (
            <div className="mb-3">
              <Badge variant="solid">{product.badge}</Badge>
            </div>
          )}

          <h3 className="mb-2 pr-8 text-xl font-bold leading-tight text-ink">
            {product.name}
          </h3>

          {typeof product.rating === 'number' && (
            <div className="mb-3">
              <ProductRating rating={product.rating} showOutOfFive />
            </div>
          )}

          {product.capacity && (
            <div className="mb-3 text-sm text-ink-secondary">
              Capacity: <strong className="text-ink">{product.capacity}</strong>
            </div>
          )}

          <div className="mb-4">
            <ProductPrice
              price={product.price}
              originalPrice={product.originalPrice}
            />
          </div>

          {product.description && (
            <p className="mb-5 text-sm leading-relaxed text-ink-secondary">
              {product.description}
            </p>
          )}

          <div className="mt-auto flex flex-col gap-3 pt-2">
            <Button
              variant="wa"
              fullWidth
              onClick={() => onAddToEnquiry(product)}
            >
              Add to Enquiry
            </Button>
            {product.slug && (
              <Button
                variant="secondary"
                fullWidth
                onClick={() => onViewDetails(product)}
              >
                View Product Details
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
