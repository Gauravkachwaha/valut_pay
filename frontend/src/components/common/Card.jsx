export default function Card({ children, className = '', hover = true, section = false, ...props }) {
  const base = section
    ? 'bg-cred-card border border-cred-border rounded-2xl overflow-hidden shadow-cred-card'
    : `bg-cred-card border border-cred-border rounded-2xl p-6 shadow-cred-card ${
        hover
          ? 'hover:border-cred-gold/30 hover:shadow-cred-gold transition-all duration-300'
          : ''
      }`

  return (
    <div className={`${base} ${className}`} {...props}>
      {children}
    </div>
  )
}
