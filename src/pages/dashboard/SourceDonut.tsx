import { useMemo } from 'react'
import type { ShareItem } from '@/types/dashboard'
import './SourceDonut.css'

const colors = ['#2dd4bf', '#38bdf8', '#f59e0b', '#a78bfa']

type SourceDonutProps = {
  data: ShareItem[]
  activeName?: string | null
  onSelect: (name: string | null) => void
}

export function SourceDonut({ data, activeName, onSelect }: SourceDonutProps) {
  const slices = useMemo(() => {
    const total = data.reduce((sum, item) => sum + item.value, 0) || 1
    const r = 54
    const cx = 70
    const cy = 70

    return data.map((item, index) => {
      const prev = data.slice(0, index).reduce((sum, part) => sum + part.value, 0)
      const start = -Math.PI / 2 + (prev / total) * Math.PI * 2
      const angle = (item.value / total) * Math.PI * 2
      const end = start + angle
      const large = angle > Math.PI ? 1 : 0
      const x1 = cx + r * Math.cos(start)
      const y1 = cy + r * Math.sin(start)
      const x2 = cx + r * Math.cos(end)
      const y2 = cy + r * Math.sin(end)
      const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`
      const active = !activeName || activeName === item.name
      return {
        ...item,
        d,
        color: colors[index % colors.length],
        percent: Math.round((item.value / total) * 100),
        active,
      }
    })
  }, [data, activeName])

  function handleSelect(name: string): void {
    onSelect(activeName === name ? null : name)
  }

  return (
    <div className="donut">
      <svg viewBox="0 0 140 140" className="donut__svg" role="img" aria-label="流量来源占比">
        <circle cx="70" cy="70" r="54" fill="rgba(148,163,184,0.08)" />
        {slices.map((s) => (
          <path
            key={s.name}
            d={s.d}
            fill={s.color}
            opacity={s.active ? 0.95 : 0.22}
            className="donut__slice"
            onClick={() => handleSelect(s.name)}
          />
        ))}
        <circle cx="70" cy="70" r="30" fill="#0b1220" />
        <text x="70" y="68" textAnchor="middle" className="donut__center-label">
          来源
        </text>
        <text x="70" y="86" textAnchor="middle" className="donut__center-value">
          占比
        </text>
      </svg>
      <ul className="donut__legend">
        {slices.map((s) => (
          <li
            key={s.name}
            className={`${activeName && activeName !== s.name ? 'is-dim' : ''} ${activeName === s.name ? 'is-on' : ''}`.trim()}
            onClick={() => handleSelect(s.name)}
          >
            <i style={{ background: s.color }} />
            <span>{s.name}</span>
            <strong>{s.percent}%</strong>
          </li>
        ))}
      </ul>
    </div>
  )
}
