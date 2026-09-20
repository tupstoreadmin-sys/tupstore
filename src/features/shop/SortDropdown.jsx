import { cn } from '../../utils/cn'
import { Select } from '../../components/ui'

// .sort-select — DESIGN_SYSTEM.md §18 (Shop toolbar)

/**
 * @param {object} props
 * @param {'newest'|'price-asc'|'price-desc'|'rating'} [props.value]
 * @param {(value: string) => void} [props.onChange]
 * @param {string} [props.className]
 */
export function SortDropdown({
  value = 'newest',
  onChange,
  className,
  containerClassName,
}) {
  return (
    <Select
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      aria-label="Sort products"
      className={cn('w-auto py-2 text-xs sm:text-[13.5px] font-medium pl-3 pr-8', className)}
      containerClassName={containerClassName}
    >
      <option value="newest">Newest Arrivals</option>
      <option value="price-asc">Price: Low to High</option>
      <option value="price-desc">Price: High to Low</option>
      <option value="rating">Top Rated</option>
    </Select>
  )
}
