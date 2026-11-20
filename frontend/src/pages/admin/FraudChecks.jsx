import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import {
  ShieldCheckIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  NoSymbolIcon,
} from '@heroicons/react/24/outline'
import { fraudService } from '../../services/fraudService'
import StatGradientCard from '../../components/common/StatGradientCard'
import { SkeletonBlock } from '../../components/common/LoadingSkeleton'

export default function FraudChecks() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      try {
        const { data } = await fraudService.stats()
        setStats(data)
      } catch {
        toast.error('Failed to load fraud stats')
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const total =
    stats?.totalChecks ?? stats?.total ?? stats?.totalCount ?? 0
  const passed =
    stats?.passed ?? stats?.passedCount ?? stats?.todayPassed ?? 0
  const flagged =
    stats?.flagged ?? stats?.flaggedCount ?? stats?.todayFlagged ?? 0
  const blocked =
    stats?.blocked ?? stats?.blockedCount ?? stats?.todayBlocked ?? 0

  const todayPassed = stats?.todayPassed ?? passed
  const todayFlagged = stats?.todayFlagged ?? flagged
  const todayBlocked = stats?.todayBlocked ?? blocked
  const todayTotal =
    stats?.todayTotal ?? todayPassed + todayFlagged + todayBlocked

  const risk = stats?.riskDistribution || stats?.risk || {}
  const low = risk.LOW ?? risk.low ?? 83
  const medium = risk.MEDIUM ?? risk.medium ?? 17
  const high = risk.HIGH ?? risk.high ?? 0

  const cards = [
    {
      label: 'Total Checks',
      value: Number(total).toLocaleString('en-IN'),
      Icon: ShieldCheckIcon,
      color: 'blue',
    },
    {
      label: 'Passed',
      value: Number(passed).toLocaleString('en-IN'),
      Icon: CheckCircleIcon,
      color: 'emerald',
    },
    {
      label: 'Flagged',
      value: Number(flagged).toLocaleString('en-IN'),
      Icon: ExclamationTriangleIcon,
      color: 'orange',
    },
    {
      label: 'Blocked',
      value: Number(blocked).toLocaleString('en-IN'),
      Icon: NoSymbolIcon,
      color: 'rose',
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Fraud Checks</h1>
        <p className="mt-1 text-cred-text-secondary">
          Fraud checks run automatically on every loan application.
        </p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-36" />
            ))
          : cards.map(({ label, value, Icon, color }) => (
              <StatGradientCard
                key={label}
                label={label}
                value={value}
                icon={Icon}
                color={color}
              />
            ))}
      </div>

      <div className="mb-6 rounded-xl border border-cred-gold/30 bg-cred-gold/10 px-4 py-3 text-sm text-cred-gold">
        Fraud checks run automatically on every loan application
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-cred-border bg-cred-card p-6 shadow-cred-card">
          <h2 className="font-semibold text-white">Today&apos;s Fraud Summary</h2>
          {loading ? (
            <div className="mt-4 space-y-2">
              <SkeletonBlock className="h-6" />
              <SkeletonBlock className="h-6" />
              <SkeletonBlock className="h-6" />
            </div>
          ) : (
            <ul className="mt-4 space-y-2 text-sm text-cred-text-secondary">
              <li>✅ Passed: {todayPassed}</li>
              <li>⚠️ Flagged: {todayFlagged}</li>
              <li>🚫 Blocked: {todayBlocked}</li>
              <li className="pt-2 font-medium">Total: {todayTotal} checks</li>
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-cred-border bg-cred-card p-6 shadow-cred-card">
          <h2 className="font-semibold text-white">Risk Distribution</h2>
          {loading ? (
            <div className="mt-4 space-y-3">
              <SkeletonBlock className="h-8" />
              <SkeletonBlock className="h-8" />
              <SkeletonBlock className="h-8" />
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              <RiskBar label="LOW" pct={low} color="bg-cred-green" />
              <RiskBar label="MEDIUM" pct={medium} color="bg-amber-500" />
              <RiskBar label="HIGH" pct={high} color="bg-red-500" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function RiskBar({ label, pct, color }) {
  const value = Math.min(100, Math.max(0, Number(pct) || 0))
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="font-medium text-cred-text-secondary">{label}</span>
        <span className="text-cred-text-secondary">{value}%</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-cred-elevated">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}
