export default function ProgressRing({
  value = 0,
  size = 64,
  stroke = 6,
  label,
  sublabel,
  tone = 'gold',
}) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0))
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (pct / 100) * circumference

  const TONES = {
    gold: 'stroke-cred-gold',
    green: 'stroke-cred-green',
    red: 'stroke-cred-red',
    purple: 'stroke-cred-purple',
    muted: 'stroke-cred-text-muted',
  }
  const ringClass = TONES[tone] || TONES.gold

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-white/10"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`${ringClass} transition-[stroke-dashoffset] duration-700 ease-out`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xs font-bold leading-none text-white">
          {label ?? `${pct}%`}
        </span>
        {sublabel && (
          <span className="mt-0.5 text-[10px] leading-none text-cred-text-muted">{sublabel}</span>
        )}
      </div>
    </div>
  )
}
