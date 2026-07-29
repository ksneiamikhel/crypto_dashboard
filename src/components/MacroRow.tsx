import type { MacroData } from '../types'
import { Sparkline } from './Sparkline'

const LABELS: Record<keyof MacroData, string> = {
  dxy: 'US Dollar Index',
  us10y: 'US 10Y Yield',
  sp500: 'S&P 500',
  btc: 'BTC / USD',
  eth: 'ETH / USD',
}

function formatValue(key: keyof MacroData, value: number) {
  if (key === 'us10y') return `${value.toFixed(2)}%`
  if (key === 'dxy') return value.toFixed(2)
  return value >= 1000 ? `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : `$${value.toFixed(2)}`
}

export function MacroRow({ macro }: { macro: MacroData }) {
  const keys = Object.keys(LABELS) as (keyof MacroData)[]
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {keys.map((key) => {
        const quote = macro[key]
        if (!quote) {
          return (
            <div key={key} className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {LABELS[key]} unavailable
            </div>
          )
        }
        const up = quote.changePct >= 0
        return (
          <div key={key}>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {LABELS[key]}
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-lg font-semibold tabular" style={{ color: 'var(--text-primary)' }}>
                {formatValue(key, quote.price)}
              </span>
              <span
                className="text-xs font-medium tabular"
                style={{ color: up ? 'var(--delta-good)' : 'var(--delta-bad)' }}
              >
                {up ? '+' : ''}
                {quote.changePct.toFixed(2)}%
              </span>
            </div>
            <div className="mt-1">
              <Sparkline points={quote.points.map((p) => p.value)} width={110} height={26} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
