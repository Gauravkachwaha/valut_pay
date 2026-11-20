import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BanknotesIcon,
  CheckCircleIcon,
  CurrencyRupeeIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ShieldExclamationIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { analyticsService } from '../../services/analyticsService'
import { fraudService } from '../../services/fraudService'
import { loanService } from '../../services/loanService'
import { formatCurrency } from '../../utils/formatCurrency'
import StatGradientCard from '../../components/common/StatGradientCard'
import { SkeletonBlock } from '../../components/common/LoadingSkeleton'
import EmptyState from '../../components/common/EmptyState'

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null)
  const [metrics, setMetrics] = useState(null)
  const [fraud, setFraud] = useState(null)
  const [pendingLoans, setPendingLoans] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [dashRes, metricsRes, fraudRes, pendingRes] = await Promise.allSettled([
          analyticsService.dashboard(),
          analyticsService.metrics(),
          fraudService.stats(),
          loanService.pending(),
        ])

        if (dashRes.status === 'fulfilled') {
          setDashboard(dashRes.value.data)
        } else {
          toast.error('Failed to load dashboard analytics')
        }

        if (metricsRes.status === 'fulfilled') {
          setMetrics(metricsRes.value.data)
        }

        if (fraudRes.status === 'fulfilled') {
          setFraud(fraudRes.value.data)
        }

        if (pendingRes.status === 'fulfilled') {
          const data = pendingRes.value.data
          const list = Array.isArray(data) ? data : data?.loans || data?.content || []
          setPendingLoans(list.slice(0, 5))
        }
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const totalLoans =
    dashboard?.totalLoans ??
    metrics?.totalLoansEver ??
    metrics?.totalLoans ??
    0

  const activeLoans =
    dashboard?.activeLoans ?? metrics?.activeLoans ?? 0

  const totalCollected =
    dashboard?.totalCollected ??
    metrics?.totalCollectedEver ??
    metrics?.totalCollected ??
    0

  const npaLoans =
    dashboard?.npaLoans ??
    dashboard?.npaAccounts ??
    metrics?.npaLoans ??
    metrics?.npaAccounts ??
    0

  const pendingApprovals =
    dashboard?.pendingLoans ??
    dashboard?.pendingLoanCount ??
    metrics?.pendingLoans ??
    pendingLoans.length

  const fraudFlagged =
    fraud?.flagged ??
    fraud?.flaggedCount ??
    fraud?.totalFlagged ??
    dashboard?.fraudFlagged ??
    0

  const stats = [
    {
      label: 'Total Loans',
      value: Number(totalLoans).toLocaleString('en-IN'),
      Icon: BanknotesIcon,
      color: 'blue',
      subtitle: 'All time',
    },
    {
      label: 'Active Loans',
      value: Number(activeLoans).toLocaleString('en-IN'),
      Icon: CheckCircleIcon,
      color: 'emerald',
      subtitle: 'Currently active',
    },
    {
      label: 'Total Collected',
      value: formatCurrency(totalCollected),
      Icon: CurrencyRupeeIcon,
      color: 'purple',
      subtitle: 'Collections',
    },
    {
      label: 'NPA Loans',
      value: Number(npaLoans).toLocaleString('en-IN'),
      Icon: ExclamationTriangleIcon,
      color: 'rose',
      subtitle: 'Non-performing',
    },
    {
      label: 'Pending Approvals',
      value: Number(pendingApprovals).toLocaleString('en-IN'),
      Icon: ClockIcon,
      color: 'orange',
      subtitle: 'Awaiting review',
    },
    {
      label: 'Fraud Flagged',
      value: Number(fraudFlagged).toLocaleString('en-IN'),
      Icon: ShieldExclamationIcon,
      color: 'indigo',
      subtitle: 'Requires attention',
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="mt-1 text-cred-text-secondary">
          Overview of loans, collections, risk, and pending approvals.
        </p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-36" />
            ))
          : stats.map(({ label, value, Icon, color, subtitle }) => (
              <StatGradientCard
                key={label}
                label={label}
                value={value}
                subtitle={subtitle}
                icon={Icon}
                color={color}
              />
            ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-cred-border bg-cred-card shadow-cred-card">
        <div className="flex items-center justify-between border-b border-cred-border px-6 py-4">
          <h2 className="font-semibold text-white">Recent Pending Loans</h2>
          <Link
            to="/admin/loans"
            className="inline-flex items-center gap-1 text-sm font-medium text-cred-gold hover:text-cred-gold"
          >
            View all
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="space-y-3 p-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonBlock key={i} className="h-10" />
              ))}
            </div>
          ) : pendingLoans.length === 0 ? (
            <EmptyState icon="📋" title="No pending loans" description="All caught up for now" />
          ) : (
            <table className="w-full">
              <thead className="bg-cred-elevated">
                <tr>
                  {['User', 'Amount', 'Purpose', 'Action'].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-cred-text-secondary"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-cred-border">
                {pendingLoans.map((loan) => {
                  const userName =
                    loan.userName ||
                    loan.borrowerName ||
                    loan.applicantName ||
                    loan.user?.name ||
                    '—'
                  return (
                    <tr key={loan.id} className="transition-colors hover:bg-cred-elevated">
                      <td className="px-6 py-4 text-sm font-medium text-white">{userName}</td>
                      <td className="px-6 py-4 text-sm text-white">
                        {formatCurrency(loan.amount)}
                      </td>
                      <td className="px-6 py-4 text-sm text-cred-text-secondary">
                        {loan.purpose || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          to="/admin/loans"
                          className="inline-flex items-center gap-1 text-sm font-semibold text-cred-gold hover:text-cred-gold"
                        >
                          Review
                          <ArrowRightIcon className="h-3.5 w-3.5" />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
