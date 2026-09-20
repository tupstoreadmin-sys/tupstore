import { Link } from 'react-router-dom'
import { cn } from '../../utils/cn'
import { Container } from './Container'

// .mega-menu / .mega-menu-grid / .mega-column / .mega-title / .mega-list —
// DESIGN_SYSTEM.md §5/§18. Visibility is pure CSS (`group-hover`, matching
// the source's `.nav-item-dropdown:hover .mega-menu` — no JS state at all),
// so the parent (Navbar) must render this inside a `group`-classed element.

/**
 * @param {object} props
 * @param {{title: string, links: {label: string, href: string}[]}[]} props.columns
 * @param {string} [props.className]
 */
export function MegaMenu({ columns = [], className }) {
  return (
    <div
      className={cn(
        'invisible absolute inset-x-0 top-full w-full border-b border-hairline bg-white shadow-mega opacity-0 transition-all duration-fast ease-brand translate-y-2',
        'group-hover:visible group-hover:translate-y-0 group-hover:opacity-100',
        className
      )}
    >
      <Container>
        <div className="grid grid-cols-2 gap-8 py-8 md:grid-cols-3 lg:grid-cols-6">
          {columns.map((col) => (
            <div key={col.title} className="flex flex-col">
              <h5 className="mb-4 border-b border-hairline pb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-ink">
                {col.title}
              </h5>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-[13px] font-normal text-ink-secondary transition-all duration-fast ease-brand hover:pl-1 hover:text-ink"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>
    </div>
  )
}
