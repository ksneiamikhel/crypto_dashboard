import type { TradeIdea } from '../types'

const DIRECTION_META = {
  long: { icon: '↑', label: 'Long', color: 'var(--status-good)' },
  short: { icon: '↓', label: 'Short', color: 'var(--status-critical)' },
  neutral: { icon: '→', label: 'Neutral', color: 'var(--text-muted)' },
} as const

export function TradeIdeas({ items }: { items: TradeIdea[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {items.map((trade) => {
        const meta = DIRECTION_META[trade.direction]
        return (
          <div
            key={trade.asset}
            className="rounded-lg p-3"
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
            <p className="text-sm mt-1.5" style={{ color: 'var(--text-secondary)' }}>
              {trade.rationale}
            </p>
          </div>
        )
      })}
    </div>
  )
}
