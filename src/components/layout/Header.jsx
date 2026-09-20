import { cn } from '../../utils/cn'
import { Container } from './Container'
import { Navbar } from './Navbar'
import {
  IconSearch,
  IconCart,
  IconMenu,
  IconClose,
  IconFacebook,
  IconInstagram,
  IconYouTube,
  IconWhatsApp,
  IconChevronDown,
} from './icons'

// .site-header / .header-inner / .header-actions / .badge-count —
// DESIGN_SYSTEM.md §5/§18. Fully controlled: takes an `enquiryCount` number
// (not enquiry data) and callback props for search/enquiry/mobile-menu
// clicks — owns no state, no Context, no knowledge of what's actually in
// the enquiry list.

/**
 * @param {object} props
 * @param {React.ReactNode} props.logo
 * @param {{label: string, href: string}[]} [props.navLinks]
 * @param {number} [props.enquiryCount]
 * @param {() => void} [props.onSearchClick]
 * @param {() => void} [props.onEnquiryClick]
 * @param {boolean} [props.mobileMenuOpen]
 * @param {() => void} [props.onMobileMenuToggle]
 * @param {{facebook?: string, instagram?: string, youtube?: string, whatsapp?: string}} [props.socialLinks]
 * @param {string} [props.className]
 */
export function Header({
  logo,
  navLinks = [],
  enquiryCount = 0,
  onSearchClick,
  onEnquiryClick,
  mobileMenuOpen = false,
  onMobileMenuToggle,
  socialLinks = {},
  className,
}) {
  const facebookUrl = socialLinks.facebook || '#'
  const instagramUrl = socialLinks.instagram || '#'
  const youtubeUrl = socialLinks.youtube || '#'
  const whatsappUrl = socialLinks.whatsapp || 'https://wa.me/917736730041'

  return (
    <header
      className={cn(
        'sticky top-0 z-[100] border-b border-hairline bg-header-glass backdrop-blur-xl transition-all duration-fast ease-brand',
        className
      )}
    >
      <Container>
        <div className="flex h-[60px] items-center justify-between lg:h-[76px]">
          <div className="flex items-center gap-3">{logo}</div>

          <Navbar links={navLinks} />

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Search catalogue"
              onClick={onSearchClick}
              className="flex h-9 w-9 items-center justify-center rounded-full text-ink transition-all duration-fast ease-brand hover:scale-[1.08] hover:opacity-70"
            >
              <IconSearch className="h-5 w-5" />
            </button>

            {/* Follow Us Dropdown */}
            <div className="hidden lg:flex group relative py-3 -my-3 items-center">
              <button
                type="button"
                className="flex items-center gap-1 rounded-full pl-0 pr-2.5 py-1 text-xs md:text-sm font-medium tracking-tight text-ink-secondary transition-all duration-fast ease-brand group-hover:bg-surface-subtle group-hover:text-ink select-none cursor-pointer"
              >
                <span>Follow Us</span>
                <IconChevronDown className="h-3 w-3 text-ink-muted transition-transform duration-fast ease-brand group-hover:rotate-180 group-hover:text-ink" />
              </button>

              {/* Dropdown Card */}
              <div className="invisible absolute left-1/2 top-full -translate-x-1/2 pt-1 opacity-0 transition-all duration-smooth ease-brand group-hover:visible group-hover:opacity-100 z-50">
                <div className="w-36 rounded-md border border-hairline bg-white p-1.5 shadow-dropdown flex flex-col gap-0.5">
                  <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="flex items-center gap-2.5 px-3 py-2 rounded text-xs font-medium text-ink-secondary transition-all duration-200 hover:bg-surface-subtle hover:text-[#1877F2] transform translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 delay-0 group-hover:delay-75"
                  >
                    <IconFacebook className="h-4 w-4" />
                    <span>Facebook</span>
                  </a>

                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="flex items-center gap-2.5 px-3 py-2 rounded text-xs font-medium text-ink-secondary transition-all duration-200 hover:bg-surface-subtle hover:text-[#E4405F] transform translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 delay-0 group-hover:delay-150"
                  >
                    <IconInstagram className="h-4 w-4" />
                    <span>Instagram</span>
                  </a>

                  <a
                    href={youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="YouTube"
                    className="flex items-center gap-2.5 px-3 py-2 rounded text-xs font-medium text-ink-secondary transition-all duration-200 hover:bg-surface-subtle hover:text-[#FF0000] transform translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 delay-0 group-hover:delay-200"
                  >
                    <IconYouTube className="h-4 w-4" />
                    <span>YouTube</span>
                  </a>
                </div>
              </div>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Contact on WhatsApp"
              className="hidden lg:flex h-9 w-9 items-center justify-center rounded-full bg-[#25D366] text-white shadow-sm transition-all duration-fast ease-brand hover:bg-[#20ba5a] hover:scale-105"
            >
              <IconWhatsApp className="h-5 w-5" />
            </a>

            <button
              type="button"
              aria-label="View enquiry list"
              onClick={onEnquiryClick}
              className="hidden lg:flex relative h-9 w-9 items-center justify-center rounded-full bg-ink text-white shadow-sm transition-all duration-fast ease-brand hover:scale-105"
            >
              <IconCart className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 flex h-4 min-w-[18px] items-center justify-center rounded-full bg-[#25D366] px-1 text-[10px] font-bold text-white leading-none border border-white">
                {enquiryCount}
              </span>
            </button>

            <button
              type="button"
              aria-label="Toggle navigation menu"
              onClick={onMobileMenuToggle}
              className="flex h-9 w-9 items-center justify-center rounded-full text-ink lg:hidden"
            >
              {mobileMenuOpen ? (
                <IconClose className="h-5 w-5" />
              ) : (
                <IconMenu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </Container>
    </header>
  )
}
