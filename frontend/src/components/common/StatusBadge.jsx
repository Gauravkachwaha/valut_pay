import { LOAN_STATUS_LABELS } from '../../utils/constants'

const CONFIG = {
  SUBMITTED: {
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    text: 'text-yellow-400',
    dot: 'bg-yellow-400',
  },
  PENDING: {
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    text: 'text-yellow-400',
    dot: 'bg-yellow-400',
  },
  UNDER_REVIEW: {
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    text: 'text-yellow-400',
    dot: 'bg-yellow-400',
  },
  APPROVED: {
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    text: 'text-cred-green',
    dot: 'bg-cred-green',
  },
  ACTIVE: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    dot: 'bg-blue-400',
  },
  REJECTED: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    text: 'text-red-400',
    dot: 'bg-red-400',
  },
  CLOSED: {
    bg: 'bg-white/5',
    border: 'border-white/10',
    text: 'text-cred-text-secondary',
    dot: 'bg-cred-text-muted',
  },
  NPA: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    text: 'text-red-400',
    dot: 'bg-red-400',
  },
  SUCCESS: {
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    text: 'text-cred-green',
    dot: 'bg-cred-green',
  },
  FAILED: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    text: 'text-red-400',
    dot: 'bg-red-400',
  },
}

export default function StatusBadge({ status, label }) {
  const key = (status || '').toUpperCase()
  const c = CONFIG[key] || CONFIG.ACTIVE
  const display = label || LOAN_STATUS_LABELS[key] || status || 'Unknown'

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${c.bg} ${c.border} ${c.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {display}
    </span>
  )
}
