import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { loanService } from '../../services/loanService'
import { paymentService } from '../../services/paymentService'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'
import StatusBadge from '../../components/common/StatusBadge'
import Spinner from '../../components/common/Spinner'
import EmptyState from '../../components/common/EmptyState'

const STEPS = [
  { id: 1, label: 'Select Loan' },
  { id: 2, label: 'Select EMI' },
  { id: 3, label: 'Payment' },
  { id: 4, label: 'Success' },
]

const PAYMENT_MODES = [
  { value: 'UPI', label: 'UPI', emoji: '💳' },
  { value: 'NET_BANKING', label: 'Net Banking', emoji: '🏦' },
  { value: 'DEBIT_CARD', label: 'Debit Card', emoji: '💳' },
  { value: 'CREDIT_CARD', label: 'Credit Card', emoji: '💳' },
]

function getSchedule(loan) {
  return loan?.amortizationSchedule || loan?.emiSchedule || loan?.schedule || []
}

function isPendingEmi(emi) {
  const status = (emi.status || emi.paymentStatus || '').toUpperCase()
  return !status || status === 'PENDING' || status === 'DUE' || status === 'UNPAID'
}

function emiAmount(emi) {
  return emi.emi ?? emi.amount ?? emi.emiAmount ?? 0
}

function emiId(emi) {
  return emi.id ?? emi.emiId ?? emi.emiNumber ?? emi.month
}

function emiNumber(emi) {
  return emi.emiNumber ?? emi.month ?? emi.installmentNumber ?? emi.id
}

function emiDueDate(emi) {
  return emi.dueDate ?? emi.date ?? emi.paymentDate
}

