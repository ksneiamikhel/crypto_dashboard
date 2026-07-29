import type { Unlock } from '../types'

function formatUsd(v: number | null) {
  if (v === null) return '—'
  if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`
  return `$${v.toLocaleString()}`
}

export function UnlocksTable({ items }: { items: Unlock[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left" style={{ color: 'var(--text-muted)' }}>
            <th className="font-medium pb-2 pr-3">Project</th>
            <th className="font-medium pb-2 pr-3">Date</th>
            <th className="font-medium pb-2 pr-3 text-right">Amount</th>
            <th className="font-medium pb-2 pr-3 text-right">% supply</th>
            <th className="font-medium pb-2">Note</th>
          </tr>
        </thead>
        <tbody>
          {items.map((u) => (
            <tr key={u.project + u.date} style={{ borderTop: '1px solid var(--gridline)' }}>
              <td className="py-2 pr-3 font-medium" style={{ color: 'var(--text-primary)' }}>
                {u.project}
              </td>
              <td className="py-2 pr-3 tabular" style={{ color: 'var(--text-secondary)' }}>
                {u.date}
              </td>
              <td className="py-2 pr-3 tabular text-right" style={{ color: 'var(--text-primary)' }}>
                {formatUsd(u.amountUsd)}
              </td>
              <td className="py-2 pr-3 tabular text-right" style={{ color: 'var(--text-secondary)' }}>
                {u.percentOfSupply !== null ? `${u.percentOfSupply.toFixed(2)}%` : '—'}
              </td>
              <td className="py-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                {u.note ?? ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
