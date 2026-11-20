export default function LoadingSkeleton({ lines = 3, className = '' }) {
  const widths = ['w-3/4', 'w-1/2', 'w-5/6', 'w-2/3', 'w-full']

  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`mb-3 h-4 rounded-full bg-cred-elevated last:mb-0 ${widths[i % widths.length]}`}
        />
      ))}
    </div>
  )
}

export function SkeletonBlock({ className = '' }) {
  return <div className={`animate-pulse rounded-xl bg-cred-elevated ${className}`} />
}
