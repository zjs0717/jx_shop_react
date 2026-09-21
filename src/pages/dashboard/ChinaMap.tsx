import { useEffect, useMemo, useRef, useState } from 'react'
import * as echarts from 'echarts'
import type { DashboardModule, RegionPoint } from '@/types/dashboard'
import { formatNumber, moduleLabel } from '@/utils/format'
import './ChinaMap.css'

const colors: Record<string, string> = {
  shop: '#2dd4bf',
  video: '#38bdf8',
  live: '#f59e0b',
}

const PROVINCE_NAME_MAP: Record<string, string> = {
  北京: '北京市',
  天津: '天津市',
  上海: '上海市',
  重庆: '重庆市',
  河北: '河北省',
  山西: '山西省',
  辽宁: '辽宁省',
  吉林: '吉林省',
  黑龙江: '黑龙江省',
  江苏: '江苏省',
  浙江: '浙江省',
  安徽: '安徽省',
  福建: '福建省',
  江西: '江西省',
  山东: '山东省',
  河南: '河南省',
  湖北: '湖北省',
  湖南: '湖南省',
  广东: '广东省',
  海南: '海南省',
  四川: '四川省',
  贵州: '贵州省',
  云南: '云南省',
  陕西: '陕西省',
  甘肃: '甘肃省',
  青海: '青海省',
  台湾: '台湾省',
  内蒙古: '内蒙古自治区',
  广西: '广西壮族自治区',
  西藏: '西藏自治区',
  宁夏: '宁夏回族自治区',
  新疆: '新疆维吾尔自治区',
  香港: '香港特别行政区',
  澳门: '澳门特别行政区',
}

function toMapProvinceName(name: string): string {
  return PROVINCE_NAME_MAP[name] || name
}

function filteredRegionsOf(
  regions: RegionPoint[],
  focusModule?: DashboardModule | null,
): RegionPoint[] {
  if (!focusModule) return regions
  return regions.filter((r) => r.module === focusModule)
}

function provinceHeatData(regions: RegionPoint[]): { name: string; value: number }[] {
  const map = new Map<string, number>()
  for (const r of regions) {
    const key = toMapProvinceName(r.province || r.name)
    map.set(key, (map.get(key) || 0) + r.value)
  }
  return [...map.entries()].map(([name, value]) => ({ name, value }))
}

function scatterData(regions: RegionPoint[], focusCity?: string | null) {
  return regions.map((r) => ({
    name: r.name,
    value: [r.lng, r.lat, r.value],
    module: r.module,
    province: r.province,
    itemStyle: {
      color: colors[r.module] || '#38bdf8',
      shadowBlur: focusCity === r.name ? 22 : 10,
      shadowColor: colors[r.module] || '#38bdf8',
    },
    symbolSize: focusCity === r.name ? 22 : 12 + Math.min(14, r.value / 1200),
  }))
}

function lineData(regions: RegionPoint[]) {
  const top = [...regions].sort((a, b) => b.value - a.value).slice(0, 5)
  if (top.length < 2) return []
  const hub = top[0]
  if (!hub) return []
  return top.slice(1).map((city) => ({
    coords: [
      [hub.lng, hub.lat],
      [city.lng, city.lat],
    ],
    lineStyle: { color: colors[city.module] || '#38bdf8' },
  }))
}

