import type { TokenAnalysis } from '../types'
import { StatusBadge } from './StatusBadge'

const TONE = { Overbought: 'caution', Oversold: 'caution', Bullish: 'good', Bearish: 'critical' } as const

export function MomentumCard({ data }: { data: TokenAnalysis }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <span className="text-2xl font-semibold tabular" style={{ color: 'var(--text-primary)' }}>
            RSI {data.rsi14.toFixed(1)}
          </span>
        </div>
        <StatusBadge label={data.momentum} tone={TONE[data.momentum]} />
      </div>

      <div className="h-1.5 rounded-full mt-2" style={{ background: 'var(--gridline)' }}>
        <div
          className="h-full rounded-full"
          style={{
            width: `${data.rsi14}%`,
            background: data.rsi14 >= 70 ? 'var(--status-serious)' : data.rsi14 <= 30 ? 'var(--status-serious)' : 'var(--series-blue)',
          }}
        />
      </div>
      <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
        <span>0 · Oversold</span>
        <span>100 · Overbought</span>
      </div>

      <div className="flex items-center gap-4 mt-4 text-sm tabular">
        <span style={{ color: 'var(--text-secondary)' }}>MACD line: {data.macd.line.toFixed(2)}</span>
        <span style={{ color: 'var(--text-secondary)' }}>Signal: {data.macd.signal.toFixed(2)}</span>
        <span style={{ color: data.macd.histogram >= 0 ? 'var(--delta-good)' : 'var(--delta-bad)' }}>
          Histogram: {data.macd.histogram >= 0 ? '+' : ''}
          {data.macd.histogram.toFixed(2)}
        </span>
      </div>
    </div>
  )
}
