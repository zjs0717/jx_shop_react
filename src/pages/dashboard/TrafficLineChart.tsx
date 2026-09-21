import { useMemo, useState } from 'react'
import type { MouseEvent } from 'react'
import type { DashboardModule, TrafficPoint } from '@/types/dashboard'
import './TrafficLineChart.css'

const width = 640
const height = 220
const pad = { top: 16, right: 16, bottom: 28, left: 40 }

const series = [
  { key: 'shop' as const, color: '#2dd4bf', label: '购物' },
  { key: 'video' as const, color: '#38bdf8', label: '短视频' },
  { key: 'live' as const, color: '#f59e0b', label: '直播' },
]

type ChartPath = {
  key: string
  color: string
  d: string
  area: string
  active: boolean
}

type ChartHover = {
  x: number
  items: { label: string; color: string; value: number }[]
  time: string
}

type TrafficLineChartProps = {
  data: TrafficPoint[]
  focusModule?: DashboardModule | null
  onSelectModule: (module: DashboardModule | null) => void
}

export function TrafficLineChart({ data, focusModule, onSelectModule }: TrafficLineChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  const chart = useMemo(() => {
    const points = data
    if (!points.length) {
      return {
        paths: [] as ChartPath[],
        ticks: [] as string[],
        yTicks: [] as number[],
        hover: null as ChartHover | null,
      }
    }

    const values = points.flatMap((p) => [p.shop, p.video, p.live])
    const max = Math.max(...values, 1)
    const min = 0
    const innerW = width - pad.left - pad.right
    const innerH = height - pad.top - pad.bottom

    const xAt = (i: number) => pad.left + (i / Math.max(points.length - 1, 1)) * innerW
    const yAt = (v: number) => pad.top + innerH - ((v - min) / (max - min)) * innerH

    const paths = series.map((s) => {
      const active = !focusModule || focusModule === s.key
      const line = points
        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i).toFixed(1)} ${yAt(p[s.key]).toFixed(1)}`)
        .join(' ')
      const area = `${line} L ${xAt(points.length - 1).toFixed(1)} ${(pad.top + innerH).toFixed(1)} L ${xAt(0).toFixed(1)} ${(pad.top + innerH).toFixed(1)} Z`
      return { key: s.key, color: s.color, d: line, area, active }
    })

    const tickIdx = [0, Math.floor((points.length - 1) / 2), points.length - 1]
    const ticks = tickIdx.map((i) => points[i]?.time ?? '')
    const yTicks = [max, Math.round(max / 2), 0]

    let hover: ChartHover | null = null
    if (hoverIndex != null && points[hoverIndex]) {
      const p = points[hoverIndex]
      hover = {
        x: xAt(hoverIndex),
        time: p.time,
        items: series.map((s) => ({ label: s.label, color: s.color, value: p[s.key] })),
      }
    }

    return { paths, ticks, yTicks, hover }
  }, [data, focusModule, hoverIndex])

  function onMove(e: MouseEvent<SVGSVGElement>): void {
    const svg = e.currentTarget
    const rect = svg.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    const idx = Math.round(ratio * Math.max(data.length - 1, 0))
    setHoverIndex(Math.max(0, Math.min(data.length - 1, idx)))
  }

  function onLeave(): void {
    setHoverIndex(null)
  }

  function toggleSeries(key: DashboardModule): void {
    onSelectModule(focusModule === key ? null : key)
  }

  return (
    <div className="line-chart">
      <div className="line-chart__legend">
        {series.map((s) => (
          <button
            key={s.key}
            type="button"
            className={`line-chart__legend-item${focusModule && focusModule !== s.key ? ' is-dim' : ''}${focusModule === s.key ? ' is-on' : ''}`}
            onClick={() => toggleSeries(s.key)}
          >
            <i style={{ background: s.color }} />
            {s.label}
          </button>
        ))}
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="line-chart__svg"
        role="img"
        aria-label="流量趋势"
        onMouseMove={onMove}
        onMouseLeave={onLeave}
      >
        <defs>
          {series.map((s) => (
            <linearGradient key={`g-${s.key}`} id={`fill-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity="0.28" />
              <stop offset="100%" stopColor={s.color} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>
        {chart.yTicks.map((_, idx) => (
          <line
            key={`y-${idx}`}
            x1={pad.left}
            x2={width - pad.right}
            y1={pad.top + ((height - pad.top - pad.bottom) * idx) / Math.max(chart.yTicks.length - 1, 1)}
            y2={pad.top + ((height - pad.top - pad.bottom) * idx) / Math.max(chart.yTicks.length - 1, 1)}
            className="line-chart__grid"
          />
        ))}
        {chart.paths.map((p) => (
          <path
            key={`a-${p.key}`}
            d={p.area}
            fill={`url(#fill-${p.key})`}
            opacity={p.active ? 1 : 0.12}
          />
        ))}
        {chart.paths.map((p) => (
          <path
            key={p.key}
            d={p.d}
            fill="none"
            stroke={p.color}
            strokeWidth={p.active && focusModule === p.key ? 3.2 : 2.4}
            opacity={p.active ? 1 : 0.18}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
        {chart.hover ? (
          <>
            <line
              x1={chart.hover.x}
              x2={chart.hover.x}
              y1={pad.top}
              y2={height - pad.bottom}
              className="line-chart__cross"
            />
            <foreignObject x={Math.min(chart.hover.x + 8, width - 130)} y="18" width="120" height="78">
              <div className="line-chart__tip">
                <strong>{chart.hover.time}</strong>
                {chart.hover.items.map((item) => (
                  <p key={item.label}>
                    <i style={{ background: item.color }} />
                    {item.label} {item.value}
                  </p>
                ))}
              </div>
            </foreignObject>
          </>
        ) : null}
        {chart.ticks.map((t, idx) => (
          <text
            key={`x-${idx}`}
            x={pad.left + ((width - pad.left - pad.right) * idx) / Math.max(chart.ticks.length - 1, 1)}
            y={height - 8}
            className="line-chart__axis"
            textAnchor="middle"
          >
            {t}
          </text>
        ))}
      </svg>
    </div>
  )
}
