import Button from './Button'

export default function EmptyState({
  icon = '📭',
  title = 'Nothing here yet',
  description,
  actionLabel,
  onAction,
  actionHref,
  actionAs: ActionLink,
}) {
  return (
    <div className="py-16 text-center">
      <div className="mb-4 text-6xl opacity-80">{icon}</div>
      <h3 className="mb-2 text-lg font-semibold text-white">{title}</h3>
      {description && <p className="mb-6 text-cred-text-secondary">{description}</p>}
      {actionLabel && onAction && (
        <Button type="button" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
      {actionLabel && actionHref && ActionLink && (
        <ActionLink
          to={actionHref}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold-gradient px-6 py-3 text-sm font-bold tracking-wide text-black transition-all duration-200 hover:scale-[1.02] hover:shadow-cred-gold"
        >
          {actionLabel}
        </ActionLink>
      )}
    </div>
  )
}
