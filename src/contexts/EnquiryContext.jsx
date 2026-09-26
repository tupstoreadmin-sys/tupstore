import { createContext, useContext, useMemo, useState } from 'react'

// Owns the enquiry list and nothing else — see ARCHITECTURE.md §2/§4.
// No import of UIContext. `addItem` is a pure state mutation; it does not
// open the enquiry drawer (that combined behavior lives in
// hooks/useAddToEnquiry.js, not here).

const EnquiryContext = createContext(null)

/**
 * @param {object} props
 * @param {React.ReactNode} props.children
 */
export function EnquiryProvider({ children }) {
  const [items, setItems] = useState([])
  // The promotion an enquiry is currently "about", if any — at most one at
  // a time (see useAddPromotionToEnquiry.js, the only place that ever calls
  // setPromotion). A promotion and independently-added products coexist in
  // one enquiry (client decision) — `items` never contains a promotion's own
  // tagged products, only products the customer added directly, so the two
  // never need reconciling. `includedProductNames` is a plain list of the
  // promotion's tagged products' names (not full product data — no
  // duplication), just enough to render "Included: ..." without a second
  // fetch. `price`/`originalPrice` are the combo's own offer pricing,
  // captured once for the same reason. `quantity` (default 1, minimum 1) is
  // how many units of the whole offer the customer wants — see
  // incrementPromotionQuantity/decrementPromotionQuantity below.
  const [promotion, setPromotion] = useState(null)

  const addItem = (product, qty = 1, color) => {
    setItems((current) => {
      const existing = current.find((item) => item.id === product.id)
      if (existing) {
        return current.map((item) =>
          item.id === product.id
            ? {
                ...item,
                qty: item.qty + qty,
                selectedColor: color ?? item.selectedColor,
              }
            : item
        )
      }
      return [
        ...current,
        {
          id: product.id,
          name: product.name,
          image: product.image,
          capacity: product.capacity,
          price: product.price,
          qty,
          selectedColor: color,
        },
      ]
    })
  }

  const incrementItem = (item) =>
    setItems((current) =>
      current.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i))
    )

  const decrementItem = (item) =>
    setItems((current) =>
      current.map((i) =>
        i.id === item.id ? { ...i, qty: Math.max(1, i.qty - 1) } : i
      )
    )

  const removeItem = (item) =>
    setItems((current) => current.filter((i) => i.id !== item.id))

  const removePromotion = () => setPromotion(null)

  // Mirrors incrementItem/decrementItem's shape for a normal product, but
  // there is only ever one staged promotion, so these act on `promotion`
  // directly rather than finding a row by id. The promotion must never drop
  // to 0 while staged — Remove Promotion (above) is the only way to clear it
  // entirely, matching this task's own explicit rule.
  const incrementPromotionQuantity = () =>
    setPromotion((current) =>
      current ? { ...current, quantity: current.quantity + 1 } : current
    )

  const decrementPromotionQuantity = () =>
    setPromotion((current) =>
      current
        ? { ...current, quantity: Math.max(1, current.quantity - 1) }
        : current
    )

  // Resets `promotion` together with `items` — the two always represent one
  // enquiry's lifecycle together (see useSubmitEnquiry.js, the only caller
  // after a successful submit).
  const clearItems = () => {
    setItems([])
    setPromotion(null)
  }

  const ids = useMemo(() => items.map((item) => item.id), [items])
  // A staged promotion contributes its own `quantity` (regardless of how
  // many of its own tagged products it has — those are never in `items`,
  // see the `promotion` state comment above), plus the normal sum-of-qty for
  // any independently-added products. A promotion-less enquiry is
  // unaffected — same sum-of-qty as always.
  const count = useMemo(
    () =>
      (promotion ? promotion.quantity : 0) +
      items.reduce((sum, item) => sum + item.qty, 0),
    [items, promotion]
  )

  const value = {
    items,
    ids,
    count,
    promotion,
    setPromotion,
    removePromotion,
    incrementPromotionQuantity,
    decrementPromotionQuantity,
    addItem,
    incrementItem,
    decrementItem,
    removeItem,
    clearItems,
  }

  return (
    <EnquiryContext.Provider value={value}>{children}</EnquiryContext.Provider>
  )
}

export function useEnquiry() {
  const context = useContext(EnquiryContext)
  if (!context) {
    throw new Error('useEnquiry must be used within an EnquiryProvider')
  }
  return context
}
