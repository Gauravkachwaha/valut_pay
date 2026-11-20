import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BanknotesIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  BoltIcon,
  ChatBubbleLeftRightIcon,
  BellAlertIcon,
  CheckIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline'
import { useAuth } from '../context/AuthContext'
import { ROLES } from '../utils/constants'

function roleDashboard(role) {
  if (role === ROLES.ADMIN) return '/admin/dashboard'
  if (role === ROLES.AGENT) return '/agent/dashboard'
  return '/borrower/dashboard'
}

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How it Works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
]

const FEATURES = [
  {
    Icon: BanknotesIcon,
    title: 'Instant Loan Applications',
    text: 'Pick a purpose, drag the amount, choose a tenure — and see your EMI before you submit.',
  },
  {
    Icon: ChartBarIcon,
    title: 'Live Credit Score',
    text: 'Track your score, understand every factor behind it, and simulate what-if changes.',
  },
  {
    Icon: BoltIcon,
    title: 'One-Tap EMI Payments',
    text: 'Pay any due EMI in four taps with an instant, copyable transaction receipt.',
  },
  {
    Icon: ShieldCheckIcon,
    title: 'Automated Fraud Checks',
    text: 'Every application is screened automatically before it ever reaches an approver.',
  },
  {
    Icon: ChatBubbleLeftRightIcon,
    title: 'AI Assistant',
    text: 'Ask about your loans, EMIs, or score and get answers in the chat, any time.',
  },
  {
    Icon: BellAlertIcon,
    title: 'Smart Notifications',
    text: 'Approvals, due dates, and score movements — surfaced the moment they happen.',
  },
]

const STEPS = [
  { title: 'Create your account', text: 'Sign up in under a minute as a borrower.' },
  { title: 'Apply for a loan', text: 'Choose purpose, amount, and tenure with a live EMI preview.' },
  { title: 'Get reviewed', text: 'Fraud checks run instantly and an approver takes it from there.' },
  { title: 'Repay and grow', text: 'Pay EMIs on time and watch your credit score climb.' },
]

const STATS = [
  { value: '₹450 Cr+', label: 'Loans disbursed' },
  { value: '1.2 L+', label: 'Active borrowers' },
  { value: '4 min', label: 'Average approval' },
  { value: '99.9%', label: 'Platform uptime' },
]

const TESTIMONIALS = [
  {
    quote: 'Applied on a Sunday evening and had an approval before Monday. The EMI preview alone sold me.',
    name: 'Ananya Rao',
    role: 'Small business owner',
  },
  {
    quote: 'The credit score simulator changed how I plan repayments. I finally understand what moves the number.',
    name: 'Rohit Menon',
    role: 'Product designer',
  },
  {
    quote: 'Our approval queue used to be spreadsheets. Now fraud checks and analytics live in one dashboard.',
    name: 'Kavita Shah',
    role: 'Credit operations lead',
  },
]

const PLANS = [
  {
    name: 'Starter',
    price: '₹0',
    period: '/mo',
    text: 'For first-time borrowers finding their footing.',
    features: ['One active loan', 'Monthly credit score', 'EMI reminders', 'AI assistant'],
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '₹499',
    period: '/mo',
    text: 'For borrowers managing multiple commitments.',
    features: [
      'Up to five active loans',
      'Weekly score refresh',
      'What-if score simulation',
      'Priority approvals',
      'Payment history exports',
    ],
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    text: 'For lenders running collections at scale.',
    features: [
      'Unlimited portfolios',
      'Fraud and risk analytics',
      'Custom reporting',
      'Dedicated success manager',
    ],
    highlighted: false,
  },
]

const FAQS = [
  {
    q: 'How long does approval take?',
    a: 'Most applications are screened instantly and reviewed within a few minutes during business hours.',
  },
  {
    q: 'What interest rate should I expect?',
    a: 'Rates start at 12% per annum and are shown alongside your EMI before you submit an application.',
  },
  {
    q: 'Does checking my credit score affect it?',
    a: 'No. Viewing your score and running what-if simulations inside PayVault never affects the score itself.',
  },
  {
    q: 'Can I repay a loan early?',
    a: 'Yes. You can pay any due EMI ahead of schedule from the Pay EMI screen with no hidden charges.',
  },
  {
    q: 'Is my data secure?',
    a: 'Every session is token-authenticated and each application passes automated fraud screening.',
  },
]

