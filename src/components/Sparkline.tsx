type Props = {
  points: number[]
  width?: number
  height?: number
  color?: string
}

export function Sparkline({ points, width = 96, height = 28, color = 'var(--series-blue)' }: Props) {
  if (points.length < 2) return null
  const min = Math.min(...points)
  const max = Math.max(...points)
  const range = max - min || 1
  const step = width / (points.length - 1)
  const coords = points.map((v, i) => {
    const x = i * step
    const y = height - ((v - min) / range) * height
    return [x, y]
  })
  const linePath = coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const areaPath = `${linePath} L${width},${height} L0,${height} Z`

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-hidden="true">
      <path d={areaPath} fill={color} opacity={0.1} stroke="none" />
      <path d={linePath} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
