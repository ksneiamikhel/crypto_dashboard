import type { Snapshot } from '../types'

function formatUsd(v: number | null) {
  if (v === null) return 'N/A'
  const sign = v >= 0 ? '+' : '-'
  const abs = Math.abs(v)
  const compact = abs >= 1e9 ? `${(abs / 1e9).toFixed(2)}B` : `${(abs / 1e6).toFixed(1)}M`
  return `${sign}$${compact}`
}

function FlowTile({ label, flow }: { label: string; flow: { netFlowUsd: number | null; trend: string } }) {
  const positive = (flow.netFlowUsd ?? 0) >= 0
  return (
    <div className="rounded-lg p-3" style={{ border: '1px solid var(--border)' }}>
      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
        {label}
      </div>
      <div
        className="text-2xl font-semibold tabular mt-0.5"
        style={{ color: positive ? 'var(--delta-good)' : 'var(--delta-bad)' }}
      >
        {formatUsd(flow.netFlowUsd)}
      </div>
      <p className="text-sm mt-1.5" style={{ color: 'var(--text-secondary)' }}>
        {flow.trend}
      </p>
    </div>
  )
}

export function EtfFlows({ etfFlows }: { etfFlows: Snapshot['etfFlows'] }) {
  return (
    <div>
      <div className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
        As of {etfFlows.asOf}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <FlowTile label="Spot BTC ETF net flow" flow={etfFlows.btc} />
        <FlowTile label="Spot ETH ETF net flow" flow={etfFlows.eth} />
      </div>
    </div>
  )
}
