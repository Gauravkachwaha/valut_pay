import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { creditService } from '../../services/creditService'
import { formatCurrency } from '../../utils/formatCurrency'
import Button from '../../components/common/Button'
import { SkeletonBlock } from '../../components/common/LoadingSkeleton'

const SIMULATIONS = [
  {
    action: 'ON_TIME_PAYMENT',
    label: 'On-time Payment',
    emoji: '✅',
    delta: '+15 pts',
  },
  {
    action: 'MISSED_PAYMENT',
    label: 'Missed Payment',
    emoji: '❌',
    delta: '-30 pts',
  },
  {
    action: 'CLOSE_LOAN',
    label: 'Close a Loan',
    emoji: '🔒',
    delta: '+25 pts',
  },
]

function scoreColor(score) {
  if (score >= 750) return { bar: 'bg-cred-green', badge: 'bg-cred-green/10 text-cred-green border border-cred-green/30' }
  if (score >= 650) return { bar: 'bg-yellow-500', badge: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30' }
  if (score >= 550) return { bar: 'bg-orange-500', badge: 'bg-orange-500/10 text-orange-400 border border-orange-500/30' }
  return { bar: 'bg-cred-red', badge: 'bg-cred-red/10 text-cred-red border border-cred-red/30' }
}


function scorePosition(score) {
  const clamped = Math.min(900, Math.max(300, Number(score) || 300))
  return ((clamped - 300) / 600) * 100
}

export default function CreditScore() {
  const [credit, setCredit] = useState(null)
  const [loading, setLoading] = useState(true)
  const [simulating, setSimulating] = useState(null)
  const [simResult, setSimResult] = useState(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        let { data } = await creditService.getScore()
        if (data == null || (typeof data === 'object' && data.score == null && data.creditScore == null)) {
          await creditService.initialize()
          ;({ data } = await creditService.getScore())
        }
        setCredit(data)
      } catch {
        try {
          await creditService.initialize()
          const { data } = await creditService.getScore()
          setCredit(data)
        } catch {
          toast.error('Failed to load credit score')
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const score = credit?.score ?? credit?.creditScore ?? 0
  const category = credit?.category ?? credit?.scoreCategory ?? 'N/A'
  const maxEligible = credit?.maxEligible ?? credit?.maxEligibleAmount ?? credit?.eligibleAmount
  const approvalChance = credit?.approvalChance ?? credit?.approvalProbability ?? '—'
  const tips = credit?.improvementTips || credit?.tips || credit?.suggestions || []
  const colors = scoreColor(score)

  const handleSimulate = async (action) => {
    setSimulating(action)
    setSimResult(null)
    try {
      const { data } = await creditService.simulate({ action })
      const before = data?.previousScore ?? data?.oldScore ?? score
      const after = data?.newScore ?? data?.simulatedScore ?? data?.score ?? before
      const delta = after - before
      const sign = delta >= 0 ? '+' : ''
      setSimResult({ before, after, delta })
      toast.success(`Score: ${before} → ${after} (${sign}${delta}) 📈`)
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.response?.data?.error ||
          'Simulation failed'
      )
    } finally {
      setSimulating(null)
    }
  }

  if (loading) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Credit Score</h1>
          <p className="mt-1 text-cred-text-secondary">Track your score and explore what-if scenarios.</p>
        </div>
        <div className="mx-auto max-w-2xl space-y-4">
          <SkeletonBlock className="mx-auto h-40 w-full max-w-xl" />
          <div className="grid gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-24" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const rawFactors = credit?.factors || credit?.scoreFactors || {}
  const factorValue = (...keys) => {
    for (const k of keys) {
      const v = Array.isArray(rawFactors)
        ? rawFactors.find((f) => (f.name || f.factor || '').toLowerCase() === k.toLowerCase())
            ?.value
        : rawFactors?.[k]
      if (v != null && !Number.isNaN(Number(v))) return Math.max(0, Math.min(100, Number(v)))
    }
    return null
  }

  const factors = [
    {
      label: 'Payment History',
      hint: 'On-time repayments',
      value: factorValue('paymentHistory', 'payment_history'),
      tone: 'from-cred-green to-emerald-300',
    },
    {
      label: 'Credit Burden',
      hint: 'Outstanding vs capacity',
      value: factorValue('creditBurden', 'burden', 'creditUtilization', 'utilization'),
      tone: 'from-cred-gold to-cred-gold-light',
    },
    {
      label: 'Active Loans',
      hint: 'Number of open loans',
      value: factorValue('activeLoans', 'loans', 'loanCount'),
      tone: 'from-cred-purple to-indigo-300',
    },
    {
      label: 'Account Age',
      hint: 'Length of credit history',
      value: factorValue('accountAge', 'age', 'creditAge'),
      tone: 'from-sky-400 to-cyan-300',
    },
  ]

  const pct = scorePosition(score)
  const arcLength = 251.2
  const arcOffset = arcLength - (pct / 100) * arcLength

  return (
    <div>
      <div className="mb-6 lg:mb-8">
        <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">Credit Score</h1>
        <p className="mt-1 text-sm text-cred-text-secondary">
          Track your score, understand the drivers and explore what-if scenarios.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        {/* Gauge */}
        <div className="relative overflow-hidden rounded-3xl border border-cred-border bg-card-gradient p-6 text-center shadow-cred-card sm:p-8">
          <div className="pointer-events-none absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-cred-gold opacity-[0.09] blur-3xl" />
          <p className="relative text-[11px] font-semibold uppercase tracking-[0.2em] text-cred-text-muted">
            Your PayVault Score
          </p>

          <div className="relative mx-auto mt-4 w-full max-w-[280px]">
            <svg viewBox="0 0 180 108" className="w-full">
              <defs>
                <linearGradient id="scoreArc" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#ff4757" />
                  <stop offset="50%" stopColor="#c9a84c" />
                  <stop offset="100%" stopColor="#00d4aa" />
                </linearGradient>
              </defs>
              <path
                d="M 10 98 A 80 80 0 0 1 170 98"
                fill="none"
                stroke="#2a2a2a"
                strokeWidth="12"
                strokeLinecap="round"
              />
              <path
                d="M 10 98 A 80 80 0 0 1 170 98"
                fill="none"
                stroke="url(#scoreArc)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={arcLength}
                strokeDashoffset={arcOffset}
                style={{ transition: 'stroke-dashoffset 900ms cubic-bezier(0.22,1,0.36,1)' }}
              />
            </svg>
            <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">
              <p className="text-5xl font-black leading-none tracking-tight text-white sm:text-6xl">
                {score || '—'}
              </p>
              <span
                className={`mt-3 inline-block rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] ${colors.badge}`}
              >
                {category}
              </span>
            </div>
          </div>

          <div className="relative mt-5 flex justify-between px-2 text-xs text-cred-text-muted">
            <span>300</span>
            <span>900</span>
          </div>

          <div className="relative mt-6 grid grid-cols-2 gap-3 border-t border-cred-border/70 pt-5 text-left">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-cred-text-muted">
                Max eligible
              </p>
              <p className="mt-1 text-sm font-bold text-white">
                {maxEligible != null ? formatCurrency(maxEligible) : '—'}
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-cred-text-muted">
                Approval chance
              </p>
              <p className="mt-1 text-sm font-bold text-cred-green">{approvalChance}</p>
            </div>
          </div>
        </div>

        {/* Factors */}
        <div className="rounded-3xl border border-cred-border bg-cred-card p-6 shadow-cred-card sm:p-7">
          <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-white">
            Score Factors
          </h2>
          <p className="mt-1 text-xs text-cred-text-muted">
            What is moving your score right now.
          </p>

          <div className="mt-6 space-y-5">
            {factors.map((f) => (
              <div key={f.label}>
                <div className="flex items-baseline justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{f.label}</p>
                    <p className="truncate text-[11px] text-cred-text-muted">{f.hint}</p>
                  </div>
                  <span className="shrink-0 text-sm font-bold text-cred-gold">
                    {f.value != null ? `${Math.round(f.value)}%` : '—'}
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-cred-elevated">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${f.tone}`}
                    style={{
                      width: `${f.value ?? 0}%`,
                      transition: 'width 800ms cubic-bezier(0.22,1,0.36,1)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="rounded-3xl border border-cred-border bg-cred-card p-6 shadow-cred-card">
          <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-white">
            Improvement Tips
          </h2>
          {tips.length === 0 ? (
            <p className="mt-3 text-sm text-cred-text-secondary">
              No tips available right now — keep paying on time to build history.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {tips.map((tip, i) => (
                <li key={i} className="flex gap-3 text-sm text-cred-text-secondary">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-cred-gold/40 bg-cred-gold/10 text-[10px] font-bold text-cred-gold">
                    {i + 1}
                  </span>
                  <span>{typeof tip === 'string' ? tip : tip.message || tip.tip}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-3xl border border-cred-border bg-cred-card p-6 shadow-cred-card">
          <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-white">
            What If Simulation
          </h2>
          <p className="mt-1 text-xs text-cred-text-muted">
            Simulate how an action could change your score.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {SIMULATIONS.map((sim) => (
              <button
                key={sim.action}
                type="button"
                disabled={!!simulating}
                onClick={() => handleSimulate(sim.action)}
                className="group rounded-2xl border border-cred-border bg-cred-elevated/70 p-4 text-left transition-all hover:border-cred-gold/50 hover:bg-cred-elevated disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="text-lg">{sim.emoji}</span>
                <p className="mt-2 text-xs font-semibold leading-snug text-white">{sim.label}</p>
                <p
                  className={`mt-1 text-xs font-bold ${
                    sim.delta.startsWith('-') ? 'text-cred-red' : 'text-cred-green'
                  }`}
                >
                  {simulating === sim.action ? 'Simulating…' : sim.delta}
                </p>
              </button>
            ))}
          </div>
          {simResult && (
            <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl border border-cred-gold/30 bg-cred-gold/10 px-4 py-3">
              <span className="text-xs uppercase tracking-wider text-cred-gold/80">
                Projected score
              </span>
              <span className="text-sm font-bold text-white">
                {simResult.before} → {simResult.after}
                <span
                  className={`ml-2 ${simResult.delta >= 0 ? 'text-cred-green' : 'text-cred-red'}`}
                >
                  ({simResult.delta >= 0 ? '+' : ''}
                  {simResult.delta})
                </span>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
