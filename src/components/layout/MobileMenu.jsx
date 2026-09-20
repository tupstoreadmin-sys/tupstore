import { useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { cn } from '../../utils/cn'
import {
  IconSearch,
  IconFacebook,
  IconInstagram,
  IconYouTube,
  IconWhatsApp,
  IconCart,
  IconChevronDown,
} from './icons'

// .nav-links.mobile-open — DESIGN_SYSTEM.md §5/§18. The source reuses the
// desktop nav element with a class toggle; built here as its own component
// per your component list, matching that same full-screen-below-header
// treatment. Fully controlled — owns no open/close state itself.

/**
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {() => void} [props.onClose]
 * @param {{label: string, href: string}[]} props.links
 * @param {() => void} [props.onSearchClick]
 * @param {() => void} [props.onEnquiryClick]
 * @param {number} [props.enquiryCount]
 * @param {{facebook?: string, instagram?: string, youtube?: string, whatsapp?: string}} [props.socialLinks]
 * @param {string} [props.className]
 */
export function MobileMenu({
  isOpen,
  onClose,
  links = [],
  onSearchClick,
  onEnquiryClick,
  enquiryCount = 0,
  socialLinks = {},
  className,
}) {
  const location = useLocation()
  const [openDropdowns, setOpenDropdowns] = useState({})

  if (!isOpen) return null

  const toggleDropdown = (label) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [label]: !prev[label],
    }))
  }

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

  const facebookUrl = socialLinks.facebook || '#'
  const instagramUrl = socialLinks.instagram || '#'
  const youtubeUrl = socialLinks.youtube || '#'
  const whatsappUrl = socialLinks.whatsapp || 'https://wa.me/917736730041'

  return (
    <div
      className={cn(
        'fixed inset-x-0 top-[60px] z-[100] flex h-[calc(100vh-60px)] flex-col justify-between overflow-y-auto bg-white px-6 pb-8 pt-7 lg:hidden',
        className
      )}
    >
      <nav className="flex flex-col items-center gap-1 w-full">
        {links.map((link) => {
          const active = isLinkActive(link.href)
          if (link.dropdown) {
            const isExpanded = !!openDropdowns[link.label]
            const isAnySubActive = link.dropdown.some((subItem) =>
              isLinkActive(subItem.href)
            )
            const parentActive = active || isAnySubActive

            return (
              <div
                key={link.label}
                className="w-full flex flex-col items-center py-1"
              >
                <button
                  type="button"
                  onClick={() => toggleDropdown(link.label)}
                  className={cn(
                    'flex w-full items-center justify-center gap-1.5 py-2 text-center text-xl transition-colors duration-fast cursor-pointer',
                    parentActive
                      ? 'font-bold text-ink'
                      : 'font-semibold text-ink-secondary hover:text-ink'
                  )}
                  aria-expanded={isExpanded}
                >
                  <span>{link.label}</span>
                  <IconChevronDown
                    className={cn(
                      'h-4 w-4 transition-transform duration-fast text-ink-secondary',
                      isExpanded && 'rotate-180 text-ink'
                    )}
                  />
                </button>
                {isExpanded && (
                  <div className="flex flex-col w-full gap-1 items-center mt-1 mb-1">
                    {link.dropdown.map((subItem) => {
                      const subActive = isLinkActive(subItem.href)
                      return (
                        <Link
                          key={subItem.label}
                          to={subItem.href}
                          onClick={onClose}
                          className={cn(
                            'flex w-full items-center justify-center gap-2 py-2 text-center text-base transition-colors duration-fast rounded-md',
                            subActive
                              ? 'font-bold text-ink bg-surface-subtle'
                              : 'font-medium text-ink-secondary hover:text-ink'
                          )}
                        >
                          {subItem.label}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          }
          return (
            <Link
              key={link.label}
              to={link.href}
              onClick={onClose}
              className={cn(
                'flex w-full items-center justify-center gap-2 py-2 text-center text-xl transition-colors duration-fast',
                active
                  ? 'font-bold text-ink bg-surface-subtle rounded-md'
                  : 'font-semibold text-ink-secondary hover:text-ink'
              )}
            >
              {link.label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom Action & Social Icons Row */}
      <div className="mt-6 pt-5 border-t border-hairline w-full">
        <div className="flex items-center justify-between gap-1.5 max-w-md mx-auto px-1">
          <button
            type="button"
            onClick={() => {
              onClose?.()
              onSearchClick?.()
            }}
            aria-label="Search"
            className="flex h-10 flex-1 min-w-0 items-center justify-center rounded-md bg-surface-subtle text-ink transition-colors hover:bg-neutral-200"
          >
            <IconSearch
              style={{ width: '16px', height: '16px' }}
              className="shrink-0"
            />
          </button>

          <a
            href={facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="flex h-10 flex-1 min-w-0 items-center justify-center rounded-md bg-surface-subtle text-ink transition-colors hover:bg-neutral-200 hover:text-[#1877F2]"
          >
            <IconFacebook
              style={{ width: '16px', height: '16px' }}
              className="shrink-0"
            />
          </a>

          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="flex h-10 flex-1 min-w-0 items-center justify-center rounded-md bg-surface-subtle text-ink transition-colors hover:bg-neutral-200 hover:text-[#E4405F]"
          >
            <IconInstagram
              style={{ width: '16px', height: '16px' }}
              className="shrink-0"
            />
          </a>

          <a
            href={youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="YouTube"
            className="flex h-10 flex-1 min-w-0 items-center justify-center rounded-md bg-surface-subtle text-ink transition-colors hover:bg-neutral-200 hover:text-[#FF0000]"
          >
            <IconYouTube
              style={{ width: '16px', height: '16px' }}
              className="shrink-0"
            />
          </a>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className="flex h-10 flex-1 min-w-0 items-center justify-center rounded-md bg-[#25D366] text-white transition-opacity hover:opacity-90 shadow-sm"
          >
            <IconWhatsApp
              style={{ width: '16px', height: '16px' }}
              className="shrink-0"
            />
          </a>

          <button
            type="button"
            onClick={() => {
              onClose?.()
              onEnquiryClick?.()
            }}
            aria-label="Enquiry list"
            className="relative flex h-10 flex-1 min-w-0 items-center justify-center rounded-md bg-ink text-white transition-opacity hover:opacity-90 shadow-sm"
          >
            <IconCart
              style={{ width: '16px', height: '16px' }}
              className="shrink-0"
            />
            <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#25D366] px-1 text-[9px] font-bold text-white leading-none border border-white">
              {enquiryCount}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
