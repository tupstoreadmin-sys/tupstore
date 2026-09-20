import { Link } from 'react-router-dom'
import { cn } from '../../utils/cn'
import { Container } from './Container'

// .breadcrumb-bar / .breadcrumb — DESIGN_SYSTEM.md §5, the standardized
// pattern (confirmed against reference/src/main.js — an older black
// .breadcrumb-nav variant also exists in style.css but was superseded per
// the reference repo's own commit history; not used here).

/**
 * @param {object} props
 * @param {{label: string, href?: string}[]} props.items - omit `href` on the
 *   current/last item
 * @param {string} [props.className]
 */
export function Breadcrumb({ items = [], className }) {
  return (
    <div
      className={cn(
        'border-b border-hairline bg-surface-faint py-3',
        className
      )}
    >
      <Container>
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-2 text-[13px] text-ink-secondary min-w-0"
        >
          {items.map((item, index) => (
            <span key={item.label} className="flex items-center gap-2">
              {index > 0 && <span aria-hidden="true">/</span>}
              {item.href ? (
                <Link
                  to={item.href}
                  className="transition-colors duration-fast ease-brand hover:text-ink"
                >
                  {item.label}
                </Link>
              ) : (
                <span aria-current="page">{item.label}</span>
              )}
            </span>
          ))}
        </nav>
      </Container>
    </div>
  )
}
