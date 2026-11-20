import { useState } from 'react'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

export function AuthField({
  id,
  label,
  type = 'text',
  autoComplete,
  error,
  registerProps,
  rightSlot,
}) {
  return (
    <div className="mb-5">
      <label
        htmlFor={id}
        className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-cred-text-muted"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          autoComplete={autoComplete}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`w-full rounded-xl border bg-cred-elevated/80 px-4 py-3.5 text-sm text-white outline-none transition-all placeholder:text-cred-text-muted ${
            rightSlot ? 'pr-12' : ''
          } ${
            error
              ? 'border-cred-red/70 focus:border-cred-red focus:ring-2 focus:ring-cred-red/20'
              : 'border-cred-border focus:border-cred-gold/70 focus:ring-2 focus:ring-cred-gold/20'
          }`}
          {...registerProps}
        />
        {rightSlot}
      </div>
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-cred-red"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 shrink-0">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
            <path
              d="M12 8v4.5M12 16h.01"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          {error.message}
        </p>
      )}
    </div>
  )
}

export function PasswordToggle({ visible, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-cred-text-muted transition hover:bg-white/5 hover:text-cred-gold"
      aria-label={visible ? 'Hide password' : 'Show password'}
    >
      {visible ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
    </button>
  )
}

export function usePasswordVisibility() {
  const [visible, setVisible] = useState(false)
  return {
    visible,
    type: visible ? 'text' : 'password',
    toggle: () => setVisible((v) => !v),
  }
}

const LEVELS = [
  { label: 'Weak', color: 'bg-cred-red' },
  { label: 'Fair', color: 'bg-cred-gold' },
  { label: 'Good', color: 'bg-cred-gold-light' },
  { label: 'Strong', color: 'bg-cred-green' },
]

export function PasswordStrength({ value = '' }) {
  if (!value) return null

  let score = 0
  if (value.length >= 8) score += 1
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score += 1
  if (/\d/.test(value)) score += 1
  if (/[^A-Za-z0-9]/.test(value)) score += 1

  const index = Math.max(0, score - 1)
  const level = LEVELS[index]

  return (
    <div className="-mt-2 mb-5">
      <div className="flex gap-1.5">
        {LEVELS.map((_, i) => (
          <span
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= index ? level.color : 'bg-cred-border'
            }`}
          />
        ))}
      </div>
      <p className="mt-1.5 text-[11px] text-cred-text-muted">
        Password strength: <span className="font-semibold text-white">{level.label}</span>
      </p>
    </div>
  )
}
