import Spinner from './Spinner'

const VARIANTS = {
  primary:
    'bg-gold-gradient text-black font-bold tracking-wide hover:shadow-cred-gold hover:scale-[1.02] active:scale-[0.98]',
  secondary:
    'bg-cred-elevated border border-cred-border text-white font-medium hover:border-cred-gold/50',
  outline:
    'bg-transparent border border-cred-border text-white font-medium hover:border-cred-gold hover:bg-cred-elevated',
  danger:
    'bg-red-500/10 border border-red-500/30 text-red-400 font-medium hover:bg-red-500/20',
  success:
    'bg-cred-green/10 border border-cred-green/30 text-cred-green font-medium hover:bg-cred-green/20',
  gradient:
    'bg-gold-gradient text-black font-bold tracking-wide hover:shadow-cred-gold-strong hover:scale-[1.02] active:scale-[0.98]',
}

export default function Button({
  children,
  variant = 'primary',
  loading = false,
  disabled = false,
  className = '',
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTS[variant] || VARIANTS.primary} ${className}`}
      {...props}
    >
      {loading && <Spinner className="h-5 w-5" />}
      {children}
    </button>
  )
}
