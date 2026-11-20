import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { paymentService } from '../../services/paymentService'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'
import StatGradientCard from '../../components/common/StatGradientCard'
import StatusBadge from '../../components/common/StatusBadge'
import EmptyState from '../../components/common/EmptyState'
import { SkeletonBlock } from '../../components/common/LoadingSkeleton'
import {
  BanknotesIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline'

function normalizeStatus(status) {
  return String(status || '').toUpperCase()
}

function isSuccess(status) {
  const s = normalizeStatus(status)
  return s === 'SUCCESS' || s === 'SUCCESSFUL' || s === 'COMPLETED' || s === 'PAID'
}

function isFailed(status) {
  const s = normalizeStatus(status)
  return s === 'FAILED' || s === 'FAILURE' || s === 'DECLINED'
}

export default function PaymentHistory() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true)
      try {
        const { data } = await paymentService.history()
        const list = Array.isArray(data)
          ? data
          : data?.payments || data?.content || data?.history || []
        setPayments(list)
      } catch {
        toast.error('Failed to load payment history')
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [])

  const summary = useMemo(() => {
    let totalPaid = 0
    let successful = 0
    let failed = 0
    for (const p of payments) {
      const status = p.status || p.paymentStatus
      if (isSuccess(status)) {
        successful += 1
        totalPaid += Number(p.amount || 0)
      } else if (isFailed(status)) {
        failed += 1
      }
    }
    return { totalPaid, successful, failed }
  }, [payments])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Payment History</h1>
        <p className="mt-1 text-cred-text-secondary">
          Review all your EMI payments and transaction details.
        </p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-32" />
          ))
        ) : (
          <>
            <StatGradientCard
              label="Total Paid"
              value={formatCurrency(summary.totalPaid)}
              subtitle="Lifetime payments"
              icon={BanknotesIcon}
              color="blue"
            />
            <StatGradientCard
              label="Successful"
              value={summary.successful}
              subtitle="Completed transactions"
              icon={CheckCircleIcon}
              color="emerald"
            />
            <StatGradientCard
              label="Failed"
              value={summary.failed}
              subtitle="Unsuccessful attempts"
              icon={XCircleIcon}
              color="rose"
            />
          </>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-cred-border bg-cred-card shadow-cred-card">
        <div className="border-b border-cred-border px-6 py-4">
          <h3 className="font-semibold text-white">Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="space-y-3 p-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonBlock key={i} className="h-10" />
              ))}
            </div>
          ) : payments.length === 0 ? (
            <EmptyState
              icon="💳"
              title="No payments yet"
              description="Your EMI payments will appear here"
            />
          ) : (
            <table className="w-full">
              <thead className="bg-cred-elevated">
                <tr>
                  {['Date', 'Amount', 'Mode', 'Status', 'Transaction ID'].map((h) => (
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
                {payments.map((p) => {
                  const status = p.status || p.paymentStatus
                  const success = isSuccess(status)
                  const failed = isFailed(status)
                  const badgeStatus = success ? 'SUCCESS' : failed ? 'FAILED' : status
                  const txId =
                    p.transactionRef ||
                    p.transactionId ||
                    p.reference ||
                    p.id ||
                    '—'
                  return (
                    <tr key={p.id || txId} className="transition-colors hover:bg-cred-elevated">
                      <td className="px-6 py-4 text-sm text-white">
                        {formatDate(p.paidAt || p.paymentDate || p.createdAt || p.date)}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-white">
                        {formatCurrency(p.amount)}
                      </td>
                      <td className="px-6 py-4 text-sm text-cred-text-secondary">
                        {(p.paymentMode || p.mode || '—').replace(/_/g, ' ')}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={badgeStatus} />
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-cred-text-secondary">
                        {String(txId).length > 12
                          ? `${String(txId).slice(0, 8)}…`
                          : txId}
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
