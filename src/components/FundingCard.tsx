import type { FundingRate } from '../types'
import { Sparkline } from './Sparkline'
import { StatusBadge } from './StatusBadge'

const TONE = { Bullish: 'good', Neutral: 'warning', Bearish: 'critical' } as const
const SPARK_COLOR = { Bullish: 'var(--status-good)', Neutral: 'var(--status-warning)', Bearish: 'var(--status-critical)' } as const

export function FundingCard({ data }: { data: FundingRate }) {
  return (
    <div className="rounded-lg p-3" style={{ border: '1px solid var(--border)' }}>
      <div className="flex items-center justify-between">
        <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
          {data.symbol}
        </span>
        <StatusBadge label={data.status} tone={TONE[data.status]} />
      </div>

      <div className="flex items-baseline gap-3 mt-1.5">
        <span className="text-xl font-semibold tabular" style={{ color: 'var(--text-primary)' }}>
          {data.currentPct >= 0 ? '+' : ''}
          {data.currentPct.toFixed(4)}%
        </span>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          24h avg {data.avg24hPct >= 0 ? '+' : ''}
          {data.avg24hPct.toFixed(4)}%
        </span>
      </div>

      <div className="mt-2">
        <Sparkline points={data.series.map((p) => p.ratePct)} width={220} height={36} color={SPARK_COLOR[data.status]} />
      </div>

      <div className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
        {data.signal}
      </div>
    </div>
  )
}
