import type { TokenAnalysis } from '../types'
import { StatusBadge } from './StatusBadge'

const TONE = { Bullish: 'good', Neutral: 'warning', Bearish: 'critical' } as const

export function PositioningRiskCard({ data }: { data: TokenAnalysis }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <div>
        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Funding rate (8h-equivalent)
        </div>
        {data.funding ? (
          <>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xl font-semibold tabular" style={{ color: 'var(--text-primary)' }}>
                {data.funding.currentPct >= 0 ? '+' : ''}
                {data.funding.currentPct.toFixed(4)}%
              </span>
              <StatusBadge label={data.funding.status} tone={TONE[data.funding.status]} />
            </div>
            <p className="text-sm mt-1.5" style={{ color: 'var(--text-secondary)' }}>
              Negative funding means shorts are paying longs (short-squeeze risk); positive means longs are crowded
              (long-squeeze risk).
            </p>
          </>
        ) : (
          <div className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Unavailable for this asset
          </div>
        )}
      </div>

      <div>
        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
          ATR (14, 1h)
        </div>
        <div className="text-xl font-semibold tabular mt-1" style={{ color: 'var(--text-primary)' }}>
          {data.atrPct.toFixed(2)}%
        </div>
        <p className="text-sm mt-1.5" style={{ color: 'var(--text-secondary)' }}>
          Typical 1h price swing. Use as a starting point for stop-loss distance — e.g. 1–1.5× ATR beyond entry.
        </p>
      </div>
    </div>
  )
}
