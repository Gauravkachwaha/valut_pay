import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { XMarkIcon, EyeIcon, PlusIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { loanService } from '../../services/loanService'
import { paymentService } from '../../services/paymentService'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'
import { INTEREST_RATE } from '../../utils/constants'
import StatusBadge from '../../components/common/StatusBadge'
import EmptyState from '../../components/common/EmptyState'
import ProgressRing from '../../components/common/ProgressRing'
import { SkeletonBlock } from '../../components/common/LoadingSkeleton'

const PURPOSE_COLORS = {
  HOME: 'bg-cred-purple/10 text-cred-purple border border-cred-purple/25',
  CAR: 'bg-blue-500/10 text-blue-300 border border-blue-500/25',
  PERSONAL: 'bg-cred-gold/10 text-cred-gold border border-cred-gold/25',
  BUSINESS: 'bg-orange-500/10 text-orange-300 border border-orange-500/25',
  EDUCATION: 'bg-cred-green/10 text-cred-green border border-cred-green/25',
}

function truncateId(id) {
  if (!id) return '—'
  const s = String(id)
  return s.length > 10 ? `${s.slice(0, 8)}…` : s
}

export default function MyLoans() {
  const [loans, setLoans] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedLoan, setSelectedLoan] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [payments, setPayments] = useState([])

  useEffect(() => {
    const fetchLoans = async () => {
      setLoading(true)
      try {
        const { data } = await loanService.myLoans()
        setLoans(Array.isArray(data) ? data : data?.loans || [])
      } catch {
        toast.error('Failed to load loans')
      } finally {
        setLoading(false)
      }
    }
    fetchLoans()
  }, [])

  const openDetails = async (loan) => {
    setSelectedLoan(loan)
    setDetailLoading(true)
    setPayments([])
    try {
      const [detailRes, paymentsRes] = await Promise.allSettled([
        loanService.getById(loan.id),
        paymentService.history(),
      ])

      if (detailRes.status === 'fulfilled') {
        setSelectedLoan({ ...loan, ...detailRes.value.data })
      }

      if (paymentsRes.status === 'fulfilled') {
        const all = Array.isArray(paymentsRes.value.data)
          ? paymentsRes.value.data
          : paymentsRes.value.data?.payments || []
        const loanPayments = all.filter(
          (p) =>
            p.loanId === loan.id ||
            p.loan?.id === loan.id ||
            String(p.loanId) === String(loan.id)
        )
        setPayments(loanPayments)
      }
    } catch {
      toast.error('Failed to load loan details')
    } finally {
      setDetailLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-8 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:flex-wrap sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold text-white sm:text-2xl">My Loans</h1>
          <p className="mt-1 text-sm text-cred-text-secondary">
            View and manage your loan applications.
          </p>
        </div>
        <Link
          to="/borrower/loans/apply"
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-gold-gradient px-4 py-2.5 text-xs font-bold tracking-wide text-black transition-all duration-200 hover:-translate-y-0.5 hover:shadow-cred-gold sm:px-6 sm:py-3 sm:text-sm"
        >
          <PlusIcon className="h-4 w-4 shrink-0" />
          <span className="hidden sm:inline">Apply New Loan</span>
          <span className="sm:hidden">Apply</span>
        </Link>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-cred-border bg-cred-card p-5 shadow-cred-card"
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1 space-y-2">
                  <SkeletonBlock className="h-4 w-24" />
                  <SkeletonBlock className="h-7 w-32" />
                </div>
                <SkeletonBlock className="h-16 w-16 rounded-full" />
              </div>
              <SkeletonBlock className="mb-3 h-px w-full" />
              <div className="grid grid-cols-3 gap-3">
                <SkeletonBlock className="h-10" />
                <SkeletonBlock className="h-10" />
                <SkeletonBlock className="h-10" />
              </div>
            </div>
          ))}
        </div>
      ) : loans.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-cred-border bg-gradient-to-b from-cred-card to-cred-bg/40 shadow-cred-card">
          <EmptyState
            icon="🏦"
            title="No loans yet"
            description="Your approved credit, EMIs and repayment history will appear here once you apply."
            actionLabel="+ Apply for your first loan"
            actionHref="/borrower/loans/apply"
            actionAs={Link}
          />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {loans.map((loan) => {
            const purposeBadge =
              PURPOSE_COLORS[loan.purpose] ||
              'bg-cred-elevated text-cred-text-secondary border border-cred-border'
            const tenure = Number(loan.tenureMonths) || 0
            const paid = Number(loan.paidEmiCount ?? loan.emisPaid ?? 0)
            const pct = tenure > 0 ? Math.min(100, Math.round((paid / tenure) * 100)) : 0
            const tone =
              loan.status === 'REJECTED' || loan.status === 'NPA'
                ? 'red'
                : loan.status === 'CLOSED'
                  ? 'muted'
                  : loan.status === 'ACTIVE'
                    ? 'green'
                    : 'gold'

            return (
              <article
                key={loan.id}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-cred-border bg-gradient-to-br from-cred-card via-cred-card to-cred-bg/60 p-5 shadow-cred-card transition-all duration-300 hover:-translate-y-0.5 hover:border-cred-gold/40"
              >
                <span className="pointer-events-none absolute -right-10 -top-12 h-28 w-28 rounded-full bg-cred-gold/10 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                <div className="relative mb-5 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${purposeBadge}`}
                      >
                        {loan.purpose || '—'}
                      </span>
                      <StatusBadge status={loan.status} />
                    </div>
                    <p className="truncate text-2xl font-black tracking-tight text-white">
                      {formatCurrency(loan.amount)}
                    </p>
                    <p className="mt-1 truncate font-mono text-xs text-cred-text-muted" title={loan.id}>
                      #{truncateId(loan.id)}
                    </p>
                  </div>
                  <ProgressRing
                    value={pct}
                    tone={tone}
                    size={64}
                    label={tenure > 0 ? `${pct}%` : '—'}
                    sublabel={tenure > 0 ? 'paid' : undefined}
                  />
                </div>

                <div className="relative mb-5 grid grid-cols-3 gap-3 border-t border-cred-border/70 pt-4">
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wide text-cred-text-muted">EMI</p>
                    <p className="truncate text-sm font-bold text-white">
                      {formatCurrency(loan.monthlyEmi)}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wide text-cred-text-muted">
                      Tenure
                    </p>
                    <p className="truncate text-sm font-bold text-white">
                      {tenure > 0 ? `${tenure} mo` : '—'}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wide text-cred-text-muted">
                      Applied
                    </p>
                    <p className="truncate text-sm font-bold text-white">
                      {formatDate(loan.appliedAt || loan.createdAt)}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => openDetails(loan)}
                  className="relative mt-auto inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-cred-border bg-cred-elevated/60 px-3 py-2.5 text-xs font-semibold text-white transition-all hover:border-cred-gold/50 hover:text-cred-gold"
                >
                  <EyeIcon className="h-4 w-4 shrink-0" />
                  View Details
                </button>
              </article>
            )
          })}
        </div>
      )}

      {selectedLoan && (
        <LoanDetailsModal
          loan={selectedLoan}
          payments={payments}
          loading={detailLoading}
          onClose={() => setSelectedLoan(null)}
        />
      )}
    </div>
  )
}

function LoanDetailsModal({ loan, payments, loading, onClose }) {
  const schedule =
    loan.amortizationSchedule || loan.emiSchedule || loan.schedule || []

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm sm:p-6">
      <div className="my-4 w-full max-w-3xl overflow-hidden rounded-2xl border border-cred-border bg-cred-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-cred-border px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-white">Loan Details</h2>
            <p className="mt-0.5 font-mono text-xs text-cred-text-secondary">#{loan.id}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-cred-text-muted hover:bg-cred-elevated hover:text-cred-text-secondary"
            aria-label="Close"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[75vh] overflow-y-auto px-6 py-5">
          {loading ? (
            <div className="space-y-3 py-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonBlock key={i} className="h-10" />
              ))}
            </div>
          ) : (
            <>
              <div className="mb-6 grid gap-4 sm:grid-cols-2">
                <DetailItem label="Purpose" value={loan.purpose || '—'} />
                <DetailItem label="Amount" value={formatCurrency(loan.amount)} />
                <DetailItem
                  label="Tenure"
                  value={loan.tenureMonths ? `${loan.tenureMonths} months` : '—'}
                />
                <DetailItem
                  label="Interest Rate"
                  value={`${loan.interestRate ?? INTEREST_RATE}% p.a.`}
                />
                <DetailItem label="Monthly EMI" value={formatCurrency(loan.monthlyEmi)} />
                <DetailItem label="Status" value={<StatusBadge status={loan.status} />} />
                <DetailItem
                  label="Applied"
                  value={formatDate(loan.appliedAt || loan.createdAt)}
                />
                <DetailItem
                  label="Total Payable"
                  value={formatCurrency(loan.totalAmount || loan.totalPayable)}
                />
              </div>

              {schedule.length > 0 && (
                <section className="mb-6">
                  <h3 className="mb-3 font-semibold text-white">EMI Schedule</h3>
                  <div className="overflow-x-auto rounded-2xl border border-cred-border">
                    <table className="w-full">
                      <thead className="bg-cred-elevated">
                        <tr>
                          {['Month', 'EMI', 'Principal', 'Interest', 'Balance'].map((h) => (
                            <th
                              key={h}
                              className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-cred-text-secondary"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-cred-border">
                        {schedule.map((row) => (
                          <tr key={row.month} className="hover:bg-cred-elevated">
                            <td className="px-4 py-3 text-sm text-white">{row.month}</td>
                            <td className="px-4 py-3 text-sm text-white">
                              {formatCurrency(row.emi)}
                            </td>
                            <td className="px-4 py-3 text-sm text-white">
                              {formatCurrency(row.principal)}
                            </td>
                            <td className="px-4 py-3 text-sm text-white">
                              {formatCurrency(row.interest)}
                            </td>
                            <td className="px-4 py-3 text-sm text-white">
                              {formatCurrency(row.balance)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              <section>
                <h3 className="mb-3 font-semibold text-white">Payment History</h3>
                {payments.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-cred-border px-4 py-6 text-center text-sm text-cred-text-secondary">
                    No payments recorded yet.
                  </p>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-cred-border">
                    <table className="w-full">
                      <thead className="bg-cred-elevated">
                        <tr>
                          {['Date', 'Amount', 'Status', 'Method'].map((h) => (
                            <th
                              key={h}
                              className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-cred-text-secondary"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-cred-border">
                        {payments.map((p) => (
                          <tr key={p.id} className="hover:bg-cred-elevated">
                            <td className="px-4 py-3 text-sm text-cred-text-secondary">
                              {formatDate(p.paidAt || p.createdAt || p.paymentDate)}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-white">
                              {formatCurrency(p.amount)}
                            </td>
                            <td className="px-4 py-3">
                              <StatusBadge status={p.status || 'SUCCESS'} />
                            </td>
                            <td className="px-4 py-3 text-sm text-cred-text-secondary">
                              {p.method || p.paymentMethod || '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function DetailItem({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-cred-text-muted">{label}</p>
      <div className="mt-1 text-sm font-medium text-white">{value}</div>
    </div>
  )
}