export default function LandingPage() {
  const { isAuthenticated, role } = useAuth()
  const [openFaq, setOpenFaq] = useState(0)

  return (
    <div className="min-h-screen bg-cred-black text-cred-text-primary">
      <header className="sticky top-0 z-50 border-b border-cred-border/70 bg-cred-black/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-gradient font-black text-black">
              P
            </span>
            <span className="text-lg font-extrabold tracking-tight">PayVault</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-cred-text-secondary transition hover:text-cred-gold"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to={roleDashboard(role)}
                className="rounded-xl bg-gold-gradient px-4 py-2 text-sm font-bold text-black transition hover:shadow-cred-gold"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-xl border border-cred-border px-4 py-2 text-sm font-semibold text-cred-text-secondary transition hover:border-cred-gold/50 hover:text-cred-text-primary"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="rounded-xl bg-gold-gradient px-4 py-2 text-sm font-bold text-black transition hover:shadow-cred-gold"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-cred-gold/15 blur-[120px]" />
        <div className="pointer-events-none absolute -right-24 top-40 h-96 w-96 rounded-full bg-cred-purple/20 blur-[120px]" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-6 pb-24 pt-20 lg:grid-cols-2 lg:pt-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-cred-gold/30 bg-cred-gold/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-cred-gold">
              <span className="h-1.5 w-1.5 rounded-full bg-cred-gold" />
              Loans, EMIs & credit in one place
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              Convert Financial Stress into{' '}
              <span className="bg-gold-gradient bg-clip-text text-transparent">Solutions</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-cred-text-secondary">
              Apply for loans, manage EMIs, track your credit score, and get AI-powered support —
              all in one platform.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              {isAuthenticated ? (
                <Link
                  to={roleDashboard(role)}
                  className="rounded-xl bg-gold-gradient px-6 py-3.5 text-base font-bold text-black transition hover:scale-[1.02] hover:shadow-cred-gold"
                >
                  Open Dashboard
                </Link>
              ) : (
                <Link
                  to="/register"
                  className="rounded-xl bg-gold-gradient px-6 py-3.5 text-base font-bold text-black transition hover:scale-[1.02] hover:shadow-cred-gold"
                >
                  Create Free Account
                </Link>
              )}
              <a
                href="#how-it-works"
                className="rounded-xl border border-cred-border px-6 py-3.5 text-base font-semibold text-cred-text-secondary transition hover:border-cred-gold/50 hover:text-cred-text-primary"
              >
                See how it works
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-2xl border border-cred-border bg-card-gradient p-7 shadow-cred-elevated">
              <p className="text-xs font-semibold uppercase tracking-wider text-cred-text-muted">
                Credit Score
              </p>
              <div className="mt-3 flex items-end gap-3">
                <span className="text-5xl font-extrabold tracking-tight">782</span>
                <span className="mb-2 rounded-full border border-cred-green/30 bg-cred-green/10 px-2.5 py-1 text-xs font-semibold text-cred-green">
                  +25 pts
                </span>
              </div>
              <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-cred-elevated">
                <div className="h-full w-[80%] rounded-full bg-gold-gradient" />
              </div>
              <div className="mt-2 flex justify-between text-xs text-cred-text-muted">
                <span>300</span>
                <span>900</span>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-cred-border bg-cred-card p-4">
                  <p className="text-xs text-cred-text-muted">Active loan</p>
                  <p className="mt-1 text-lg font-bold">₹4,50,000</p>
                </div>
                <div className="rounded-xl border border-cred-border bg-cred-card p-4">
                  <p className="text-xs text-cred-text-muted">Next EMI</p>
                  <p className="mt-1 text-lg font-bold text-cred-gold">₹10,008</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-cred-border/60 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Everything your loan life needs
          </h2>
          <p className="mt-3 max-w-2xl text-cred-text-secondary">
            One platform for borrowing, repaying, and understanding your credit — with the admin
            tooling to run it all.
          </p>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ Icon, title, text }) => (
              <div
                key={title}
                className="group rounded-2xl border border-cred-border bg-cred-card p-6 shadow-cred-card transition hover:-translate-y-1 hover:border-cred-gold/40"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-cred-gold/25 bg-cred-gold/10 text-cred-gold">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-lg font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-cred-text-secondary">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-cred-border/60 bg-cred-dark py-24">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">How it works</h2>
          <p className="mt-3 text-cred-text-secondary">Four steps from signup to your first EMI.</p>
          <div className="relative mt-14 grid gap-10 md:grid-cols-4">
            <div className="pointer-events-none absolute left-0 right-0 top-6 hidden h-px bg-gradient-to-r from-transparent via-cred-gold/30 to-transparent md:block" />
            {STEPS.map((step, i) => (
              <div key={step.title} className="relative">
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-cred-gold/30 bg-cred-black text-lg font-extrabold text-cred-gold">
                  {i + 1}
                </span>
                <h3 className="mt-5 text-lg font-bold">{step.title}</h3>
                <p className="mt-2 text-sm text-cred-text-secondary">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-cred-border/60 py-14">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 lg:grid-cols-4">
          {STATS.map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="bg-gold-gradient bg-clip-text text-3xl font-extrabold tracking-tight text-transparent sm:text-4xl">
                {value}
              </p>
              <p className="mt-2 text-sm text-cred-text-secondary">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Trusted on both sides of the ledger
          </h2>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {TESTIMONIALS.map(({ quote, name, role: personRole }) => (
              <figure
                key={name}
                className="rounded-2xl border border-cred-border bg-cred-card p-6 shadow-cred-card"
              >
                <p className="text-cred-gold">★★★★★</p>
                <blockquote className="mt-4 text-sm leading-relaxed text-cred-text-secondary">
                  “{quote}”
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-gradient text-sm font-bold text-black">
                    {name.charAt(0)}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">{name}</span>
                    <span className="block text-xs text-cred-text-muted">{personRole}</span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-cred-border/60 bg-cred-dark py-24">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Simple pricing</h2>
          <p className="mt-3 text-cred-text-secondary">
            Start free. Upgrade when your portfolio grows.
          </p>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-7 ${
                  plan.highlighted
                    ? 'border-cred-gold/50 bg-card-gradient shadow-cred-gold'
                    : 'border-cred-border bg-cred-card shadow-cred-card'
                }`}
              >
                {plan.highlighted && (
                  <span className="absolute -top-3 left-7 rounded-full bg-gold-gradient px-3 py-1 text-xs font-bold text-black">
                    Most popular
                  </span>
                )}
                <h3 className="text-lg font-bold">{plan.name}</h3>
                <p className="mt-1 text-sm text-cred-text-secondary">{plan.text}</p>
                <p className="mt-6 flex items-end gap-1">
                  <span className="text-4xl font-extrabold tracking-tight">{plan.price}</span>
                  <span className="mb-1 text-sm text-cred-text-muted">{plan.period}</span>
                </p>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm text-cred-text-secondary">
                      <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-cred-green" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  to={isAuthenticated ? roleDashboard(role) : '/register'}
                  className={`mt-8 block rounded-xl px-5 py-3 text-center text-sm font-bold transition ${
                    plan.highlighted
                      ? 'bg-gold-gradient text-black hover:shadow-cred-gold'
                      : 'border border-cred-border text-cred-text-primary hover:border-cred-gold/50'
                  }`}
                >
                  {isAuthenticated ? 'Go to Dashboard' : 'Get started'}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-cred-border/60 py-24">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Frequently asked questions
          </h2>
          <div className="mt-10 divide-y divide-cred-border overflow-hidden rounded-2xl border border-cred-border bg-cred-card">
            {FAQS.map((faq, i) => {
              const isOpen = openFaq === i
              return (
                <div key={faq.q}>
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? -1 : i)}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition hover:bg-cred-elevated/60"
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm font-semibold">{faq.q}</span>
                    <ChevronDownIcon
                      className={`h-4 w-4 shrink-0 text-cred-gold transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <p className="px-6 pb-5 text-sm leading-relaxed text-cred-text-secondary">
                      {faq.a}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-cred-border/60 bg-cred-dark">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-gradient font-black text-black">
                P
              </span>
              <span className="text-lg font-extrabold tracking-tight">PayVault</span>
            </div>
            <p className="mt-4 text-sm text-cred-text-secondary">
              Loans, EMIs, and credit intelligence in a single dark-mode dashboard.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-cred-text-muted">
              Product
            </p>
            <ul className="mt-4 space-y-2.5 text-sm text-cred-text-secondary">
              <li><a href="#features" className="transition hover:text-cred-gold">Features</a></li>
              <li><a href="#pricing" className="transition hover:text-cred-gold">Pricing</a></li>
              <li><a href="#how-it-works" className="transition hover:text-cred-gold">How it works</a></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-cred-text-muted">
              Company
            </p>
            <ul className="mt-4 space-y-2.5 text-sm text-cred-text-secondary">
              <li><a href="#faq" className="transition hover:text-cred-gold">FAQ</a></li>
              <li><a href="#features" className="transition hover:text-cred-gold">Security</a></li>
              <li><a href="#pricing" className="transition hover:text-cred-gold">Enterprise</a></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-cred-text-muted">
              Account
            </p>
            <ul className="mt-4 space-y-2.5 text-sm text-cred-text-secondary">
              {isAuthenticated ? (
                <li>
                  <Link to={roleDashboard(role)} className="transition hover:text-cred-gold">
                    Dashboard
                  </Link>
                </li>
              ) : (
                <>
                  <li><Link to="/login" className="transition hover:text-cred-gold">Login</Link></li>
                  <li><Link to="/register" className="transition hover:text-cred-gold">Register</Link></li>
                </>
              )}
            </ul>
          </div>
        </div>
        <div className="border-t border-cred-border/60 px-6 py-6">
          <p className="mx-auto max-w-6xl text-xs text-cred-text-muted">
            © {new Date().getFullYear()} PayVault. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