function buildOption(
  regions: RegionPoint[],
  focusCity?: string | null,
  focusModule?: DashboardModule | null,
): echarts.EChartsOption {
  const filtered = filteredRegionsOf(regions, focusModule)
  const heat = provinceHeatData(filtered)
  const max = Math.max(...heat.map((h) => h.value), 1)

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(2,12,27,0.92)',
      borderColor: 'rgba(56,189,248,0.45)',
      textStyle: { color: '#e0f2fe', fontSize: 12 },
      formatter: (params: unknown) => {
        const p = params as {
          seriesType?: string
          name?: string
          value?: number | number[]
          data?: { module?: string; province?: string }
        }
        if (p.seriesType === 'effectScatter' || p.seriesType === 'scatter') {
          const val = Array.isArray(p.value) ? Number(p.value[2]) : Number(p.value)
          const mod = p.data?.module ? moduleLabel[p.data.module] : ''
          return `<strong>${p.name}</strong><br/>${mod}热度：${formatNumber(val)}`
        }
        if (p.seriesType === 'map') {
          return `<strong>${p.name}</strong><br/>区域热力：${formatNumber(Number(p.value) || 0)}`
        }
        return p.name || ''
      },
    },
    geo: {
      map: 'china',
      roam: true,
      scaleLimit: { min: 0.8, max: 8 },
      zoom: 1.15,
      center: [104.1, 35.5],
      itemStyle: {
        areaColor: '#0a2740',
        borderColor: '#38bdf8',
        borderWidth: 1,
        shadowColor: 'rgba(56,189,248,0.25)',
        shadowBlur: 12,
      },
      emphasis: {
        itemStyle: {
          areaColor: '#12507a',
          borderColor: '#67e8f9',
          borderWidth: 1.5,
        },
        label: { show: true, color: '#e0f2fe', fontSize: 11 },
      },
      select: {
        itemStyle: {
          areaColor: '#0e7490',
        },
      },
      label: { show: false },
    },
    visualMap: {
      min: 0,
      max,
      right: 8,
      bottom: 12,
      calculable: true,
      text: ['高', '低'],
      textStyle: { color: '#7dd3fc', fontSize: 10 },
      inRange: {
        color: ['#082f49', '#0e7490', '#22d3ee', '#fbbf24'],
      },
      seriesIndex: 0,
    },
    series: [
      {
        name: '省份热力',
        type: 'map',
        map: 'china',
        geoIndex: 0,
        data: heat,
        selectedMode: false,
      },
      {
        name: '城市热力',
        type: 'effectScatter',
        coordinateSystem: 'geo',
        zlevel: 2,
        rippleEffect: {
          brushType: 'stroke',
          scale: 3.2,
          period: 3,
        },
        label: {
          show: true,
          formatter: '{b}',
          position: 'right',
          color: '#bae6fd',
          fontSize: 11,
          textBorderColor: 'rgba(2,12,27,0.8)',
          textBorderWidth: 2,
        },
        data: scatterData(filtered, focusCity),
      },
      {
        name: '流量飞线',
        type: 'lines',
        coordinateSystem: 'geo',
        zlevel: 1,
        effect: {
          show: true,
          period: 4,
          trailLength: 0.45,
          symbol: 'arrow',
          symbolSize: 5,
        },
        lineStyle: {
          width: 1.2,
          opacity: 0.55,
          curveness: 0.25,
        },
        data: lineData(filtered),
      },
    ],
  }
}

type ChinaMapProps = {
  regions: RegionPoint[]
  focusCity?: string | null
  focusModule?: DashboardModule | null
  onSelectCity: (name: string | null) => void
  onSelectModule: (module: DashboardModule | null) => void
}

