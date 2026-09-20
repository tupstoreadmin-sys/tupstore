import { cn } from '../../utils/cn'

// .drawer-empty / .drawer-empty-icon — DESIGN_SYSTEM.md, confirmed against
// reference/src/style.css. Source shows this pattern once (empty enquiry
// drawer); built generically here since Shop's empty-results state likely
// needs the same treatment (flagged as unconfirmed in COMPONENT_INVENTORY.md).

/**
 * @param {object} props
 * @param {React.ReactNode} [props.icon] - e.g. an emoji or small SVG
 * @param {string} props.title
 * @param {string} [props.description]
 * @param {React.ReactNode} [props.action] - e.g. a <Button>
 * @param {string} [props.className]
 */
export function EmptyState({ icon, title, description, action, className }) {
  return (
    <div className={cn('py-12 text-center text-ink-muted', className)}>
      {icon && <div className="mb-4 text-5xl">{icon}</div>}
      <p className="mb-1.5 text-base font-semibold">{title}</p>
      {description && <p className="text-[13.5px]">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
