import { useEffect, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import {
  BanknotesIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  BellIcon,
} from '@heroicons/react/24/outline'
import { useAuth } from '../../context/AuthContext'
import { loanService } from '../../services/loanService'
import { notificationService } from '../../services/notificationService'
import { creditService } from '../../services/creditService'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate, timeAgo } from '../../utils/formatDate'
import StatGradientCard from '../../components/common/StatGradientCard'
import StatusBadge from '../../components/common/StatusBadge'
import EmptyState from '../../components/common/EmptyState'
import EmiTimeline from '../../components/common/EmiTimeline'
import { SkeletonBlock } from '../../components/common/LoadingSkeleton'

const QUICK_ACTIONS = [
  {
    label: 'Apply New Loan',
    description: 'Fresh credit in minutes',
    to: '/borrower/loans/apply',
    primary: true,
  },
  { label: 'Pay EMI', description: 'Settle your next instalment', to: '/borrower/pay-emi' },
  { label: 'View Score', description: 'Track your credit health', to: '/borrower/credit' },
  { label: 'Ask AI', description: 'Instant answers, 24/7', action: 'chat' },
]

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 17) return 'Good Afternoon'
  return 'Good Evening'
}

export default function BorrowerDashboard() {
  const { user } = useAuth()
  const { openChat } = useOutletContext() || {}
  const [loans, setLoans] = useState([])
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [credit, setCredit] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [loansRes, unreadRes, creditRes, notifRes] = await Promise.allSettled([
          loanService.myLoans(),
          notificationService.unreadCount(),
          creditService.getScore(),
          notificationService.getAll(),
        ])

        if (loansRes.status === 'fulfilled') {
          setLoans(loansRes.value.data || [])
        }
        if (unreadRes.status === 'fulfilled') {
          setUnreadCount(unreadRes.value.data?.unreadCount ?? 0)
        }
        if (creditRes.status === 'fulfilled') {
          setCredit(creditRes.value.data)
        }
        if (notifRes.status === 'fulfilled') {
          setNotifications((notifRes.value.data || []).slice(0, 3))
        }
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const activeLoans = loans.filter((l) =>
    ['ACTIVE', 'APPROVED', 'SUBMITTED'].includes(l.status)
  ).length

  const nextEmiLoan = loans.find((l) => l.status === 'ACTIVE' || l.status === 'APPROVED')
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-white">
          {getGreeting()}, {user?.name || 'there'}
        </h2>
        <p className="mt-1 text-cred-text-secondary">{today}</p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-40" />
          ))
        ) : (
          <>
            <StatGradientCard
              label="Active Loans"
              value={activeLoans}
              subtitle="Total portfolio"
              icon={BanknotesIcon}
              color="gold"
            />
            <StatGradientCard
              label="Next EMI"
              value={nextEmiLoan ? formatCurrency(nextEmiLoan.monthlyEmi) : '—'}
              subtitle={
                nextEmiLoan?.nextDueDate
                  ? `Due ${formatDate(nextEmiLoan.nextDueDate)}`
                  : nextEmiLoan
                    ? 'Upcoming'
                    : 'No upcoming EMI'
              }
              icon={CalendarDaysIcon}
              color="emerald"
            />
            <StatGradientCard
              label="Credit Score"
              value={credit?.score ?? '—'}
              subtitle={credit?.category || 'Not available'}
              icon={ChartBarIcon}
              color="purple"
            />
            <StatGradientCard
              label="Notifications"
              value={unreadCount}
              subtitle="Unread alerts"
              icon={BellIcon}
              color="rose"
            />
          </>
        )}
      </div>

      <div className="mb-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {QUICK_ACTIONS.map((item) => {
          const classes = item.primary
            ? 'group relative overflow-hidden rounded-2xl bg-gold-gradient p-5 text-left text-black transition-all duration-300 hover:-translate-y-0.5 hover:shadow-cred-gold'
            : 'group relative overflow-hidden rounded-2xl border border-cred-border bg-gradient-to-br from-cred-elevated to-cred-card p-5 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-cred-gold/40'

          const content = (
            <>
              <span className="absolute -right-6 -top-8 h-20 w-20 rounded-full bg-cred-gold/10 blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <p
                className={`relative text-sm font-bold tracking-wide ${
                  item.primary ? 'text-black' : 'text-white'
                }`}
              >
                {item.label}
              </p>
              <p
                className={`relative mt-1 text-xs ${
                  item.primary ? 'text-black/70' : 'text-cred-text-muted'
                }`}
              >
                {item.description}
              </p>
              <span
                className={`relative mt-4 inline-flex items-center gap-1 text-xs font-semibold ${
                  item.primary ? 'text-black' : 'text-cred-gold'
                }`}
              >
                Continue
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </span>
            </>
          )

          if (item.action === 'chat') {
            return (
              <button key={item.label} type="button" onClick={openChat} className={classes}>
                {content}
              </button>
            )
          }

          return (
            <Link key={item.label} to={item.to} className={classes}>
              {content}
            </Link>
          )
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="overflow-hidden rounded-2xl border border-cred-border bg-cred-card shadow-cred-card xl:col-span-2">
          <div className="flex items-center justify-between border-b border-cred-border px-6 py-5">
            <h3 className="font-semibold text-white">Recent Loans</h3>
            <Link to="/borrower/loans" className="text-sm text-cred-gold hover:underline">
              View all →
            </Link>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="space-y-3 p-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <SkeletonBlock key={i} className="h-10" />
                ))}
              </div>
            ) : loans.length === 0 ? (
              <EmptyState
                title="No loans yet"
                description="Apply for your first loan to get started"
                actionLabel="+ Apply Now"
                actionHref="/borrower/loans/apply"
                actionAs={Link}
              />
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-cred-border">
                    {['Purpose', 'Amount', 'EMI', 'Status', 'Date'].map((h) => (
                      <th
                        key={h}
                        className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-cred-text-muted"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loans.slice(0, 5).map((loan) => (
                    <tr
                      key={loan.id}
                      className="border-b border-cred-border transition-colors last:border-0 hover:bg-cred-elevated"
                    >
                      <td className="px-6 py-4 text-sm text-white">{loan.purpose || '—'}</td>
                      <td className="px-6 py-4 text-sm font-extrabold text-white">
                        {formatCurrency(loan.amount)}
                      </td>
                      <td className="px-6 py-4 text-sm text-white">
                        {formatCurrency(loan.monthlyEmi)}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={loan.status} />
                      </td>
                      <td className="px-6 py-4 text-sm text-cred-text-secondary">
                        {formatDate(loan.appliedAt || loan.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <EmiTimeline
            loan={nextEmiLoan}
            loading={loading}
            actionSlot={
              <Link to="/borrower/pay-emi" className="text-sm text-cred-gold hover:underline">
                Pay now →
              </Link>
            }
          />

          <div className="overflow-hidden rounded-2xl border border-cred-border bg-cred-card shadow-cred-card">
          <div className="flex items-center justify-between border-b border-cred-border px-6 py-5">
            <h3 className="font-semibold text-white">Notifications</h3>
            <Link to="/borrower/notifications" className="text-sm text-cred-gold hover:underline">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-cred-border">
            {loading ? (
              <div className="space-y-3 p-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <SkeletonBlock key={i} className="h-14" />
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <p className="p-6 text-sm text-cred-text-secondary">No notifications yet.</p>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className="flex gap-3 px-6 py-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cred-gold/10 text-sm">
                    🔔
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">{n.title}</p>
                    <p className="truncate text-xs text-cred-text-secondary">{n.message}</p>
                    <p className="mt-0.5 text-xs text-cred-text-muted">{timeAgo(n.createdAt)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}
