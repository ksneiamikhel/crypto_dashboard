import type { TvlMover } from '../types'

function formatUsd(v: number) {
  if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`
  if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`
  return `$${v.toFixed(0)}`
}

function MoverRow({ mover, color, maxAbs }: { mover: TvlMover; color: string; maxAbs: number }) {
  const pct = (Math.abs(mover.change1d) / maxAbs) * 100
  return (
    <a
      href={mover.url}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-3 py-1.5 group"
    >
      <div className="w-28 shrink-0 text-sm truncate" style={{ color: 'var(--text-primary)' }}>
        {mover.name}
      </div>
      <div className="flex-1 h-4 rounded-sm relative" style={{ background: 'var(--gridline)' }}>
        <div
          className="h-full rounded-sm"
          style={{ width: `${Math.max(pct, 4)}%`, background: color }}
        />
      </div>
      <div className="w-16 text-right text-sm tabular font-medium shrink-0" style={{ color: 'var(--text-secondary)' }}>
        {mover.change1d > 0 ? '+' : ''}
        {mover.change1d.toFixed(1)}%
      </div>
    </a>
  )
}

export function TvlMovers({ gainers, losers }: { gainers: TvlMover[]; losers: TvlMover[] }) {
  const maxGain = Math.max(...gainers.map((g) => Math.abs(g.change1d)), 1)
  const maxLoss = Math.max(...losers.map((l) => Math.abs(l.change1d)), 1)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>
          Top TVL gainers (24h)
        </h3>
        {gainers.map((g) => (
          <MoverRow key={g.name} mover={g} color="var(--series-blue)" maxAbs={maxGain} />
        ))}
      </div>
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>
          Top TVL losers (24h)
        </h3>
        {losers.map((l) => (
          <MoverRow key={l.name} mover={l} color="var(--series-red)" maxAbs={maxLoss} />
        ))}
      </div>
    </div>
  )
}

export { formatUsd }
