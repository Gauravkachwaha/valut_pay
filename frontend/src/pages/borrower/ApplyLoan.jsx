import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CheckIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { loanService } from '../../services/loanService'
import { formatCurrency, formatIndianNumber, parseCurrencyInput } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'
import {
  INTEREST_RATE,
  LOAN_AMOUNT_MAX,
  LOAN_AMOUNT_MIN,
  LOAN_PURPOSES,
  LOAN_TENURES,
  LOAN_STATUS_LABELS,
} from '../../utils/constants'

const STEPS = [
  { id: 1, label: 'Loan Details' },
  { id: 2, label: 'EMI Preview' },
  { id: 3, label: 'Review' },
  { id: 4, label: 'Success' },
]

const emptyEmi = {
  monthlyEmi: null,
  totalAmount: null,
  totalInterest: null,
  amortizationSchedule: [],
}

function buildLocalEmi(amount, tenure, annualRate = 12.0) {
  const principal = parseFloat(amount)
  const months = parseInt(tenure, 10)
  const monthlyRate = annualRate / 12 / 100

  let emi
  if (monthlyRate === 0) {
    emi = principal / months
  } else {
    emi =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1)
  }

  const totalAmount = emi * months
  const totalInterest = totalAmount - principal

  let balance = principal
  const amortizationSchedule = []
  for (let month = 1; month <= months; month += 1) {
    const interest = balance * monthlyRate
    let principalPart = emi - interest
    if (month === months) {
      principalPart = balance
      const lastEmi = principalPart + interest
      balance = 0
      amortizationSchedule.push({
        month,
        emi: Number(lastEmi.toFixed(2)),
        principal: Number(principalPart.toFixed(2)),
        interest: Number(interest.toFixed(2)),
        balance: 0,
      })
    } else {
      balance = Math.max(0, balance - principalPart)
      amortizationSchedule.push({
        month,
        emi: Number(emi.toFixed(2)),
        principal: Number(principalPart.toFixed(2)),
        interest: Number(interest.toFixed(2)),
        balance: Number(balance.toFixed(2)),
      })
    }
  }

  return {
    monthlyEmi: Number(emi.toFixed(2)),
    totalAmount: Number(totalAmount.toFixed(2)),
    totalInterest: Number(totalInterest.toFixed(2)),
    amortizationSchedule,
  }
}

