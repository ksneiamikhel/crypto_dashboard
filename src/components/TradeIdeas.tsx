import type { AssetCharts, TradeIdea } from '../types'
import { Sparkline } from './Sparkline'

const DIRECTION_META = {
  long: { icon: '↑', label: 'Long', color: 'var(--status-good)' },
  short: { icon: '↓', label: 'Short', color: 'var(--status-critical)' },
  neutral: { icon: '→', label: 'Neutral', color: 'var(--text-muted)' },
} as const

function formatPrice(v: number) {
  if (v >= 1000) return `$${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
  if (v >= 1) return `$${v.toFixed(2)}`
  return `$${v.toPrecision(3)}`
}

export function TradeIdeas({ items, charts }: { items: TradeIdea[]; charts: AssetCharts }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
      {items.map((trade) => {
        const meta = DIRECTION_META[trade.direction]
        const chart = charts[trade.asset]
        const chartUp = chart ? chart.changePct24h >= 0 : true
        return (
          <div
            key={trade.asset}
            className="rounded-lg p-3 flex flex-col"
            style={{ border: '1px solid var(--border)' }}
          >
            <div className="flex items-center gap-2">
              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                {trade.asset}
              </span>
              <span
                className="text-xs font-semibold px-1.5 py-0.5 rounded flex items-center gap-1"
                style={{ color: meta.color, background: 'color-mix(in srgb, ' + meta.color + ' 15%, transparent)' }}
              >
                <span aria-hidden="true">{meta.icon}</span>
                {meta.label}
              </span>
            </div>

            {chart && (
              <div className="mt-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-medium tabular" style={{ color: 'var(--text-primary)' }}>
                    {formatPrice(chart.price)}
                  </span>
                  <span
                    className="text-xs tabular font-medium"
                    style={{ color: chartUp ? 'var(--delta-good)' : 'var(--delta-bad)' }}
                  >
                    {chartUp ? '+' : ''}
                    {chart.changePct24h.toFixed(1)}%
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    24h
                  </span>
                </div>
                <Sparkline
                  points={chart.sparkline}
                  width={220}
                  height={40}
                  color={chartUp ? 'var(--delta-good)' : 'var(--delta-bad)'}
                />
              </div>
            )}

            <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
              {trade.rationale}
            </p>
          </div>
        )
      })}
    </div>
  )
}
