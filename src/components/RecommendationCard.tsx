import type { TokenRecommendation } from '../lib/tokenRecommendation'

const ACTION_COLOR = {
  Long: 'var(--status-good)',
  Short: 'var(--status-critical)',
  Neutral: 'var(--text-muted)',
} as const

const ACTION_ICON = { Long: '↑', Short: '↓', Neutral: '→' } as const

export function RecommendationCard({ symbol, rec }: { symbol: string; rec: TokenRecommendation }) {
  const color = ACTION_COLOR[rec.action]
  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center gap-6">
        <div className="flex items-center gap-4 shrink-0">
          <div
            className="text-3xl font-semibold px-4 py-2 rounded-lg flex items-center gap-2"
            style={{ color, background: 'color-mix(in srgb, ' + color + ' 15%, transparent)' }}
          >
            <span aria-hidden="true">{ACTION_ICON[rec.action]}</span>
            {rec.action}
          </div>
          <div>
            <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {symbol} · Score {rec.score}/100
            </div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Confidence: {rec.confidence}
            </div>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {rec.breakdown.map((item) => (
            <div key={item.label}>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {item.label}
              </div>
              <div className="h-1.5 rounded-full mt-1" style={{ background: 'var(--gridline)' }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${item.score}%`,
                    background: item.score >= 65 ? 'var(--status-good)' : item.score <= 35 ? 'var(--status-critical)' : 'var(--status-warning)',
                  }}
                />
              </div>
              <div className="text-xs tabular mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                {item.score}
              </div>
            </div>
          ))}
        </div>
      </div>

      <ul className="mt-4 flex flex-col gap-1.5">
        {rec.rationale.map((line) => (
          <li key={line} className="text-sm flex gap-2" style={{ color: 'var(--text-secondary)' }}>
            <span aria-hidden="true" style={{ color: 'var(--text-muted)' }}>
              ·
            </span>
            {line}
          </li>
        ))}
      </ul>

      <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
        This is a signal aggregation, not financial advice — always confirm with your own risk management.
      </p>
    </div>
  )
}