export function ChinaMap({
  regions,
  focusCity,
  focusModule,
  onSelectCity,
  onSelectModule,
}: ChinaMapProps) {
  const chartElRef = useRef<HTMLDivElement | null>(null)
  const chartRef = useRef<echarts.ECharts | null>(null)
  const propsRef = useRef({ regions, focusCity, focusModule, onSelectCity, onSelectModule })

  const [mapReady, setMapReady] = useState(false)
  const [mapError, setMapError] = useState('')
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    propsRef.current = { regions, focusCity, focusModule, onSelectCity, onSelectModule }
  }, [regions, focusCity, focusModule, onSelectCity, onSelectModule])

  function onCityClick(name: string): void {
    const next = focusCity === name ? null : name
    setActive(next)
    onSelectCity(next)
    const city = regions.find((r) => r.name === name)
    if (city && next) {
      onSelectModule(city.module)
    }
  }

  const filteredRegions = useMemo(
    () => filteredRegionsOf(regions, focusModule),
    [regions, focusModule],
  )

  const ranked = useMemo(
    () => [...filteredRegions].sort((a, b) => b.value - a.value).slice(0, 8),
    [filteredRegions],
  )

  const selected = useMemo(() => {
    const name = focusCity || active
    return regions.find((r) => r.name === name) || null
  }, [focusCity, active, regions])

  useEffect(() => {
    const el = chartElRef.current
    if (!el) return

    let cancelled = false
    let resizeObserver: ResizeObserver | null = null

    async function initMap(): Promise<void> {
      try {
        const res = await fetch('/geo/china.json')
        if (!res.ok) throw new Error('地图数据加载失败')
        const geoJson = await res.json()
        if (cancelled || !el) return
        echarts.registerMap('china', geoJson as Parameters<typeof echarts.registerMap>[1])
        const chart = echarts.init(el, undefined, { renderer: 'canvas' })
        chartRef.current = chart
        setMapReady(true)
        const current = propsRef.current
        chart.setOption(buildOption(current.regions, current.focusCity, current.focusModule), {
          notMerge: true,
        })

        chart.on('click', (params) => {
          const current = propsRef.current
          const clickCity = (name: string) => {
            const next = current.focusCity === name ? null : name
            setActive(next)
            current.onSelectCity(next)
            const city = current.regions.find((r) => r.name === name)
            if (city && next) {
              current.onSelectModule(city.module)
            }
          }
          if (params.seriesType === 'effectScatter' || params.seriesType === 'scatter') {
            clickCity(String(params.name))
            return
          }
          if (params.seriesType === 'map') {
            const province = String(params.name).replace(
              /(省|市|壮族自治区|回族自治区|维吾尔自治区|自治区|特别行政区)$/g,
              '',
            )
            const city = current.regions.find(
              (r) => r.province === province || r.name === province,
            )
            if (city) clickCity(city.name)
          }
        })

        resizeObserver = new ResizeObserver(() => chartRef.current?.resize())
        resizeObserver.observe(el)
      } catch (err) {
        if (!cancelled) {
          setMapError(err instanceof Error ? err.message : '地图初始化失败')
        }
      }
    }

    void initMap()

    return () => {
      cancelled = true
      resizeObserver?.disconnect()
      chartRef.current?.dispose()
      chartRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!mapReady || !chartRef.current) return
    chartRef.current.setOption(buildOption(regions, focusCity, focusModule), { notMerge: true })
  }, [regions, focusCity, focusModule, mapReady])

  return (
    <div className="map">
      <div className="map__stage">
        <div ref={chartElRef} className="map__chart" />
        {mapError ? <p className="map__error">{mapError}</p> : null}
        <div className="map__hint">滚轮缩放 · 拖拽平移 · 点击城市/省份</div>
        {selected ? (
          <div className="map__tooltip">
            <strong>{selected.name}</strong>
            <span>
              {selected.province} · {moduleLabel[selected.module]}
            </span>
            <em>{formatNumber(selected.value)}</em>
            <button type="button" className="map__clear" onClick={() => onCityClick(selected.name)}>
              取消选中
            </button>
          </div>
        ) : null}
      </div>

      <aside className="map__rank screen-scroll">
        <p className="map__rank-title">城市热力 TOP</p>
        <ol>
          {ranked.map((item, idx) => (
            <li
              key={item.name}
              className={(focusCity || active) === item.name ? 'is-active' : undefined}
              onClick={() => onCityClick(item.name)}
            >
              <span className="idx">{idx + 1}</span>
              <span className="name">{item.name}</span>
              <span className={`mod is-${item.module}`}>{moduleLabel[item.module]}</span>
              <strong>{formatNumber(item.value)}</strong>
            </li>
          ))}
        </ol>
      </aside>
    </div>
  )
}
