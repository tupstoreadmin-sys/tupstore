// A rating is real only when it is a finite number above 0 and at most 5.
// Missing (null/undefined), blank, non-numeric, zero or out-of-range values are
// "no rating": this returns null and callers render nothing. Never invents a value.
export function getValidRating(value) {
  if (value === null || value === undefined || value === '') return null
  const rating = Number(value)
  return Number.isFinite(rating) && rating > 0 && rating <= 5 ? rating : null
}
