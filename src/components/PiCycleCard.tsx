import type { PiCycleBottom } from '../types'
import { DualSparkline } from './DualSparkline'
import { StatusBadge } from './StatusBadge'

const TONE = {
  'No Signal': 'neutral',
  'Approaching Bottom': 'warning',
  'Bottom Signal Active': 'good',
} as const

function formatPrice(v: number) {
  return `$${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
}

export function PiCycleCard({ data }: { data: PiCycleBottom }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <StatusBadge label={data.status} tone={TONE[data.status]} />
        <span className="text-sm tabular font-medium" style={{ color: 'var(--text-secondary)' }}>
          Gap to signal: {data.gapPct >= 0 ? '+' : ''}
          {data.gapPct.toFixed(1)}%
        </span>
      </div>

      <div className="flex items-center gap-4 mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-0.5" style={{ background: 'var(--series-blue)' }} />
          150 EMA × 0.745: <span className="tabular font-medium">{formatPrice(data.shortLine)}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-0.5" style={{ background: 'var(--text-muted)' }} />
          471 SMA: <span className="tabular font-medium">{formatPrice(data.longLine)}</span>
        </span>
      </div>

      <div className="mt-3">
        <DualSparkline points={data.series.map((p) => ({ short: p.short, long: p.long }))} width={280} height={56} />
      </div>

      <div className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
        Previous signals: {data.previousSignals.map((d) => new Date(d).toLocaleDateString()).join(', ') || 'none recorded'}
      </div>

      <p className="text-sm mt-3" style={{ color: 'var(--text-secondary)' }}>
        <strong style={{ color: 'var(--text-primary)' }}>Why it matters: </strong>
        When the short-term line crosses above the long-term line, it has historically lined up with cyclical
        Bitcoin price bottoms. A shrinking gap means the market is drifting closer to a potential signal.
      </p>

      <div className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
        Updated {new Date(data.updatedAt).toLocaleDateString()}
      </div>
    </div>
  )
}
