const THEMES = {
  blue: {
    surface: 'from-cred-gold/[0.12] via-cred-card to-cred-card',
    glow: 'bg-cred-gold/20',
    ring: 'hover:border-cred-gold/40',
    iconBg: 'bg-cred-gold/10 ring-1 ring-cred-gold/20',
    iconText: 'text-cred-gold',
    bar: 'bg-gold-gradient',
  },
  gold: {
    surface: 'from-cred-gold/[0.14] via-cred-card to-cred-card',
    glow: 'bg-cred-gold/25',
    ring: 'hover:border-cred-gold/40',
    iconBg: 'bg-cred-gold/10 ring-1 ring-cred-gold/20',
    iconText: 'text-cred-gold',
    bar: 'bg-gold-gradient',
  },
  emerald: {
    surface: 'from-cred-green/[0.14] via-cred-card to-cred-card',
    glow: 'bg-cred-green/20',
    ring: 'hover:border-cred-green/40',
    iconBg: 'bg-cred-green/10 ring-1 ring-cred-green/20',
    iconText: 'text-cred-green',
    bar: 'bg-cred-green',
  },
  purple: {
    surface: 'from-cred-purple/[0.16] via-cred-card to-cred-card',
    glow: 'bg-cred-purple/25',
    ring: 'hover:border-cred-purple/40',
    iconBg: 'bg-cred-purple/10 ring-1 ring-cred-purple/20',
    iconText: 'text-cred-purple',
    bar: 'bg-cred-purple',
  },
  orange: {
    surface: 'from-cred-red/[0.14] via-cred-card to-cred-card',
    glow: 'bg-cred-red/20',
    ring: 'hover:border-cred-red/40',
    iconBg: 'bg-cred-red/10 ring-1 ring-cred-red/20',
    iconText: 'text-cred-red',
    bar: 'bg-cred-red',
  },
  rose: {
    surface: 'from-cred-red/[0.14] via-cred-card to-cred-card',
    glow: 'bg-cred-red/20',
    ring: 'hover:border-cred-red/40',
    iconBg: 'bg-cred-red/10 ring-1 ring-cred-red/20',
    iconText: 'text-cred-red',
    bar: 'bg-cred-red',
  },
  indigo: {
    surface: 'from-cred-purple/[0.14] via-cred-card to-cred-card',
    glow: 'bg-cred-purple/20',
    ring: 'hover:border-cred-purple/40',
    iconBg: 'bg-cred-purple/10 ring-1 ring-cred-purple/20',
    iconText: 'text-cred-purple',
    bar: 'bg-cred-purple',
  },
}

export default function StatGradientCard({
  label,
  value,
  subtitle,
  icon: Icon,
  color = 'blue',
  badge = 'This month',
}) {
  const theme = THEMES[color] || THEMES.blue

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-cred-border bg-gradient-to-br ${theme.surface} p-6 shadow-cred-card transition-all duration-300 ${theme.ring} hover:-translate-y-0.5`}
    >
      <div
        className={`pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full ${theme.glow} blur-3xl opacity-60 transition-opacity duration-500 group-hover:opacity-100`}
      />
      <span
        className={`absolute inset-x-0 top-0 h-px ${theme.bar} opacity-40 transition-opacity duration-300 group-hover:opacity-90`}
      />

      <div className="relative mb-6 flex items-start justify-between">
        {Icon && (
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl ${theme.iconBg} transition-transform duration-300 group-hover:scale-105`}
          >
            <Icon className={`h-6 w-6 ${theme.iconText}`} />
          </div>
        )}
        {badge && (
          <span className="rounded-lg border border-cred-border/70 bg-cred-elevated/70 px-2 py-1 text-xs text-cred-text-muted backdrop-blur-sm">
            {badge}
          </span>
        )}
      </div>
      <p className="relative mb-1 text-4xl font-black tracking-tight text-white">{value}</p>
      <p className="relative text-sm text-cred-text-secondary">{label}</p>
      {subtitle && (
        <div className="relative mt-4 border-t border-cred-border/70 pt-4">
          <span className="text-xs text-cred-text-muted">{subtitle}</span>
        </div>
      )}
    </div>
  )
}
