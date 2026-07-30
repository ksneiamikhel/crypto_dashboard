type Series = { short: number; long: number }

type Props = {
  points: Series[]
  width?: number
  height?: number
}

export function DualSparkline({ points, width = 260, height = 60 }: Props) {
  if (points.length < 2) return null
  const all = points.flatMap((p) => [p.short, p.long])
  const min = Math.min(...all)
  const max = Math.max(...all)
  const range = max - min || 1
  const step = width / (points.length - 1)

  const path = (key: keyof Series) =>
    points
      .map((p, i) => {
        const x = i * step
        const y = height - ((p[key] - min) / range) * height
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
      })
      .join(' ')

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-hidden="true">
      <path d={path('long')} fill="none" stroke="var(--text-muted)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <path d={path('short')} fill="none" stroke="var(--series-blue)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
