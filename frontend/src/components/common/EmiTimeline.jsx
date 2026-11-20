import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'

function buildSchedule(loan, count = 4) {
  if (!loan) return []
  const start = loan.nextDueDate ? new Date(loan.nextDueDate) : new Date()
  if (Number.isNaN(start.getTime())) return []

  return Array.from({ length: count }).map((_, i) => {
    const date = new Date(start)
    date.setMonth(date.getMonth() + i)
    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      date,
      amount: loan.monthlyEmi,
      isNext: i === 0,
    }
  })
}

export default function EmiTimeline({ loan, loading = false, actionSlot = null }) {
  const schedule = buildSchedule(loan)
  const tenure = Number(loan?.tenureMonths) || 0
  const paid = Number(loan?.paidEmiCount ?? loan?.emisPaid ?? 0)
  const progress = tenure > 0 ? Math.min(100, Math.round((paid / tenure) * 100)) : 0

  return (
    <div className="overflow-hidden rounded-2xl border border-cred-border bg-gradient-to-b from-cred-card to-cred-bg/40 shadow-cred-card">
      <div className="flex items-center justify-between border-b border-cred-border px-6 py-5">
        <div>
          <h3 className="font-semibold text-white">EMI Timeline</h3>
          <p className="mt-0.5 text-xs text-cred-text-muted">
            {loan?.purpose ? `${loan.purpose} · upcoming instalments` : 'Upcoming instalments'}
          </p>
        </div>
        {actionSlot}
      </div>

      {loading ? (
        <div className="space-y-3 p-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-xl bg-cred-elevated" />
          ))}
        </div>
      ) : schedule.length === 0 ? (
        <p className="p-6 text-sm text-cred-text-secondary">
          No active EMI schedule. Once a loan is disbursed, your instalment plan appears here.
        </p>
      ) : (
        <div className="p-6">
          {tenure > 0 && (
            <div className="mb-6">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="text-cred-text-secondary">
                  {paid} of {tenure} EMIs paid
                </span>
                <span className="font-semibold text-cred-gold">{progress}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-cred-elevated">
                <div
                  className="h-full rounded-full bg-gold-gradient transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <ol className="relative space-y-5 pl-8">
            <span className="absolute bottom-2 left-[11px] top-2 w-px bg-gradient-to-b from-cred-gold/60 via-cred-border to-transparent" />
            {schedule.map((item) => (
              <li key={item.key} className="relative">
                <span
                  className={`absolute -left-8 top-1 flex h-6 w-6 items-center justify-center rounded-full border ${
                    item.isNext
                      ? 'border-cred-gold/60 bg-cred-gold/15'
                      : 'border-cred-border bg-cred-elevated'
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      item.isNext ? 'bg-cred-gold' : 'bg-cred-text-muted'
                    }`}
                  />
                </span>
                <div
                  className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 transition-colors ${
                    item.isNext
                      ? 'border-cred-gold/30 bg-cred-gold/[0.06]'
                      : 'border-cred-border bg-cred-elevated/40 hover:border-cred-gold/20'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white">{formatDate(item.date)}</p>
                    <p className="text-xs text-cred-text-muted">
                      {item.isNext ? 'Next due' : 'Scheduled'}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-extrabold text-white">
                    {item.amount ? formatCurrency(item.amount) : '—'}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}
