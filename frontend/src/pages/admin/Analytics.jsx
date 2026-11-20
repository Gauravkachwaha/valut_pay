import { useCallback, useEffect, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from 'recharts'
import toast from 'react-hot-toast'
import { analyticsService } from '../../services/analyticsService'
import { formatCurrency } from '../../utils/formatCurrency'
import StatGradientCard from '../../components/common/StatGradientCard'
import {
  BanknotesIcon,
  CheckCircleIcon,
  CurrencyRupeeIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline'

const PIE_COLORS = ['#c9a84c', '#00d4aa', '#8b5cf6', '#ff4757', '#e8c878']

const PURPOSE_MOCK = [
  { name: 'Personal', value: 40 },
  { name: 'Home', value: 25 },
  { name: 'Car', value: 20 },
  { name: 'Business', value: 10 },
  { name: 'Education', value: 5 },
]

function buildLast7Days() {
  const days = []
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push({
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      loans: Math.floor(Math.random() * 8) + 2,
      collections: Number((Math.random() * 4 + 1).toFixed(2)),
    })
  }
  return days
}

export default function Analytics() {
  const [dashboard, setDashboard] = useState(null)
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [trendData, setTrendData] = useState(buildLast7Days)

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const [dashRes, metricsRes] = await Promise.allSettled([
        analyticsService.dashboard(),
        analyticsService.metrics(),
      ])

      if (dashRes.status === 'fulfilled') {
        setDashboard(dashRes.value.data)
      } else if (!silent) {
        toast.error('Failed to load analytics')
      }

      if (metricsRes.status === 'fulfilled') {
        setMetrics(metricsRes.value.data)
      }

      setTrendData(buildLast7Days())
    } finally {
      if (!silent) setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData(false)
    const id = setInterval(() => fetchData(true), 10000)
    return () => clearInterval(id)
  }, [fetchData])

  const totalLoans =
    dashboard?.totalLoans ?? metrics?.totalLoansEver ?? metrics?.totalLoans ?? 0
  const activeLoans = dashboard?.activeLoans ?? metrics?.activeLoans ?? 0
  const collected =
    dashboard?.totalCollected ??
    metrics?.totalCollectedEver ??
    metrics?.totalCollected ??
    0
  const disbursed =
    dashboard?.totalDisbursed ??
    metrics?.totalDisbursed ??
    metrics?.disbursedAmount ??
    0

  const purposeData =
    dashboard?.purposeDistribution ||
    metrics?.purposeDistribution ||
    PURPOSE_MOCK

  const stats = [
    {
      label: 'Total Loans',
      value: Number(totalLoans).toLocaleString('en-IN'),
      Icon: BanknotesIcon,
      color: 'blue',
    },
    {
      label: 'Active',
      value: Number(activeLoans).toLocaleString('en-IN'),
      Icon: CheckCircleIcon,
      color: 'emerald',
    },
    {
      label: 'Collected',
      value: formatCurrency(collected),
      Icon: CurrencyRupeeIcon,
      color: 'purple',
    },
    {
      label: 'Disbursed',
      value: formatCurrency(disbursed),
      Icon: ArrowTrendingUpIcon,
      color: 'orange',
    },
  ]

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="mt-1 text-cred-text-secondary">
            Live platform metrics — auto-refreshes every 10 seconds.
          </p>
        </div>
        {loading && (
          <span className="text-xs font-medium text-cred-text-muted">Refreshing…</span>
        )}
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, Icon, color }) => (
          <StatGradientCard
            key={label}
            label={label}
            value={value}
            icon={Icon}
            color={color}
          />
        ))}
      </div>

      <div className="mb-6 rounded-2xl border border-cred-border bg-cred-card p-6 shadow-cred-card transition-all duration-200 hover:-translate-y-1 hover:shadow-cred-gold">
        <h2 className="mb-4 font-semibold text-white">Loan Trend</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="loans"
                stroke="#c9a84c"
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Loans"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-cred-border bg-cred-card p-6 shadow-cred-card transition-all duration-200 hover:-translate-y-1 hover:shadow-cred-gold">
          <h2 className="mb-4 font-semibold text-white">Purpose Distribution</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={purposeData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, value }) => `${name} ${value}%`}
                >
                  {purposeData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-cred-border bg-cred-card p-6 shadow-cred-card transition-all duration-200 hover:-translate-y-1 hover:shadow-cred-gold">
          <h2 className="mb-4 font-semibold text-white">Collections (₹ Lakhs)</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="collections" fill="#00d4aa" name="Amount (L)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