export default function ApplyLoan() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [purpose, setPurpose] = useState('')
  const [amount, setAmount] = useState(200000)
  const [tenureMonths, setTenureMonths] = useState(24)
  const [errors, setErrors] = useState({})
  const [emiData, setEmiData] = useState(emptyEmi)
  const [emiLoading, setEmiLoading] = useState(false)
  const [showAllSchedule, setShowAllSchedule] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submittedLoan, setSubmittedLoan] = useState(null)
  const debounceRef = useRef(null)
  const requestIdRef = useRef(0)

  const calculateEmi = useCallback(async (loanAmount, tenure) => {
    const parsedAmount = parseFloat(loanAmount)
    const parsedTenure = parseInt(tenure, 10)

    if (
      Number.isNaN(parsedAmount) ||
      Number.isNaN(parsedTenure) ||
      parsedAmount < LOAN_AMOUNT_MIN ||
      parsedAmount > LOAN_AMOUNT_MAX ||
      !parsedTenure
    ) {
      return
    }

    const requestId = ++requestIdRef.current
    setEmiLoading(true)
    try {
      const response = await loanService.calculateEmi({
        amount: parsedAmount,
        tenureMonths: parsedTenure,
        interestRate: 12.0,
      })
      if (requestId === requestIdRef.current) {
        const data = response.data
        setEmiData({
          monthlyEmi: data.monthlyEmi,
          totalAmount: data.totalAmount,
          totalInterest: data.totalInterest,
          amortizationSchedule: data.amortizationSchedule || [],
        })
      }
    } catch (error) {
      console.error('EMI calc error:', error)
      // Calculate locally as fallback
      if (requestId === requestIdRef.current) {
        setEmiData(buildLocalEmi(parsedAmount, parsedTenure, 12.0))
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setEmiLoading(false)
      }
    }
  }, [])

  // Debounced EMI calculation on amount / tenure change
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      calculateEmi(amount, tenureMonths)
    }, 500)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [amount, tenureMonths, calculateEmi])

  const handleAmountSlider = (e) => {
    setAmount(Number(e.target.value))
  }

  const handleAmountInput = (e) => {
    const parsed = parseCurrencyInput(e.target.value)
    setAmount(Math.min(LOAN_AMOUNT_MAX, Math.max(0, parsed)))
  }

  const validateStep1 = () => {
    const next = {}
    if (!purpose) next.purpose = 'Please select a loan purpose'
    if (amount < LOAN_AMOUNT_MIN) next.amount = `Minimum amount is ${formatCurrency(LOAN_AMOUNT_MIN)}`
    if (amount > LOAN_AMOUNT_MAX) next.amount = `Maximum amount is ${formatCurrency(LOAN_AMOUNT_MAX)}`
    if (!tenureMonths) next.tenure = 'Please select a tenure'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const goNext = () => {
    if (step === 1 && !validateStep1()) return
    if (step === 2) setShowAllSchedule(false)
    setStep((s) => Math.min(4, s + 1))
  }

  const goBack = () => setStep((s) => Math.max(1, s - 1))

  const handleSubmit = async () => {
    if (!agreed) {
      toast.error('Please agree to the terms and conditions')
      return
    }
    setSubmitting(true)
    try {
      const { data } = await loanService.apply({
        amount,
        purpose,
        tenureMonths,
      })
      setSubmittedLoan(data)
      setStep(4)
      toast.success('Application submitted successfully!')
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to submit application. Please try again.'
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  const schedule = emiData.amortizationSchedule || []
  const visibleSchedule = showAllSchedule ? schedule : schedule.slice(0, 6)
  const purposeLabel =
    LOAN_PURPOSES.find((p) => p.value === purpose)?.label || purpose

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Apply for a Loan</h1>
        <p className="mt-1 text-cred-text-secondary">
          Complete the steps below to submit your loan application.
        </p>
      </div>

      <StepIndicator current={step} />

      {step === 1 && (
        <Step1LoanDetails
          purpose={purpose}
          setPurpose={setPurpose}
          amount={amount}
          tenureMonths={tenureMonths}
          setTenureMonths={setTenureMonths}
          errors={errors}
          setErrors={setErrors}
          emiData={emiData}
          emiLoading={emiLoading}
          onAmountSlider={handleAmountSlider}
          onAmountInput={handleAmountInput}
          onNext={goNext}
        />
      )}

      {step === 2 && (
        <Step2EmiPreview
          tenureMonths={tenureMonths}
          emiData={emiData}
          emiLoading={emiLoading}
          visibleSchedule={visibleSchedule}
          schedule={schedule}
          showAllSchedule={showAllSchedule}
          setShowAllSchedule={setShowAllSchedule}
          onBack={goBack}
          onNext={goNext}
        />
      )}

      {step === 3 && (
        <Step3Review
          purposeLabel={purposeLabel}
          amount={amount}
          tenureMonths={tenureMonths}
          emiData={emiData}
          agreed={agreed}
          setAgreed={setAgreed}
          submitting={submitting}
          onBack={goBack}
          onSubmit={handleSubmit}
        />
      )}

      {step === 4 && (
        <Step4Success
          loan={submittedLoan}
          amount={amount}
          navigate={navigate}
          onApplyAnother={() => {
            setStep(1)
            setPurpose('')
            setAmount(200000)
            setTenureMonths(24)
            setAgreed(false)
            setSubmittedLoan(null)
            setErrors({})
            setShowAllSchedule(false)
          }}
        />
      )}
    </div>
  )
}

function StepIndicator({ current }) {
  return (
    <div className="mb-10">
      <div className="flex items-center justify-between">
        {STEPS.map((s, index) => {
          const isActive = current === s.id
          const isCompleted = current > s.id
          const isLast = index === STEPS.length - 1

          return (
            <div key={s.id} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition ${
                    isCompleted
                      ? 'bg-cred-green text-white'
                      : isActive
                        ? 'bg-gold-gradient text-black'
                        : 'bg-cred-elevated text-cred-text-muted'
                  }`}
                >
                  {isCompleted ? <CheckIcon className="h-5 w-5" /> : s.id}
                </div>
                <span
                  className={`mt-2 hidden text-center text-xs font-medium sm:block ${
                    isActive
                      ? 'text-cred-gold'
                      : isCompleted
                        ? 'text-cred-green'
                        : 'text-cred-text-muted'
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {!isLast && (
                <div className="mx-2 h-1 flex-1 rounded-full bg-cred-elevated sm:mx-3">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      current > s.id ? 'w-full bg-cred-green' : 'w-0 bg-cred-gold'
                    }`}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Step1LoanDetails({
  purpose,
  setPurpose,
  amount,
  tenureMonths,
  setTenureMonths,
  errors,
  setErrors,
  emiData,
  emiLoading,
  onAmountSlider,
  onAmountInput,
  onNext,
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-3 rounded-2xl border border-cred-border bg-cred-card p-6 shadow-cred-card transition-all duration-200 hover:shadow-cred-gold">
        {/* Purpose */}
        <div className="mb-6">
          <label className="mb-3 block text-sm font-semibold text-white">
            Loan Purpose <span className="text-cred-red">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {LOAN_PURPOSES.map((p) => {
              const selected = purpose === p.value
              return (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => {
                    setPurpose(p.value)
                    setErrors((e) => ({ ...e, purpose: undefined }))
                  }}
                  className={`flex items-center gap-2 rounded-xl border-2 px-3 py-3 text-sm font-medium transition-all duration-200 ${
                    selected
                      ? 'border-cred-gold bg-cred-gold/10 text-cred-gold'
                      : errors.purpose
                        ? 'border-red-300 bg-cred-card text-cred-text-secondary hover:border-red-400'
                        : 'border-cred-border bg-cred-card text-cred-text-secondary hover:border-cred-border'
                  }`}
                >
                  <span className="text-lg">{p.emoji}</span>
                  {p.label}
                </button>
              )
            })}
          </div>
          {errors.purpose && (
            <p className="mt-2 text-sm text-cred-red">{errors.purpose}</p>
          )}
        </div>

        {/* Amount */}
        <div className="mb-6">
          <label className="mb-3 block text-sm font-semibold text-white">
            Loan Amount <span className="text-cred-red">*</span>
          </label>
          <div className="mb-4 flex items-center gap-3">
            <span className="text-lg font-medium text-cred-text-secondary">₹</span>
            <input
              type="text"
              inputMode="numeric"
              value={formatIndianNumber(amount)}
              onChange={onAmountInput}
              className={`w-full rounded-xl border-2 px-4 py-3 text-lg font-semibold text-white focus:border-cred-gold focus:outline-none ${
                errors.amount ? 'border-red-500' : 'border-cred-border'
              }`}
            />
          </div>
          <input
            type="range"
            min={LOAN_AMOUNT_MIN}
            max={LOAN_AMOUNT_MAX}
            step={1000}
            value={Math.min(LOAN_AMOUNT_MAX, Math.max(LOAN_AMOUNT_MIN, amount || LOAN_AMOUNT_MIN))}
            onChange={onAmountSlider}
            className="loan-slider w-full"
          />
          <div className="mt-2 flex justify-between text-xs text-cred-text-secondary">
            <span>{formatCurrency(LOAN_AMOUNT_MIN)}</span>
            <span>{formatCurrency(LOAN_AMOUNT_MAX)}</span>
          </div>
          {errors.amount && (
            <p className="mt-2 text-sm text-cred-red">{errors.amount}</p>
          )}
        </div>

        {/* Tenure */}
        <div className="mb-6">
          <label className="mb-3 block text-sm font-semibold text-white">
            Tenure <span className="text-cred-red">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {LOAN_TENURES.map((t) => {
              const selected = tenureMonths === t
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setTenureMonths(t)
                    setErrors((e) => ({ ...e, tenure: undefined }))
                  }}
                  className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                    selected
                      ? 'bg-gold-gradient font-bold text-black'
                      : 'border border-cred-border bg-cred-elevated text-white hover:border-cred-gold/50'
                  }`}
                >
                  {t}M
                </button>
              )
            })}
          </div>
          {errors.tenure && (
            <p className="mt-2 text-sm text-cred-red">{errors.tenure}</p>
          )}
        </div>

        {/* Interest rate */}
        <div className="mb-8">
          <label className="mb-2 block text-sm font-semibold text-white">
            Interest Rate
          </label>
          <div className="rounded-xl border-2 border-cred-border bg-cred-elevated px-4 py-3 text-sm font-medium text-cred-text-secondary">
            {INTEREST_RATE}% p.a. (Fixed)
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onNext}
            className="inline-flex items-center gap-2 rounded-xl bg-gold-gradient px-6 py-3 text-sm font-bold tracking-wide text-black transition-all duration-200 hover:scale-[1.02] hover:shadow-cred-gold"
          >
            Next
            <ArrowRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Live EMI Preview */}
      <div className="lg:col-span-2">
        <div className="sticky top-24 rounded-2xl border border-cred-border bg-cred-card p-6 shadow-cred-card">
          <h3 className="mb-6 flex items-center gap-2 text-base font-semibold text-cred-gold">
            💰 Loan Summary
          </h3>
          <dl className="mb-6 space-y-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-cred-text-secondary">Amount</dt>
              <dd className="font-semibold text-white">{formatCurrency(amount)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-cred-text-secondary">Tenure</dt>
              <dd className="font-semibold text-white">{tenureMonths} months</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-cred-text-secondary">Interest</dt>
              <dd className="font-semibold text-white">{INTEREST_RATE}% p.a.</dd>
            </div>
          </dl>

          <div className="rounded-xl border border-cred-gold/20 bg-cred-elevated p-4">
            <p className="mb-1 text-xs text-cred-text-muted">Monthly EMI</p>
            <p className="text-3xl font-black text-cred-gold">
              {emiLoading ? (
                <span className="inline-block h-8 w-28 animate-pulse rounded bg-cred-gold/10" />
              ) : (
                formatCurrency(emiData.monthlyEmi)
              )}
            </p>
          </div>

          <div className="mt-5 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-cred-text-secondary">Total Interest</span>
              <span className="font-medium text-white">
                {emiLoading ? '…' : formatCurrency(emiData.totalInterest)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-cred-text-secondary">Total Amount</span>
              <span className="font-medium text-white">
                {emiLoading ? '…' : formatCurrency(emiData.totalAmount)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Step2EmiPreview({
  tenureMonths,
  emiData,
  emiLoading,
  visibleSchedule,
  schedule,
  showAllSchedule,
  setShowAllSchedule,
  onBack,
  onNext,
}) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">Your EMI Schedule</h2>
        <p className="mt-1 text-cred-text-secondary">
          {formatCurrency(emiData.monthlyEmi)}/month for {tenureMonths} months
        </p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <SummaryCard label="Monthly EMI" value={formatCurrency(emiData.monthlyEmi)} loading={emiLoading} accent />
        <SummaryCard label="Total Interest" value={formatCurrency(emiData.totalInterest)} loading={emiLoading} />
        <SummaryCard label="Total Payable" value={formatCurrency(emiData.totalAmount)} loading={emiLoading} />
      </div>

      <div className="mb-6 overflow-hidden rounded-2xl border border-cred-border bg-cred-card shadow-cred-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-cred-elevated">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-cred-text-secondary">Month</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-cred-text-secondary">EMI</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-cred-text-secondary">Principal</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-cred-text-secondary">Interest</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-cred-text-secondary">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cred-border">
              {emiLoading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-cred-text-secondary">
                    Calculating schedule…
                  </td>
                </tr>
              ) : visibleSchedule.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-cred-text-secondary">
                    No schedule available
                  </td>
                </tr>
              ) : (
                visibleSchedule.map((row) => (
                  <tr key={row.month} className="hover:bg-cred-elevated">
                    <td className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-cred-text-secondary text-white">{row.month}</td>
                    <td className="px-5 py-3 text-cred-text-secondary">{formatCurrency(row.emi)}</td>
                    <td className="px-5 py-3 text-cred-text-secondary">{formatCurrency(row.principal)}</td>
                    <td className="px-5 py-3 text-cred-text-secondary">{formatCurrency(row.interest)}</td>
                    <td className="px-5 py-3 text-cred-text-secondary">{formatCurrency(row.balance)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {schedule.length > 6 && (
          <div className="border-t border-cred-border px-5 py-3 text-center">
            <button
              type="button"
              onClick={() => setShowAllSchedule((v) => !v)}
              className="text-sm font-semibold text-cred-gold hover:text-cred-gold"
            >
              {showAllSchedule ? 'Show Less' : `View All (${schedule.length} months)`}
            </button>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-xl border-2 border-cred-border bg-cred-card px-6 py-3 text-sm font-semibold text-cred-text-secondary transition-all duration-200 hover:bg-cred-elevated"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2 rounded-xl bg-gold-gradient px-6 py-3 text-sm font-bold tracking-wide text-black transition-all duration-200 hover:scale-[1.02] hover:shadow-cred-gold"
        >
          Next
          <ArrowRightIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

function Step3Review({
  purposeLabel,
  amount,
  tenureMonths,
  emiData,
  agreed,
  setAgreed,
  submitting,
  onBack,
  onSubmit,
}) {
  return (
    <div className="mx-auto max-w-xl">
      <h2 className="mb-6 text-xl font-bold text-white">Review Your Application</h2>

      <div className="mb-6 overflow-hidden rounded-2xl border border-cred-border bg-cred-card shadow-cred-card overflow-hidden">
        <div className="border-b border-cred-border px-6 py-4">
          <h3 className="font-semibold text-white">Loan Details</h3>
        </div>
        <dl className="space-y-3 px-6 py-5 text-sm">
          <ReviewRow label="Purpose" value={`${purposeLabel} Loan`} />
          <ReviewRow label="Amount" value={formatCurrency(amount)} />
          <ReviewRow label="Tenure" value={`${tenureMonths} months`} />
          <ReviewRow label="Interest Rate" value={`${INTEREST_RATE}% p.a.`} />
          <ReviewRow label="Monthly EMI" value={formatCurrency(emiData.monthlyEmi)} />
        </dl>
        <div className="space-y-3 border-t border-cred-border bg-cred-elevated px-6 py-4 text-sm">
          <ReviewRow label="Total Interest" value={formatCurrency(emiData.totalInterest)} />
          <ReviewRow label="Total Payable" value={formatCurrency(emiData.totalAmount)} bold />
        </div>
      </div>

      <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
        ⚠️ Your application will be reviewed by our team within 24-48 hours. You will
        receive a notification once approved.
      </div>

      <label className="mb-8 flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-cred-border text-cred-gold focus:ring-cred-gold"
        />
        <span className="text-sm text-cred-text-secondary">
          I agree to the terms and conditions
        </span>
      </label>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-xl border-2 border-cred-border bg-cred-card px-6 py-3 text-sm font-semibold text-cred-text-secondary transition-all duration-200 hover:bg-cred-elevated disabled:opacity-60"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={submitting || !agreed}
          className="inline-flex items-center gap-2 rounded-xl bg-gold-gradient px-6 py-3 text-sm font-bold tracking-wide text-black transition-all duration-200 hover:scale-[1.02] hover:shadow-cred-gold disabled:opacity-60"
        >
          {submitting ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Submitting…
            </>
          ) : (
            <>
              Submit Application
              <ArrowRightIcon className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </div>
  )
}

function Step4Success({ loan, amount, navigate, onApplyAnother }) {
  const status = loan?.status || 'SUBMITTED'
  const statusLabel = LOAN_STATUS_LABELS[status] || status
  const loanId = loan?.id ? String(loan.id) : '—'
  const appliedDate = formatDate(loan?.appliedAt || loan?.createdAt || new Date())

  return (
    <div className="mx-auto max-w-lg text-center">
      <div className="success-checkmark mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-cred-green/10">
        <CheckIcon className="h-10 w-10 text-cred-green" strokeWidth={2.5} />
      </div>

      <h2 className="text-2xl font-bold text-white">Application Submitted! 🎉</h2>
      <p className="mt-2 text-cred-text-secondary">
        Your loan application has been submitted successfully.
      </p>

      <div className="mt-8 rounded-2xl bg-cred-card p-6 text-left shadow-cred-card">
        <h3 className="mb-4 font-semibold text-white">Application Details</h3>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-cred-text-secondary">Loan ID</dt>
            <dd className="truncate font-mono font-medium text-white" title={loanId}>
              #{loanId.length > 12 ? `${loanId.slice(0, 8)}…` : loanId}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-cred-text-secondary">Amount</dt>
            <dd className="font-medium text-white">
              {formatCurrency(loan?.amount ?? amount)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-cred-text-secondary">Status</dt>
            <dd className="font-medium text-yellow-700">
              {statusLabel} 🟡
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-cred-text-secondary">Applied</dt>
            <dd className="font-medium text-white">{appliedDate}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-8 rounded-2xl bg-cred-card p-6 text-left shadow-cred-card">
        <h3 className="mb-4 font-semibold text-white">What&apos;s Next?</h3>
        <ol className="space-y-3 text-sm text-cred-text-secondary">
          <li className="flex items-center gap-3">
            <span>📋</span> Application received
          </li>
          <li className="flex items-center gap-3">
            <span>🔍</span> Under review (1-2 days)
          </li>
          <li className="flex items-center gap-3">
            <span>✅</span> Approval notification
          </li>
          <li className="flex items-center gap-3">
            <span>💰</span> Amount disbursed
          </li>
        </ol>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/borrower/loans')}
          className="rounded-xl bg-gold-gradient px-6 py-3 text-sm font-bold tracking-wide text-black transition-all duration-200 hover:scale-[1.02] hover:shadow-cred-gold"
        >
          View My Loans
        </button>
        <button
          type="button"
          onClick={onApplyAnother}
          className="rounded-lg border border-cred-border bg-cred-card px-5 py-2.5 text-sm font-semibold text-cred-text-secondary transition hover:bg-cred-elevated"
        >
          Apply Another Loan
        </button>
      </div>
    </div>
  )
}

function SummaryCard({ label, value, loading, accent }) {
  return (
    <div className="rounded-2xl border border-cred-border bg-cred-card p-6 shadow-cred-card transition-all duration-200 hover:-translate-y-1 hover:shadow-cred-gold">
      <p className="text-sm font-medium text-cred-text-secondary">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${accent ? 'text-cred-gold' : 'text-white'}`}>
        {loading ? (
          <span className="inline-block h-7 w-24 animate-pulse rounded bg-cred-elevated" />
        ) : (
          value
        )}
      </p>
    </div>
  )
}

function ReviewRow({ label, value, bold }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-cred-text-secondary">{label}</dt>
      <dd className={`text-right text-white ${bold ? 'font-semibold' : 'font-medium'}`}>
        {value}
      </dd>
    </div>
  )
}
