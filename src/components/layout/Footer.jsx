import { Link } from 'react-router-dom'
import { cn } from '../../utils/cn'
import { Container } from './Container'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'

// .site-footer / .footer-grid / .newsletter-form — DESIGN_SYSTEM.md §5/§18.
// The 4-column 2.2fr/1fr/1.2fr/1.5fr ratio is reproduced via grid-cols-12 +
// col-span-5/2/2/3 rather than an arbitrary grid-template-columns value —
// see tailwind.config.js's note on multi-value arbitrary classes.
// Newsletter submit is a callback prop only; this component sends no
// request itself (no business logic, no API calls). newsletterStatus/
// newsletterMessage are likewise caller-owned state, just rendered here —
// see src/App.jsx for the real subscribeToNewsletter() wiring.

/**
 * @param {object} props
 * @param {React.ReactNode} props.brand - logo + description, rendered as-is
 * @param {{title: string, links: {label: string, href: string}[]}[]} [props.linkColumns]
 * @param {(fields: { name: string, email: string }) => void} [props.onNewsletterSubmit]
 * @param {'idle'|'submitting'|'success'|'duplicate'|'error'} [props.newsletterStatus]
 * @param {string} [props.newsletterMessage]
 * @param {{label: string, href: string, icon: React.ReactNode}[]} [props.socialLinks]
 * @param {string} [props.bottomText]
 * @param {string} [props.className]
 */
export function Footer({
  brand,
  linkColumns = [],
  onNewsletterSubmit,
  newsletterStatus = 'idle',
  newsletterMessage,
  socialLinks = [],
  bottomText,
  className,
}) {
  const submitting = newsletterStatus === 'submitting'

  const handleSubmit = (e) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const name = formData.get('name')
    const email = formData.get('email')
    onNewsletterSubmit?.({ name, email })
  }

  return (
    <footer
      className={cn(
        'border-t border-hairline bg-white pb-5 pt-12 md:pt-20',
        className
      )}
    >
      <Container>
        <div className="mb-12 md:mb-16 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            {brand}
            {onNewsletterSubmit && (
              <form
                onSubmit={handleSubmit}
                className="mt-6 flex max-w-[340px] flex-col gap-3"
              >
                <div>
                  <h5 className="mb-1 text-[11px] md:text-xs font-bold uppercase tracking-[0.08em] text-ink">
                    SIGN UP FOR UPDATES
                  </h5>
                </div>
                <Input
                  type="text"
                  name="name"
                  placeholder="Your name"
                  aria-label="Your name"
                  disabled={submitting}
                  className="bg-surface-faint text-[13.5px] rounded-md"
                />
                <Input
                  type="email"
                  name="email"
                  required
                  placeholder="Enter your email address"
                  aria-label="Email address"
                  disabled={submitting}
                  className="bg-surface-faint text-[13.5px] rounded-md"
                />
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  disabled={submitting}
                  className="rounded-md py-3 font-semibold bg-ink text-white hover:bg-black"
                >
                  {submitting ? 'Subscribing…' : 'Subscribe'}
                </Button>
                {newsletterMessage && (
                  <p
                    className={cn(
                      'text-xs',
                      newsletterStatus === 'success'
                        ? 'text-wa'
                        : newsletterStatus === 'duplicate'
                          ? 'text-ink-secondary'
                          : 'text-error'
                    )}
                  >
                    {newsletterMessage}
                  </p>
                )}
              </form>
            )}
          </div>

          {linkColumns.map((col, i) => (
            <div
              key={col.title}
              className={
                i === linkColumns.length - 1 ? 'lg:col-span-3' : 'lg:col-span-2'
              }
            >
              <h5 className="mb-[18px] text-[11px] md:text-xs font-bold uppercase tracking-[0.08em] text-ink">
                {col.title}
              </h5>
              {col.storeInfo ? (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-2.5 text-[12.5px] md:text-sm text-ink-secondary">
                    {col.storeInfo.map((item) => (
                      <p key={item.label} className="leading-snug">
                        <strong className="font-semibold text-ink">
                          {item.label}
                        </strong>{' '}
                        {item.value}
                      </p>
                    ))}
                  </div>
                  {socialLinks.length > 0 && (
                    <div className="mt-4">
                      <h6 className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-ink">
                        FOLLOW US
                      </h6>
                      <div className="flex items-center gap-2">
                        {socialLinks.map((social) => (
                          <a
                            key={social.label}
                            href={social.href}
                            aria-label={social.label}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-hairline text-ink transition-all duration-fast ease-brand hover:bg-surface-subtle hover:scale-105"
                          >
                            {social.icon}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <ul className="flex flex-col gap-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      {link.href.startsWith('http') ||
                      link.href.startsWith('mailto:') ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[13px] md:text-sm font-normal text-ink-secondary transition-colors duration-fast ease-brand hover:text-ink"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          to={link.href}
                          className="text-[13px] md:text-sm font-normal text-ink-secondary transition-colors duration-fast ease-brand hover:text-ink"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-hairline pt-5 text-xs md:text-[13px] text-ink-muted text-center sm:flex-row sm:text-left">
          <span>{bottomText}</span>
        </div>
      </Container>
    </footer>
  )
}
