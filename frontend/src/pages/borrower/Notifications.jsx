import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { notificationService } from '../../services/notificationService'
import { timeAgo } from '../../utils/formatDate'
import EmptyState from '../../components/common/EmptyState'
import { SkeletonBlock } from '../../components/common/LoadingSkeleton'
import Button from '../../components/common/Button'

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'loans', label: 'Loans' },
  { id: 'payments', label: 'Payments' },
]

const TYPE_META = {
  LOAN_APPLIED: { icon: '📋', color: 'text-cred-gold' },
  LOAN_APPROVED: { icon: '✅', color: 'text-cred-green' },
  LOAN_REJECTED: { icon: '❌', color: 'text-cred-red' },
  PAYMENT_SUCCESS: { icon: '💰', color: 'text-cred-green' },
  PAYMENT_FAILED: { icon: '❌', color: 'text-cred-red' },
}

function isRead(n) {
  return n.read === true || n.isRead === true || n.status === 'READ'
}

function isLoanType(type) {
  return String(type || '').toUpperCase().startsWith('LOAN')
}

function isPaymentType(type) {
  return String(type || '').toUpperCase().startsWith('PAYMENT')
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all')
  const [marking, setMarking] = useState(null)

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const { data } = await notificationService.getAll()
      const list = Array.isArray(data)
        ? data
        : data?.notifications || data?.content || []
      setNotifications(list)
    } catch {
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      const type = n.type || n.notificationType
      if (tab === 'unread') return !isRead(n)
      if (tab === 'loans') return isLoanType(type)
      if (tab === 'payments') return isPaymentType(type)
      return true
    })
  }, [notifications, tab])

  const counts = useMemo(
    () => ({
      all: notifications.length,
      unread: notifications.filter((n) => !isRead(n)).length,
      loans: notifications.filter((n) => isLoanType(n.type || n.notificationType)).length,
      payments: notifications.filter((n) => isPaymentType(n.type || n.notificationType)).length,
    }),
    [notifications]
  )

  const handleMarkRead = async (id) => {
    setMarking(id)
    try {
      await notificationService.markRead(id)
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, read: true, isRead: true, status: 'READ' } : n
        )
      )
    } catch {
      toast.error('Failed to mark as read')
    } finally {
      setMarking(null)
    }
  }

  const handleMarkAll = async () => {
    setMarking('all')
    try {
      await notificationService.markAllRead()
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true, isRead: true, status: 'READ' }))
      )
      toast.success('All notifications marked as read')
    } catch {
      toast.error('Failed to mark all as read')
    } finally {
      setMarking(null)
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          <p className="mt-1 text-cred-text-secondary">Stay updated with loan and payment alerts.</p>
        </div>
        <Button
          variant="outline"
          disabled={marking === 'all' || notifications.length === 0}
          onClick={handleMarkAll}
          loading={marking === 'all'}
          className="px-4 py-2 text-sm"
        >
          Mark All Read
        </Button>
      </div>

      <div className="mb-6 flex flex-wrap gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`inline-flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2 text-sm transition-all duration-200 ${
              tab === t.id
                ? 'border-transparent bg-gold-gradient font-bold text-black shadow-cred-gold'
                : 'border-cred-border bg-cred-card font-medium text-cred-text-secondary hover:border-cred-gold/40 hover:text-white'
            }`}
          >
            {t.label}
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                tab === t.id ? 'bg-black/15 text-black' : 'bg-cred-elevated text-cred-text-muted'
              }`}
            >
              {counts[t.id]}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-20" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-cred-border bg-cred-card shadow-cred-card">
          <EmptyState icon="🔔" title="No notifications" description="You're all caught up" />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((n) => {
            const type = n.type || n.notificationType
            const meta = TYPE_META[type] || { icon: '🔔', color: 'text-cred-text-secondary' }
            const read = isRead(n)
            return (
              <div
                key={n.id}
                className={`rounded-2xl border border-cred-border p-6 shadow-cred-card transition-all duration-200 hover:border-cred-gold/30 ${
                  read
                    ? 'bg-cred-elevated'
                    : 'border border-cred-border border-l-4 border-l-cred-gold bg-cred-card'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cred-border bg-cred-elevated text-lg ${meta.color}`}>{meta.icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-white">
                          {n.title || n.subject || type}
                        </p>
                        <p className="mt-0.5 text-sm text-cred-text-secondary">
                          {n.message || n.body || n.content}
                        </p>
                        <p className="mt-1 text-xs text-cred-text-muted">
                          {timeAgo(n.createdAt || n.timestamp || n.date)}
                        </p>
                      </div>
                      {!read && (
                        <button
                          type="button"
                          disabled={marking === n.id}
                          onClick={() => handleMarkRead(n.id)}
                          className="shrink-0 rounded-xl border-2 border-cred-border bg-cred-card px-3 py-1.5 text-xs font-semibold text-cred-text-secondary hover:bg-cred-elevated disabled:opacity-50"
                        >
                          Mark Read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
