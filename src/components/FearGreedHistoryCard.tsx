import { useState } from 'react'
import type { FearGreedPoint } from '../types'
import { Sparkline } from './Sparkline'
import { StatusBadge } from './StatusBadge'

const TONE = {
  'Extreme Fear': 'good',
  Fear: 'good',
  Neutral: 'warning',
  Greed: 'critical',
  'Extreme Greed': 'critical',
} as const

export function FearGreedHistoryCard({ history }: { history: FearGreedPoint[] }) {
  const [range, setRange] = useState<30 | 90>(30);
  const current = history[0]
  const sliced = history.slice(0, range)
  const tone = TONE[current.classification as keyof typeof TONE] ?? 'neutral'

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-semibold tabular" style={{ color: 'var(--text-primary)' }}>
            {current.value}
          </span>
          <StatusBadge label={current.classification} tone={tone} />
        </div>
        <div className="flex gap-1">
          {([30, 90] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className="text-xs font-medium px-2 py-1 rounded-md"
              style={{
                border: '1px solid var(--border)',
                color: range === r ? 'var(--text-primary)' : 'var(--text-muted)',
                background: range === r ? 'var(--gridline)' : 'transparent',
              }}
            >
              {r}d
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3">
        <Sparkline points={[...sliced].reverse().map((p) => p.value)} width={280} height={48} />
      </div>

      <p className="text-sm mt-3" style={{ color: 'var(--text-secondary)' }}>
        <strong style={{ color: 'var(--text-primary)' }}>Why it matters: </strong>
        Extreme fear has historically been a contrarian buying opportunity, while extreme greed often precedes
        pullbacks. 0–20 Extreme Fear · 20–40 Fear · 40–60 Neutral · 60–80 Greed · 80–100 Extreme Greed.
      </p>

      <div className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
        Updated {new Date(current.timestamp).toLocaleDateString()}
      </div>
    </div>
  )
}
