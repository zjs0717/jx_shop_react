import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchDashboardOverview } from '@/api/dashboard'
import { queryKeys } from '@/lib/queryKeys'
import type { DashboardModule } from '@/types/dashboard'
import { formatMoney, formatNumber, formatUpdatedAt, moduleLabel } from '@/utils/format'
import { ChinaMap } from './ChinaMap'
import { ScreenPanel } from './ScreenPanel'
import { SourceDonut } from './SourceDonut'
import { TrafficLineChart } from './TrafficLineChart'
import './DashboardPage.css'

const POLL_OPTIONS = [
  { label: '关闭', value: 0 },
  { label: '5 秒', value: 5000 },
  { label: '10 秒', value: 10000 },
  { label: '30 秒', value: 30000 },
] as const

type PollMs = (typeof POLL_OPTIONS)[number]['value']

function tickClockText(): string {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}

export function DashboardPage() {
  const screenRef = useRef<HTMLElement | null>(null)
  const [pollMs, setPollMs] = useState<PollMs>(5000)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [nowText, setNowText] = useState(tickClockText)
  const [screenError, setScreenError] = useState('')
  const [focusModule, setFocusModule] = useState<DashboardModule | null>(null)
  const [focusCity, setFocusCity] = useState<string | null>(null)
  const [focusSource, setFocusSource] = useState<string | null>(null)
  const [focusRank, setFocusRank] = useState<string | null>(null)
  const [focusEvent, setFocusEvent] = useState<string | null>(null)
  const [focusKpi, setFocusKpi] = useState<string | null>(null)

  const { data, error: queryError, isLoading, isFetching, refetch } = useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: fetchDashboardOverview,
    refetchInterval: pollMs > 0 ? pollMs : false,
  })

  const error =
    screenError || (queryError instanceof Error ? queryError.message : queryError ? '数据加载失败' : '')

  const kpis = useMemo(() => {
    if (!data) return []
    const o = data.overview
    return [
      { key: 'online', label: '实时在线', value: formatNumber(o.onlineUsers), tip: 'ACTIVE', module: null as DashboardModule | null },
      { key: 'pv', label: '今日 PV', value: formatNumber(o.todayPV), tip: 'PAGE VIEW', module: null },
      { key: 'uv', label: '今日 UV', value: formatNumber(o.todayUV), tip: 'UNIQUE', module: null },
      { key: 'gmv', label: '今日 GMV', value: formatMoney(o.gmv), tip: 'GMV', module: 'shop' as DashboardModule },
    ]
  }, [data])

  const regions = data?.regions ?? []

  const filteredRank = useMemo(() => {
    if (!data) return []
    if (!focusModule) return data.topRank
    return data.topRank.filter((item) => item.module === focusModule)
  }, [data, focusModule])

  const filteredEvents = useMemo(() => {
    if (!data) return []
    if (!focusModule) return data.realtimeEvents
    return data.realtimeEvents.filter((item) => item.module === focusModule)
  }, [data, focusModule])

  useEffect(() => {
    const screenEl = screenRef.current
    const clockTimer = setInterval(() => {
      setNowText(tickClockText())
    }, 1000)

    function onFullscreenChange(): void {
      setIsFullscreen(document.fullscreenElement === screenRef.current)
    }

    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => {
      clearInterval(clockTimer)
      document.removeEventListener('fullscreenchange', onFullscreenChange)
      if (document.fullscreenElement === screenEl) {
        void document.exitFullscreen()
      }
    }
  }, [])

  async function toggleFullscreen(): Promise<void> {
    const el = screenRef.current
    if (!el) return
    try {
      if (!document.fullscreenElement) {
        await el.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    } catch {
      setScreenError('当前浏览器不支持全屏，请手动按 F11')
    }
  }

  function onPollChange(e: ChangeEvent<HTMLSelectElement>): void {
    setPollMs(Number(e.target.value) as PollMs)
    setScreenError('')
    void refetch()
  }

  function toggleModule(mod: DashboardModule): void {
    setFocusModule((prev) => (prev === mod ? null : mod))
  }

  function onSelectCity(name: string | null): void {
    setFocusCity(name)
  }

  function onSelectModule(mod: DashboardModule | null): void {
    setFocusModule(mod)
  }

  function onSelectSource(name: string | null): void {
    setFocusSource(name)
  }

  function onSelectKpi(key: string, mod: DashboardModule | null): void {
    setFocusKpi((prev) => (prev === key ? null : key))
    if (mod) toggleModule(mod)
  }

  function onSelectRank(name: string, mod: DashboardModule): void {
    const next = focusRank === name ? null : name
    setFocusRank(next)
    if (next) setFocusModule(mod)
  }

  function onSelectEvent(id: string, mod: DashboardModule): void {
    const next = focusEvent === id ? null : id
    setFocusEvent(next)
    if (next) setFocusModule(mod)
  }

  function clearFilters(): void {
    setFocusModule(null)
    setFocusCity(null)
    setFocusSource(null)
    setFocusRank(null)
    setFocusEvent(null)
    setFocusKpi(null)
  }

  return (
    <section ref={screenRef} className={`screen${isFullscreen ? ' is-fullscreen' : ''}`}>
      <div className="screen__bg" aria-hidden="true">
        <div className="screen__grid" />
        <div className="screen__beam screen__beam--l" />
        <div className="screen__beam screen__beam--r" />
      </div>

      <header className="screen__header">
        <div className="screen__side screen__side--left">
          <span className="screen__clock">{nowText}</span>
          {data ? <span className="screen__sync">同步 {formatUpdatedAt(data.updatedAt)}</span> : null}
        </div>
        <div className="screen__header-main">
          <div className="screen__title-wrap">
            <p className="screen__eyebrow">LEXIANG · REALTIME COMMAND</p>
            <h2 className="screen__title">运营可视化数据大屏</h2>
          </div>
        </div>
        <div className="screen__actions">
          <label className="screen__poll">
            <span>轮询</span>
            <select value={pollMs} onChange={onPollChange}>
              {POLL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="screen__btn"
            disabled={isFetching}
            onClick={() => {
              setScreenError('')
              void refetch()
            }}
          >
            刷新
          </button>
          <button type="button" className="screen__btn screen__btn--primary" onClick={() => void toggleFullscreen()}>
            {isFullscreen ? '退出全屏' : '最大化'}
          </button>
        </div>
      </header>

      {error ? <p className="screen__error">{error}</p> : isLoading ? <p className="screen__loading">正在同步分析数据…</p> : null}

      {data ? (
        <>
          {focusModule || focusCity || focusSource ? (
            <div className="screen__filter">
              <span>当前聚焦：</span>
              {focusModule ? <strong>{moduleLabel[focusModule]}</strong> : null}
              {focusCity ? <strong>{focusCity}</strong> : null}
              {focusSource ? <strong>{focusSource}</strong> : null}
              <button type="button" className="screen__btn" onClick={clearFilters}>
                清除筛选
              </button>
            </div>
          ) : null}

          <div className="kpi-row">
            {kpis.map((item) => (
              <article
                key={item.key}
                className={`kpi${focusKpi === item.key ? ' is-active' : ''}`}
                onClick={() => onSelectKpi(item.key, item.module)}
              >
                <span className="kpi__tip">{item.tip}</span>
                <strong className="kpi__value">{item.value}</strong>
                <span className="kpi__label">{item.label}</span>
              </article>
            ))}
          </div>

          <div className="screen__body">
            <div className="col col--left">
              <ScreenPanel title="业务模块看板">
                <div className="module-cards">
                  <button
                    type="button"
                    className={`module-card module-card--shop${focusModule === 'shop' ? ' is-active' : ''}${focusModule && focusModule !== 'shop' ? ' is-dim' : ''}`}
                    onClick={() => toggleModule('shop')}
                  >
                    <h4>购物</h4>
                    <p>
                      <span>GMV</span>
                      <strong>{formatMoney(data.modules.shop.gmv)}</strong>
                    </p>
                    <p>
                      <span>订单</span>
                      <strong>{formatNumber(data.modules.shop.orders)}</strong>
                    </p>
                    <p>
                      <span>转化</span>
                      <strong>{data.modules.shop.conversionRate}%</strong>
                    </p>
                  </button>
                  <button
                    type="button"
                    className={`module-card module-card--video${focusModule === 'video' ? ' is-active' : ''}${focusModule && focusModule !== 'video' ? ' is-dim' : ''}`}
                    onClick={() => toggleModule('video')}
                  >
                    <h4>短视频</h4>
                    <p>
                      <span>播放</span>
                      <strong>{formatNumber(data.modules.video.plays)}</strong>
                    </p>
                    <p>
                      <span>点赞</span>
                      <strong>{formatNumber(data.modules.video.likes)}</strong>
                    </p>
                    <p>
                      <span>人均</span>
                      <strong>{data.modules.video.avgWatchSec}s</strong>
                    </p>
                  </button>
                  <button
                    type="button"
                    className={`module-card module-card--live${focusModule === 'live' ? ' is-active' : ''}${focusModule && focusModule !== 'live' ? ' is-dim' : ''}`}
                    onClick={() => toggleModule('live')}
                  >
                    <h4>直播</h4>
                    <p>
                      <span>观看</span>
                      <strong>{formatNumber(data.modules.live.viewers)}</strong>
                    </p>
                    <p>
                      <span>打赏</span>
                      <strong>{formatMoney(data.modules.live.gifts)}</strong>
                    </p>
                    <p>
                      <span>互动</span>
                      <strong>{data.modules.live.interactionRate}%</strong>
                    </p>
                  </button>
                </div>
              </ScreenPanel>

              <ScreenPanel title="流量趋势 · 购物 / 短视频 / 直播">
                <TrafficLineChart
                  data={data.trafficTrend}
                  focusModule={focusModule}
                  onSelectModule={onSelectModule}
                />
              </ScreenPanel>
            </div>

            <div className="col col--center">
              <ScreenPanel
                title="全国流量热力地图"
                extra={<span className="screen__sync">更新 {formatUpdatedAt(data.updatedAt)}</span>}
              >
                <ChinaMap
                  regions={regions}
                  focusCity={focusCity}
                  focusModule={focusModule}
                  onSelectCity={onSelectCity}
                  onSelectModule={onSelectModule}
                />
              </ScreenPanel>
            </div>

            <div className="col col--right">
              <ScreenPanel title="流量来源占比">
                <SourceDonut data={data.sourceShare} activeName={focusSource} onSelect={onSelectSource} />
              </ScreenPanel>

              <ScreenPanel title="热度排行">
                <ol className="rank screen-scroll">
                  {filteredRank.map((item, index) => (
                    <li
                      key={`${item.module}-${item.name}`}
                      className={`${focusRank === item.name ? 'is-active' : ''} ${focusModule && item.module !== focusModule ? 'is-dim' : ''}`.trim()}
                      onClick={() => onSelectRank(item.name, item.module)}
                    >
                      <span className="rank__idx">{index + 1}</span>
                      <div className="rank__meta">
                        <strong>{item.name}</strong>
                        <span>{moduleLabel[item.module]}</span>
                      </div>
                      <em>{formatNumber(item.value)}</em>
                    </li>
                  ))}
                </ol>
              </ScreenPanel>

              <ScreenPanel title="实时动态">
                <ul className="events screen-scroll">
                  {filteredEvents.map((event) => (
                    <li
                      key={event.id}
                      className={focusEvent === event.id ? 'is-active' : undefined}
                      onClick={() => onSelectEvent(event.id, event.module)}
                    >
                      <span className="events__time">{event.time}</span>
                      <span className={`events__tag is-${event.module}`}>{moduleLabel[event.module]}</span>
                      <span className="events__msg">{event.message}</span>
                    </li>
                  ))}
                </ul>
              </ScreenPanel>
            </div>
          </div>
        </>
      ) : null}
    </section>
  )
}
