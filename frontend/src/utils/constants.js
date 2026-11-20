export const API_BASE_URL = 'http://localhost:8080/api'

export const ROLES = {
  BORROWER: 'BORROWER',
  ADMIN: 'ADMIN',
  AGENT: 'AGENT',
}

export const INTEREST_RATE = 12

export const LOAN_AMOUNT_MIN = 10000
export const LOAN_AMOUNT_MAX = 1000000

export const LOAN_PURPOSES = [
  { value: 'HOME', label: 'Home', emoji: '🏠' },
  { value: 'CAR', label: 'Car', emoji: '🚗' },
  { value: 'PERSONAL', label: 'Personal', emoji: '👤' },
  { value: 'BUSINESS', label: 'Business', emoji: '💼' },
  { value: 'EDUCATION', label: 'Education', emoji: '🎓' },
]

export const LOAN_TENURES = [6, 12, 18, 24, 36, 48, 60]

export const LOAN_STATUS_COLORS = {
  SUBMITTED: 'yellow',
  PENDING: 'yellow',
  UNDER_REVIEW: 'yellow',
  APPROVED: 'green',
  ACTIVE: 'blue',
  REJECTED: 'red',
  CLOSED: 'gray',
  NPA: 'red',
}

export const LOAN_STATUS_LABELS = {
  SUBMITTED: 'Under Review',
  PENDING: 'Under Review',
  UNDER_REVIEW: 'Under Review',
  APPROVED: 'Approved',
  ACTIVE: 'Active',
  REJECTED: 'Rejected',
  CLOSED: 'Closed',
  NPA: 'NPA',
}

export const STATUS_BADGE_CLASSES = {
  yellow: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30',
  green: 'bg-green-500/10 text-cred-green border border-green-500/30',
  blue: 'bg-blue-500/10 text-blue-400 border border-blue-500/30',
  red: 'bg-red-500/10 text-red-400 border border-red-500/30',
  gray: 'bg-white/5 text-cred-text-secondary border border-white/10',
}

export const STATUS_BADGE_BASE =
  'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium'
