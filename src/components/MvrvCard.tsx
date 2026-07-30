import type { MvrvZScore } from '../types'
import { Sparkline } from './Sparkline'
import { StatusBadge } from './StatusBadge'

const TONE = { Undervalued: 'good', Neutral: 'warning', Overvalued: 'critical' } as const
const SPARK_COLOR = { Undervalued: 'var(--status-good)', Neutral: 'var(--status-warning)', Overvalued: 'var(--status-critical)' } as const

export function MvrvCard({ data }: { data: MvrvZScore }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-semibold tabular" style={{ color: 'var(--text-primary)' }}>
            {data.current.toFixed(2)}
          </span>
          <StatusBadge label={data.status} tone={TONE[data.status]} />
        </div>
        <StatusBadge label={data.signal} tone={TONE[data.status]} />
      </div>

      <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
        Historical range: {data.historyRange.min.toFixed(2)} to {data.historyRange.max.toFixed(2)}
      </div>

      <div className="mt-3">
        <Sparkline points={data.series.map((p) => p.value)} width={280} height={48} color={SPARK_COLOR[data.status]} />
      </div>

      <p className="text-sm mt-3" style={{ color: 'var(--text-secondary)' }}>
        <strong style={{ color: 'var(--text-primary)' }}>Why it matters: </strong>
        MVRV Z-Score compares Bitcoin's market cap to its realized cap (the aggregate cost basis of all coins).
        Low/negative readings have historically marked accumulation zones near cycle bottoms; high readings have
        coincided with euphoric tops.
      </p>

      <div className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
        Updated {new Date(data.updatedAt).toLocaleDateString()}
      </div>
    </div>
  )
}
