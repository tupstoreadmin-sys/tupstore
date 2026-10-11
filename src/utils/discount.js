// Whole-number discount percentage from the data's own prices, or null when
// there is no real discount (no original price, or it is not above the price).
// Shared so the price row and any discount sticker always show the same number.
export function getDiscountPercent(price, originalPrice) {
  if (!originalPrice || !(originalPrice > price)) return null
  return Math.round(((originalPrice - price) / originalPrice) * 100)
}
