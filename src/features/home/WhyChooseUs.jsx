import { cn } from '../../utils/cn'
import {
  IconShield,
  IconStarOutline,
  IconAward,
  IconDroplet,
  IconInfinity,
} from '../../components/layout/icons'

// .why-grid / .why-card / .why-icon — DESIGN_SYSTEM.md §18
//
// `item.icon` is a string key (data files stay pure data/JSON-serializable,
// no JSX) — this lookup is the one place that maps it to a real icon
// component. Unknown/missing keys fall back to IconShield rather than
// rendering nothing.
const ICONS = {
  shield: IconShield,
  star: IconStarOutline,
  award: IconAward,
  droplet: IconDroplet,
  infinity: IconInfinity,
}

/**
 * @param {object} props
 * @param {{id:string, icon: keyof typeof ICONS, title:string, description:string}[]} props.items
 * @param {string} [props.className]
 */
export function WhyChooseUs({ items = [], className }) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-5',
        className
      )}
    >
      {items.map((item) => {
        const Icon = ICONS[item.icon] ?? IconShield
        return (
          <div
            key={item.id}
            className="rounded-lg border border-hairline bg-white p-5 md:px-5 md:py-7 text-left md:text-center transition-all duration-fast ease-brand hover:border-hairline-strong hover:shadow-subtle"
          >
            <div className="flex items-center gap-3.5 mb-3 text-left md:flex-col md:items-center md:text-center md:mb-0">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface-subtle text-ink md:h-14 md:w-14 md:mx-auto">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="text-base text-ink font-semibold text-left md:text-center md:mb-2 flex-1 min-w-0 leading-tight">
                {item.title}
              </h3>
            </div>
            <p className="text-[13px] leading-[1.45] text-ink-secondary text-left md:text-center">
              {item.description}
            </p>
          </div>
        )
      })}
    </div>
  )
}
