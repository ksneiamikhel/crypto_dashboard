import type { FearGreedPoint } from '../types'

function statusColor(value: number) {
  if (value <= 24) return 'var(--status-critical)'
  if (value <= 44) return 'var(--status-serious)'
  if (value <= 55) return 'var(--status-warning)'
  return 'var(--status-good)'
}

export function FearGreedMeter({ history }: { history: FearGreedPoint[] }) {
  const current = history[0]
  if (!current) return null
  const color = statusColor(current.value)

  return (
    <div>
      <div className="flex items-baseline gap-3">
        <span className="text-4xl font-semibold tabular" style={{ color: 'var(--text-primary)' }}>
          {current.value}
        </span>
        <span
          className="text-sm font-medium px-2 py-0.5 rounded-full"
          style={{ color, background: 'color-mix(in srgb, ' + color + ' 15%, transparent)' }}
        >
          {current.classification}
        </span>
      </div>
      <div
        className="mt-3 h-2 rounded-full relative overflow-hidden"
        style={{ background: 'var(--series-blue-track)' }}
        role="img"
        aria-label={`Fear and greed index ${current.value} of 100, ${current.classification}`}
      >
        <div
          className="h-full rounded-full"
          style={{ width: `${current.value}%`, background: color }}
        />
      </div>
      <div className="flex justify-between mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
        <span>0 · Extreme fear</span>
        <span>100 · Extreme greed</span>
      </div>
    </div>
  )
}
