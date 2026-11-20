import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { loanService } from '../../services/loanService'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'
import { INTEREST_RATE } from '../../utils/constants'
import StatusBadge from '../../components/common/StatusBadge'
import Spinner from '../../components/common/Spinner'
import EmptyState from '../../components/common/EmptyState'

export default function PendingLoans() {
  const [loans, setLoans] = useState([])
  const [loading, setLoading] = useState(true)
  const [approveLoan, setApproveLoan] = useState(null)
  const [rejectLoan, setRejectLoan] = useState(null)
  const [interestRate, setInterestRate] = useState(INTEREST_RATE)
  const [notes, setNotes] = useState('')
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchPending = async () => {
      setLoading(true)
      try {
        const { data } = await loanService.pending()
        const list = Array.isArray(data) ? data : data?.loans || data?.content || []
        setLoans(list)
      } catch {
        toast.error('Failed to load pending loans')
      } finally {
        setLoading(false)
      }
    }
    fetchPending()
  }, [])

  const openApprove = (loan) => {
    setApproveLoan(loan)
    setInterestRate(INTEREST_RATE)
    setNotes('')
  }

  const openReject = (loan) => {
    setRejectLoan(loan)
    setReason('')
  }

  const handleApprove = async () => {
    if (!approveLoan) return
    setSubmitting(true)
    try {
      await loanService.approve(approveLoan.id, {
        interestRate: Number(interestRate),
        notes,
      })
      setLoans((prev) => prev.filter((l) => l.id !== approveLoan.id))
      setApproveLoan(null)
      toast.success('Loan approved successfully')
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.response?.data?.error ||
          'Failed to approve loan'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleReject = async () => {
    if (!rejectLoan) return
    if (!reason.trim()) {
      toast.error('Rejection reason is required')
      return
    }
    setSubmitting(true)
    try {
      await loanService.reject(rejectLoan.id, { reason: reason.trim() })
      setLoans((prev) => prev.filter((l) => l.id !== rejectLoan.id))
      setRejectLoan(null)
      toast.success('Loan rejected')
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.response?.data?.error ||
          'Failed to reject loan'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Pending Loans</h1>
        <p className="mt-1 text-cred-text-secondary">
          Review and approve or reject loan applications.
        </p>
      </div>

      {loading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-44 animate-pulse rounded-xl bg-cred-elevated" />
          ))}
        </div>
      ) : loans.length === 0 ? (
        <div className="rounded-2xl border border-cred-border bg-cred-card shadow-cred-card">
          <EmptyState
            icon="📋"
            title="No pending loans to review"
            description="New applications will appear here"
          />
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {loans.map((loan) => {
            const name =
              loan.userName ||
              loan.borrowerName ||
              loan.applicantName ||
              loan.user?.name ||
              'Unknown'
            const email =
              loan.userEmail ||
              loan.email ||
              loan.user?.email ||
              ''
            return (
              <div
                key={loan.id}
                className="rounded-2xl border border-cred-border bg-cred-card p-6 shadow-cred-card transition-all duration-200 hover:-translate-y-1 hover:shadow-cred-gold"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{name}</p>
                    {email && <p className="text-sm text-cred-text-secondary">{email}</p>}
                  </div>
                  <StatusBadge status={loan.status || 'SUBMITTED'} />
                </div>
                <p className="mt-3 text-sm text-cred-text-secondary">
                  {formatCurrency(loan.amount)} | EMI{' '}
                  {formatCurrency(loan.monthlyEmi)} | {loan.tenureMonths} months
                </p>
                <p className="mt-1 text-cred-text-secondary">
                  {loan.purpose || '—'} | Applied:{' '}
                  {formatDate(loan.appliedAt || loan.createdAt || loan.applicationDate)}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => openApprove(loan)}
                    className="rounded-xl bg-cred-green px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:opacity-90"
                  >
                    ✅ Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => openReject(loan)}
                    className="rounded-xl bg-cred-red px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:opacity-90"
                  >
                    ❌ Reject
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Approve Modal */}
      {approveLoan && (
        <Modal onClose={() => !submitting && setApproveLoan(null)} title="Confirm Loan Approval">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-cred-text-secondary">Interest Rate (%)</label>
              <input
                type="number"
                min="1"
                max="36"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                className="mt-1 w-full rounded-xl border-2 border-cred-border px-4 py-3 text-sm outline-none focus:border-cred-gold"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-cred-text-secondary">Notes</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes…"
                className="mt-1 w-full rounded-xl border-2 border-cred-border px-4 py-3 text-sm outline-none focus:border-cred-gold"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                disabled={submitting}
                onClick={() => setApproveLoan(null)}
                className="rounded-xl border-2 border-cred-border px-6 py-3 text-sm font-semibold text-cred-text-secondary hover:bg-cred-elevated"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleApprove}
                className="inline-flex items-center gap-2 rounded-xl bg-cred-green px-6 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Spinner className="h-4 w-4" /> Approving…
                  </>
                ) : (
                  'Approve ✅'
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Reject Modal */}
      {rejectLoan && (
        <Modal onClose={() => !submitting && setRejectLoan(null)} title="Confirm Rejection">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-cred-text-secondary">
                Reason <span className="text-cred-red">*</span>
              </label>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter rejection reason…"
                className="mt-1 w-full rounded-xl border-2 border-cred-border px-4 py-3 text-sm outline-none focus:border-cred-gold"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                disabled={submitting}
                onClick={() => setRejectLoan(null)}
                className="rounded-xl border-2 border-cred-border px-6 py-3 text-sm font-semibold text-cred-text-secondary hover:bg-cred-elevated"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleReject}
                className="inline-flex items-center gap-2 rounded-xl bg-cred-red px-6 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Spinner className="h-4 w-4" /> Rejecting…
                  </>
                ) : (
                  'Reject ❌'
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

function Modal({ title, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-cred-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-cred-border px-5 py-4">
          <h3 className="font-semibold text-white">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-cred-text-muted hover:bg-cred-elevated hover:text-cred-text-secondary"
            aria-label="Close"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