export default function PayEmi() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loans, setLoans] = useState([])
  const [loading, setLoading] = useState(true)
  const [loanLoading, setLoanLoading] = useState(false)
  const [selectedLoan, setSelectedLoan] = useState(null)
  const [pendingEmis, setPendingEmis] = useState([])
  const [selectedEmi, setSelectedEmi] = useState(null)
  const [paymentMode, setPaymentMode] = useState('UPI')
  const [submitting, setSubmitting] = useState(false)
  const [transactionRef, setTransactionRef] = useState(null)

  useEffect(() => {
    const fetchLoans = async () => {
      setLoading(true)
      try {
        const { data } = await loanService.myLoans()
        const list = Array.isArray(data) ? data : data?.loans || data?.content || []
        setLoans(list)
      } catch {
        toast.error('Failed to load loans')
      } finally {
        setLoading(false)
      }
    }
    fetchLoans()
  }, [])

  const handleSelectLoan = async (loan) => {
    setLoanLoading(true)
    setSelectedLoan(loan)
    try {
      const { data } = await loanService.getById(loan.id)
      const detail = data?.loan || data
      setSelectedLoan(detail)
      const schedule = getSchedule(detail)
      setPendingEmis(schedule.filter(isPendingEmi))
      setStep(2)
    } catch {
      toast.error('Failed to load EMI schedule')
      setSelectedLoan(null)
    } finally {
      setLoanLoading(false)
    }
  }

  const handleSelectEmi = (emi) => {
    setSelectedEmi(emi)
    setStep(3)
  }

  const handlePay = async () => {
    if (!selectedLoan || !selectedEmi || !paymentMode) {
      toast.error('Please select a payment mode')
      return
    }
    setSubmitting(true)
    try {
      const { data } = await paymentService.payEmi({
        loanId: selectedLoan.id,
        emiId: emiId(selectedEmi),
        amount: emiAmount(selectedEmi),
        paymentMode,
      })
      setTransactionRef(
        data?.transactionRef ||
          data?.transactionId ||
          data?.reference ||
          data?.id ||
          '—'
      )
      setStep(4)
      toast.success('Payment Successful!')
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Payment failed. Please try again.'
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Pay EMI</h1>
        <p className="mt-1 text-cred-text-secondary">
          Select a loan and pay your pending EMI installment.
        </p>
      </div>

      {/* Step indicator */}
      <div className="mb-8 flex flex-wrap items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                step > s.id
                  ? 'bg-cred-green text-white'
                  : step === s.id
                    ? 'bg-cred-gold text-white'
                    : 'bg-cred-elevated text-cred-text-secondary'
              }`}
            >
              {step > s.id ? <CheckIcon className="h-4 w-4" /> : s.id}
            </div>
            <span
              className={`text-sm font-medium ${
                step === s.id ? 'text-white' : 'text-cred-text-secondary'
              }`}
            >
              {s.label}
            </span>
            {i < STEPS.length - 1 && (
              <div className="mx-1 hidden h-px w-8 bg-cred-elevated sm:block" />
            )}
          </div>
        ))}
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <div>
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-36 animate-pulse rounded-xl bg-cred-elevated" />
              ))}
            </div>
          ) : loans.length === 0 ? (
            <div className="rounded-2xl border border-cred-border bg-cred-card shadow-cred-card">
              <EmptyState
                title="No loans available"
                description="Apply for a loan to start paying EMIs"
                actionLabel="+ Apply Now"
                actionHref="/borrower/loans/apply"
                actionAs={Link}
              />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {loans.map((loan) => {
                return (
                  <div
                    key={loan.id}
                    className="rounded-2xl border border-cred-border bg-cred-card p-6 shadow-cred-card transition-all duration-200 hover:-translate-y-1 hover:shadow-cred-gold"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-semibold text-white">
                        {loan.purpose
                          ? `${String(loan.purpose).charAt(0)}${String(loan.purpose).slice(1).toLowerCase()} Loan`
                          : 'Loan'}
                      </h3>
                      <StatusBadge status={loan.status} />
                    </div>
                    <p className="mt-3 text-sm text-cred-text-secondary">
                      {formatCurrency(loan.amount)} | EMI:{' '}
                      {formatCurrency(loan.monthlyEmi)}/mo
                    </p>
                    <button
                      type="button"
                      disabled={loanLoading}
                      onClick={() => handleSelectLoan(loan)}
                      className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-gold-gradient px-6 py-3 text-sm font-bold tracking-wide text-black transition-all duration-200 hover:-translate-y-0.5 hover:bg-cred-gold hover:shadow-md disabled:opacity-50"
                    >
                      Select This Loan
                      <ArrowRightIcon className="h-4 w-4" />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div>
          <button
            type="button"
            onClick={() => {
              setStep(1)
              setSelectedEmi(null)
              setPendingEmis([])
            }}
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-cred-text-secondary hover:text-white"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to loans
          </button>

          {loanLoading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-28 animate-pulse rounded-xl bg-cred-elevated" />
              ))}
            </div>
          ) : pendingEmis.length === 0 ? (
            <div className="rounded-2xl border border-cred-border bg-cred-card p-8 text-center shadow-cred-card">
              <p className="text-cred-text-secondary">No pending EMIs for this loan.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {pendingEmis.map((emi) => (
                <div
                  key={emiId(emi)}
                  className="rounded-2xl border border-cred-border bg-cred-card p-6 shadow-cred-card transition-all duration-200 hover:-translate-y-1 hover:shadow-cred-gold"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-white">EMI #{emiNumber(emi)}</p>
                    <p className="text-sm text-cred-text-secondary">
                      Due: {formatDate(emiDueDate(emi))}
                    </p>
                  </div>
                  <p className="mt-3 text-xl font-bold text-white">
                    {formatCurrency(emiAmount(emi))}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleSelectEmi(emi)}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-gold-gradient px-6 py-3 text-sm font-bold tracking-wide text-black transition-all duration-200 hover:-translate-y-0.5 hover:bg-cred-gold hover:shadow-md"
                  >
                    Select
                    <ArrowRightIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && selectedEmi && (
        <div className="mx-auto max-w-lg">
          <button
            type="button"
            onClick={() => setStep(2)}
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-cred-text-secondary hover:text-white"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to EMIs
          </button>

          <div className="rounded-2xl border border-cred-border bg-cred-card p-6 shadow-cred-card transition-all duration-200 hover:shadow-cred-gold">
            <h2 className="font-semibold text-white">Payment Mode</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {PAYMENT_MODES.map((mode) => (
                <button
                  key={mode.value}
                  type="button"
                  onClick={() => setPaymentMode(mode.value)}
                  className={`rounded-lg border px-4 py-3 text-sm font-medium transition ${
                    paymentMode === mode.value
                      ? 'border-cred-gold bg-cred-gold/10 text-cred-gold'
                      : 'border-cred-border bg-cred-card text-cred-text-secondary hover:bg-cred-elevated'
                  }`}
                >
                  {mode.emoji} {mode.label}
                </button>
              ))}
            </div>

            <div className="mt-6">
              <label className="text-sm font-medium text-cred-text-secondary">Amount</label>
              <input
                type="text"
                readOnly
                value={formatCurrency(emiAmount(selectedEmi))}
                className="mt-1 w-full rounded-lg border border-cred-border bg-cred-elevated px-4 py-2.5 text-lg font-semibold text-white"
              />
            </div>

            <button
              type="button"
              disabled={submitting}
              onClick={handlePay}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gold-gradient px-6 py-3 text-sm font-bold tracking-wide text-black transition-all duration-200 hover:-translate-y-0.5 hover:bg-cred-gold hover:shadow-md disabled:opacity-50"
            >
              {submitting ? <Spinner /> : 'Pay Now'}
              {!submitting && <ArrowRightIcon className="h-4 w-4" />}
            </button>
          </div>
        </div>
      )}

      {/* Step 4 */}
      {step === 4 && (
        <div className="mx-auto max-w-md text-center">
          <div className="rounded-2xl border border-cred-border bg-cred-card p-8 shadow-cred-card">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cred-green/10">
              <CheckIcon className="h-8 w-8 text-cred-green" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-white">Payment Successful!</h2>
            <p className="mt-2 text-sm text-cred-text-secondary">
              Transaction ID:{' '}
              <span className="font-mono font-medium text-white">{transactionRef}</span>
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                to="/borrower/payments"
                className="rounded-xl bg-gold-gradient px-6 py-3 text-sm font-bold tracking-wide text-black transition-all duration-200 hover:-translate-y-0.5 hover:bg-cred-gold hover:shadow-md"
              >
                View History
              </Link>
              <button
                type="button"
                onClick={() => navigate('/borrower/dashboard')}
                className="rounded-xl border-2 border-cred-border bg-cred-card px-6 py-3 text-sm font-semibold text-cred-text-secondary transition-all duration-200 hover:bg-cred-elevated"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
