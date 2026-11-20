// Normalizes whatever shape the backend sends for a user's role
// e.g. "ROLE_BORROWER", "borrower", ["ROLE_ADMIN"], { name: 'ADMIN' } -> "BORROWER"/"ADMIN"
export function normalizeRole(role) {
  let value = role

  if (Array.isArray(value)) value = value[0]
  if (value && typeof value === 'object') {
    value = value.name ?? value.role ?? value.authority ?? value.value
  }
  if (typeof value !== 'string') return null

  return value.trim().toUpperCase().replace(/^ROLE_/, '')
}

export function hasRole(role, allowed) {
  if (!allowed || allowed.length === 0) return true
  const current = normalizeRole(role)
  return allowed.some((r) => normalizeRole(r) === current)
}
