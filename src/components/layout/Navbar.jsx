import { useLocation, Link } from 'react-router-dom'
import { cn } from '../../utils/cn'
import { MegaMenu } from './MegaMenu'
import { IconChevronDown } from './icons'

// .nav-links / .nav-link / .simple-dropdown — DESIGN_SYSTEM.md §5/§18.
// Desktop only (hidden md:flex) — mobile navigation is MobileMenu, a
// separate component. Dropdown/mega-menu visibility is pure CSS `group-hover`,
// no state.

/**
 * @param {object} props
 * @param {{label: string, href: string,
 *   megaMenu?: {title: string, links: {label: string, href: string}[]}[],
 *   dropdown?: {label: string, href: string}[]}[]} props.links
 * @param {string} [props.className]
 */
export function Navbar({ links = [], className }) {
  const location = useLocation()

  const isLinkActive = (href) => {
    if (href === '/') {
      return location.pathname === '/'
    }
    if (href === '/shop') {
      return (
        location.pathname === '/shop' ||
        location.pathname.startsWith('/shop/') ||
        location.pathname.startsWith('/product/')
      )
    }
    return (
      location.pathname === href || location.pathname.startsWith(`${href}/`)
    )
  }

  return (
    <nav className={cn('hidden items-center gap-8 lg:flex', className)}>
      {links.map((link) => {
        const hasSubmenu = link.megaMenu || link.dropdown
        const active = isLinkActive(link.href)

        return (
          <div
            key={link.label}
            className={cn(
              link.dropdown && 'relative',
              hasSubmenu && 'group py-4 -my-4'
            )}
          >
            <Link
              to={link.href}
              className={cn(
                'flex items-center gap-1 text-sm transition-all duration-fast ease-brand hover:text-ink',
                active ? 'font-bold text-ink' : 'font-medium text-ink-secondary'
              )}
            >
              {link.label}
              {hasSubmenu && (
                <IconChevronDown className="h-2.5 w-2.5 transition-transform duration-fast group-hover:rotate-180" />
              )}
            </Link>

            {link.megaMenu && <MegaMenu columns={link.megaMenu} />}

            {link.dropdown && (
              <div className="invisible absolute left-1/2 top-full -translate-x-1/2 translate-y-2 rounded-md border border-hairline bg-white py-1 opacity-0 shadow-dropdown transition-all duration-fast ease-brand group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 min-w-[180px] z-50">
                <ul className="flex flex-col">
                  {link.dropdown.map((item) => (
                    <li key={item.label}>
                      <Link
                        to={item.href}
                        className="block px-5 py-2.5 text-left text-sm font-medium text-ink-secondary transition-all duration-fast ease-brand hover:bg-surface-subtle hover:text-ink whitespace-nowrap"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )
      })}
    </nav>
  )
}
