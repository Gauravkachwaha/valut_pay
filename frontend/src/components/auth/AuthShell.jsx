import { Link } from 'react-router-dom'

const HIGHLIGHTS = [
  { label: 'Instant loan decisions', detail: 'Underwriting in under 60 seconds' },
  { label: 'Bank-grade security', detail: '256-bit encryption on every request' },
  { label: 'Live credit insights', detail: 'Track your score movement daily' },
]

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-cred-black px-4 py-10 sm:px-6 lg:px-10">
      {/* ambient light */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-40 -top-48 h-[28rem] w-[28rem] rounded-full bg-cred-gold opacity-[0.07] blur-3xl" />
        <div className="absolute -bottom-48 -left-40 h-[28rem] w-[28rem] rounded-full bg-cred-purple opacity-[0.07] blur-3xl" />
        <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:56px_56px]" />
      </div>

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_1fr]">
        {/* Brand panel */}
        <section className="hidden flex-col justify-between rounded-3xl border border-cred-border bg-card-gradient p-10 lg:flex lg:h-[38rem]">
          <div>
            <Link to="/" className="inline-flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gold-gradient shadow-cred-gold">
                <span className="text-lg font-black text-black">P</span>
              </span>
              <span className="text-xl font-bold tracking-tight text-white">PayVault</span>
            </Link>

            <h2 className="mt-12 text-4xl font-bold leading-[1.15] tracking-tight text-white">
              Credit that feels
              <span className="block bg-gold-gradient bg-clip-text text-transparent">
                effortlessly premium.
              </span>
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-cred-text-secondary">
              One vault for your loans, EMIs and credit health — engineered for people who
              expect more from their money.
            </p>
          </div>

          <ul className="space-y-4">
            {HIGHLIGHTS.map((item) => (
              <li key={item.label} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-cred-gold/40 bg-cred-gold/10">
                  <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
                    <path
                      d="M5 13l4 4L19 7"
                      stroke="#c9a84c"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">{item.label}</p>
                  <p className="text-xs text-cred-text-muted">{item.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Form card */}
        <section className="mx-auto w-full max-w-[440px]">
          <Link to="/" className="mb-8 flex items-center justify-center gap-3 lg:hidden">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gold-gradient shadow-cred-gold">
              <span className="text-lg font-black text-black">P</span>
            </span>
            <span className="text-xl font-bold tracking-tight text-white">PayVault</span>
          </Link>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-7 shadow-cred-elevated backdrop-blur-xl sm:p-9">
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{title}</h1>
            <p className="mt-2 text-sm text-cred-text-secondary">{subtitle}</p>

            <div className="mt-7">{children}</div>
          </div>

          {footer && (
            <p className="mt-6 text-center text-sm text-cred-text-secondary">{footer}</p>
          )}
        </section>
      </div>
    </div>
  )
}
