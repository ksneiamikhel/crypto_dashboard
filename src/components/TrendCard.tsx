import type { TokenAnalysis } from '../types'
import { Sparkline } from './Sparkline'
import { StatusBadge } from './StatusBadge'

const TONE = { Bullish: 'good', Mixed: 'warning', Bearish: 'critical' } as const
const SPARK_COLOR = { Bullish: 'var(--status-good)', Mixed: 'var(--status-warning)', Bearish: 'var(--status-critical)' } as const

function formatPrice(v: number) {
  return v >= 1 ? `$${v.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : `$${v.toPrecision(4)}`
}

export function TrendCard({ data }: { data: TokenAnalysis }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-2xl font-semibold tabular" style={{ color: 'var(--text-primary)' }}>
          {formatPrice(data.price)}
        </span>
        <StatusBadge label={data.trend} tone={TONE[data.trend]} />
      </div>

      <div className="flex gap-4 mt-2 text-xs tabular" style={{ color: 'var(--text-muted)' }}>
        <span>EMA20: {formatPrice(data.ema20)}</span>
        <span>EMA50: {formatPrice(data.ema50)}</span>
      </div>

      <div className="mt-3">
        <Sparkline points={data.series.map((p) => p.close)} width={280} height={48} color={SPARK_COLOR[data.trend]} />
      </div>

      <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
        1h close price, last {data.series.length} candles
      </p>
    </div>
  )
}
