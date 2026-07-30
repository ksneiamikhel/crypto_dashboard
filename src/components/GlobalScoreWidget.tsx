import type { BullishScoreResult } from '../lib/scoring'

const BAND_TONE = {
  'Strong Buy': 'good',
  Bullish: 'good',
  Neutral: 'warning',
  Caution: 'caution',
  'High Risk': 'critical',
} as const

const BAND_COLOR = {
  'Strong Buy': 'var(--status-good)',
  Bullish: 'var(--status-good)',
  Neutral: 'var(--status-warning)',
  Caution: 'var(--status-serious)',
  'High Risk': 'var(--status-critical)',
} as const

export function GlobalScoreWidget({ result }: { result: BullishScoreResult }) {
  const color = BAND_COLOR[result.band]
  return (
    <div
      className="rounded-xl p-5"
      style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
    >
      <div className="flex flex-col md:flex-row md:items-center gap-6">
        <div className="flex items-center gap-4 shrink-0">
          <span className="text-5xl font-semibold tabular" style={{ color: 'var(--text-primary)' }}>
            {result.score}
          </span>
          <div>
            <div
              className="text-sm font-semibold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5"
              style={{ color, background: 'color-mix(in srgb, ' + color + ' 15%, transparent)' }}
            >
              {BAND_TONE[result.band] === 'good' ? '🟢' : BAND_TONE[result.band] === 'warning' ? '🟡' : BAND_TONE[result.band] === 'caution' ? '🟠' : '🔴'}
              {result.band}
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Composite bullish score (0–100)
            </div>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-2 sm:grid-cols-5 gap-3">
          {result.breakdown.map((item) => (
            <div key={item.label}>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {item.label}
              </div>
              <div className="h-1.5 rounded-full mt-1" style={{ background: 'var(--gridline)' }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${item.score}%`,
                    background: item.score >= 70 ? 'var(--status-good)' : item.score >= 40 ? 'var(--status-warning)' : 'var(--status-critical)',
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
    </div>
  )
}
