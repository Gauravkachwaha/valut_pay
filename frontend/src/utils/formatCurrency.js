/**
 * Format a number as Indian currency.
 * formatCurrency(200000) → "₹2,00,000"
 * formatCurrency(9414.69) → "₹9,414.69"
 */
export function formatCurrency(amount, options = {}) {
  if (amount == null || amount === '' || Number.isNaN(Number(amount))) {
    return '—'
  }

  const num = Number(amount)
  const { maximumFractionDigits, minimumFractionDigits } = options

  const hasFraction = !Number.isInteger(num)
  const maxDigits =
    maximumFractionDigits ?? (hasFraction ? 2 : 0)
  const minDigits =
    minimumFractionDigits ?? (hasFraction ? 2 : 0)

  return `₹${num.toLocaleString('en-IN', {
    maximumFractionDigits: maxDigits,
    minimumFractionDigits: minDigits,
  })}`
}

/**
 * Format a plain number with Indian grouping (no rupee symbol).
 */
export function formatIndianNumber(amount) {
  if (amount == null || amount === '' || Number.isNaN(Number(amount))) {
    return ''
  }
  return Number(amount).toLocaleString('en-IN', { maximumFractionDigits: 0 })
}

/**
 * Parse an Indian-formatted currency string back to a number.
 */
export function parseCurrencyInput(value) {
  if (value == null || value === '') return 0
  const cleaned = String(value).replace(/[₹,\s]/g, '')
  const num = Number(cleaned)
  return Number.isNaN(num) ? 0 : num
}
