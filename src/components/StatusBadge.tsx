type Tone = 'good' | 'warning' | 'caution' | 'critical' | 'neutral'

const TONE_COLOR: Record<Tone, string> = {
  good: 'var(--status-good)',
  warning: 'var(--status-warning)',
  caution: 'var(--status-serious)',
  critical: 'var(--status-critical)',
  neutral: 'var(--text-muted)',
}

const TONE_ICON: Record<Tone, string> = {
  good: '🟢',
  warning: '🟡',
  caution: '🟠',
  critical: '🔴',
  neutral: '⚪',
}

export function StatusBadge({ label, tone }: { label: string; tone: Tone }) {
  const color = TONE_COLOR[tone]
  return (
    <span
      className="text-xs font-semibold px-2 py-1 rounded-full inline-flex items-center gap-1.5 whitespace-nowrap"
      style={{ color, background: 'color-mix(in srgb, ' + color + ' 15%, transparent)' }}
    >
      <span aria-hidden="true">{TONE_ICON[tone]}</span>
      {label}
    </span>
  )
}
