import { cn } from '../../utils/cn'
import { Input, Radio, Checkbox } from '../../components/ui'
import { MOCK_FILTER_OPTIONS } from '../../data'

// .filter-widget / .filter-list / .price-slider — DESIGN_SYSTEM.md §9/§18.
// Fully controlled — every value + its onChange is a prop; this component
// holds no filter state itself. `options` defaults to mock data only as a
// convenience for the showcase, not a real data dependency.

function FilterWidget({ title, children }) {
  return (
    <div className="py-[18px] first:pt-0 last:pb-0">
      <h5 className="mb-4 text-[11px] font-bold uppercase tracking-[0.08em] text-ink">
        {title}
      </h5>
      {children}
    </div>
  )
}

/**
 * @param {object} props
 * @param {typeof MOCK_FILTER_OPTIONS} [props.options]
 * @param {string} [props.search]
 * @param {(value: string) => void} [props.onSearchChange]
 * @param {string} [props.category]
 * @param {(value: string) => void} [props.onCategoryChange]
 * @param {number} [props.priceMax]
 * @param {(value: number) => void} [props.onPriceMaxChange]
 * @param {string} [props.capacity]
 * @param {(value: string) => void} [props.onCapacityChange]
 * @param {boolean} [props.inStockOnly]
 * @param {(value: boolean) => void} [props.onInStockChange]
 * @param {string} [props.collection]
 * @param {(value: string) => void} [props.onCollectionChange]
 * @param {string[]} [props.discounts]
 * @param {(value: string[]) => void} [props.onDiscountsChange]
 * @param {string} [props.className]
 */
export function ProductFilters({
  options = MOCK_FILTER_OPTIONS,
  search = '',
  onSearchChange,
  category = 'all',
  onCategoryChange,
  priceMax = 3000,
  onPriceMaxChange,
  capacity = 'all',
  onCapacityChange,
  inStockOnly = false,
  onInStockChange,
  collection = 'all',
  onCollectionChange,
  discounts = [],
  onDiscountsChange,
  className,
}) {
  const toggleDiscount = (id) => {
    const next = discounts.includes(id)
      ? discounts.filter((d) => d !== id)
      : [...discounts, id]
    onDiscountsChange?.(next)
  }

  return (
    <div className={cn('divide-y divide-hairline-subtle', className)}>
      <FilterWidget title="Search Products">
        <Input
          value={search}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder="Keyword search..."
          aria-label="Search products"
          className="py-2.5 text-[13.5px]"
        />
      </FilterWidget>

      <FilterWidget title="Categories">
        <div className="flex flex-col gap-1.5">
          {options.categories.map((opt) => (
            <Radio
              key={opt.id}
              name="filter-category"
              checked={category === opt.id}
              onChange={() => onCategoryChange?.(opt.id)}
            >
              {opt.label}
            </Radio>
          ))}
        </div>
      </FilterWidget>

      <FilterWidget title="Max Price (INR)">
        <input
          type="range"
          min={500}
          max={3000}
          step={100}
          value={priceMax}
          onChange={(e) => onPriceMaxChange?.(Number(e.target.value))}
          aria-label="Maximum price"
          className="price-slider mb-2.5 w-full cursor-pointer"
        />
        <div className="flex items-center justify-between text-xs text-ink-secondary">
          <span>₹500</span>
          <span className="font-bold text-ink">
            ₹{priceMax.toLocaleString('en-IN')}
          </span>
          <span>₹3,000+</span>
        </div>
      </FilterWidget>

      <FilterWidget title="Capacity Size">
        <div className="flex flex-col gap-1.5">
          {options.capacities.map((opt) => (
            <Radio
              key={opt.id}
              name="filter-capacity"
              checked={capacity === opt.id}
              onChange={() => onCapacityChange?.(opt.id)}
            >
              {opt.label}
            </Radio>
          ))}
        </div>
      </FilterWidget>

      <FilterWidget title="Availability">
        <Checkbox
          checked={inStockOnly}
          onChange={(e) => onInStockChange?.(e.target.checked)}
        >
          In Stock Only
        </Checkbox>
      </FilterWidget>

      <FilterWidget title="Collections">
        <div className="flex flex-col gap-1.5">
          {options.collections.map((opt) => (
            <Radio
              key={opt.id}
              name="filter-collection"
              checked={collection === opt.id}
              onChange={() => onCollectionChange?.(opt.id)}
            >
              {opt.label}
            </Radio>
          ))}
        </div>
      </FilterWidget>

      <FilterWidget title="Discount">
        <div className="flex flex-col gap-1.5">
          {options.discounts.map((opt) => (
            <Checkbox
              key={opt.id}
              checked={discounts.includes(opt.id)}
              onChange={() => toggleDiscount(opt.id)}
            >
              {opt.label}
            </Checkbox>
          ))}
        </div>
      </FilterWidget>
    </div>
  )
}
