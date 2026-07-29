import { useMemo, useRef, useState } from 'react'
import type { TvlPoint } from '../types'

type Props = {
  points: TvlPoint[]
  width?: number
  height?: number
}

function formatUsd(v: number) {
  if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`
  if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`
  return `$${v.toFixed(0)}`
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function TvlChart({ points, width = 640, height = 220 }: Props) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const padding = { top: 12, right: 12, bottom: 24, left: 12 }
  const innerW = width - padding.left - padding.right
  const innerH = height - padding.top - padding.bottom

  const { linePath, areaPath, coords, min, max } = useMemo(() => {
    if (points.length < 2) return { linePath: '', areaPath: '', coords: [] as { x: number; y: number }[], min: 0, max: 0 }
    const values = points.map((p) => p.tvl)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const range = max - min || 1
    const step = innerW / (points.length - 1)
    const coords = points.map((p, i) => ({
      x: padding.left + i * step,
      y: padding.top + innerH - ((p.tvl - min) / range) * innerH,
    }))
    const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ')
    const areaPath = `${linePath} L${coords[coords.length - 1].x.toFixed(1)},${padding.top + innerH} L${padding.left},${padding.top + innerH} Z`
    return { linePath, areaPath, coords, min, max }
  }, [points, innerW, innerH, padding.left, padding.top])

  if (points.length < 2 || coords.length === 0) return null

  function handleMove(e: React.PointerEvent<SVGSVGElement>) {
    const svg = svgRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const scaleX = width / rect.width
    const x = (e.clientX - rect.left) * scaleX
    const step = innerW / (points.length - 1)
    const idx = Math.round((x - padding.left) / step)
    setHoverIndex(Math.min(Math.max(idx, 0), points.length - 1))
  }

  const hovered = hoverIndex !== null ? coords[hoverIndex] : null
  const hoveredPoint = hoverIndex !== null ? points[hoverIndex] : null

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        width="100%"
        viewBox={`0 0 ${width} ${height}`}
        onPointerMove={handleMove}
        onPointerLeave={() => setHoverIndex(null)}
        role="img"
        aria-label="Global DeFi TVL over the trailing period"
      >
        <line
          x1={padding.left}
          x2={width - padding.right}
          y1={padding.top + innerH}
          y2={padding.top + innerH}
          stroke="var(--baseline)"
          strokeWidth={1}
        />
        <path d={areaPath} fill="var(--series-blue)" opacity={0.1} stroke="none" />
        <path d={linePath} fill="none" stroke="var(--series-blue)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        {hovered && (
          <>
            <line
              x1={hovered.x}
              x2={hovered.x}
              y1={padding.top}
              y2={padding.top + innerH}
              stroke="var(--gridline)"
              strokeWidth={1}
            />
            <circle cx={hovered.x} cy={hovered.y} r={5} fill="var(--series-blue)" stroke="var(--surface-1)" strokeWidth={2} />
          </>
        )}
        <text x={padding.left} y={height - 6} fontSize={11} fill="var(--text-muted)">
          {formatUsd(min)}
        </text>
        <text x={width - padding.right} y={height - 6} fontSize={11} fill="var(--text-muted)" textAnchor="end">
          {formatUsd(max)}
        </text>
      </svg>
      {hovered && hoveredPoint && (
        <div
          className="absolute px-2.5 py-1.5 rounded-md text-xs pointer-events-none"
          style={{
            left: Math.min(Math.max((hovered.x / width) * 100, 8), 88) + '%',
            top: 0,
            background: 'var(--surface-1)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
            transform: 'translate(-50%, 0)',
          }}
        >
          <div className="font-semibold tabular">{formatUsd(hoveredPoint.tvl)}</div>
          <div style={{ color: 'var(--text-secondary)' }}>{formatDate(hoveredPoint.date)}</div>
        </div>
      )}
    </div>
  )
}
