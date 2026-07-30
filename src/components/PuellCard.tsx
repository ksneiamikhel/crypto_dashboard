import type { PuellMultiple } from '../types'
import { Sparkline } from './Sparkline'
import { StatusBadge } from './StatusBadge'

const TONE = { Low: 'good', Normal: 'warning', High: 'critical' } as const
const SPARK_COLOR = { Low: 'var(--status-good)', Normal: 'var(--status-warning)', High: 'var(--status-critical)' } as const

export function PuellCard({ data }: { data: PuellMultiple }) {
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
        Puell Multiple compares the USD value of newly issued BTC to its 365-day average. Low values mean miners
        are earning far below their yearly average — historically a sign of capitulation and cycle bottoms. High
        values suggest an overheated, unsustainable issuance value.
      </p>

      <div className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
        Updated {new Date(data.updatedAt).toLocaleDateString()}
      </div>
    </div>
  )
}
