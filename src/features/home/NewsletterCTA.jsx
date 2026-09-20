import { cn } from '../../utils/cn'
import { Input, Button } from '../../components/ui'

// Standalone newsletter signup block (distinct from Footer's own newsletter
// form — same underlying UI atoms, different placement/context). Submit is
// a callback prop only; no request is sent from here.

/**
 * @param {object} props
 * @param {string} [props.title]
 * @param {string} [props.description]
 * @param {(email: string) => void} [props.onSubmit]
 * @param {string} [props.className]
 */
export function NewsletterCTA({
  title = 'Stay Updated',
  description,
  onSubmit,
  className,
}) {
  const handleSubmit = (e) => {
    e.preventDefault()
    const email = new FormData(e.currentTarget).get('email')
    onSubmit?.(email)
  }

  return (
    <div
      className={cn(
        'rounded-xl border border-hairline bg-surface-subtle p-10 text-center',
        className
      )}
    >
      <h3 className="mb-2 font-heading text-2xl font-bold text-ink">{title}</h3>
      {description && (
        <p className="mx-auto mb-6 max-w-md text-sm text-ink-secondary">
          {description}
        </p>
      )}
      <form
        onSubmit={handleSubmit}
        className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row"
      >
        <Input
          type="email"
          name="email"
          required
          placeholder="you@example.com"
          aria-label="Email address"
          className="flex-1"
        />
        <Button type="submit" variant="primary">
          Subscribe
        </Button>
      </form>
    </div>
  )
}
