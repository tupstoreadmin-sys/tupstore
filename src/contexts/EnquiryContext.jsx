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

  const clearItems = () => setItems([])

  const ids = useMemo(() => items.map((item) => item.id), [items])
  const count = useMemo(
    () => items.reduce((sum, item) => sum + item.qty, 0),
    [items]
  )

  const value = {
    items,
    ids,
    count,
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
