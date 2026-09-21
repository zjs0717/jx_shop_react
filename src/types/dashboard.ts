export type DashboardModule = 'shop' | 'video' | 'live'

export interface DashboardOverview {
  onlineUsers: number
  todayPV: number
  todayUV: number
  gmv: number
}

export interface ShopModuleStats {
  gmv: number
  orders: number
  visitors: number
  conversionRate: number
  cartUsers: number
  refundRate: number
}

export interface VideoModuleStats {
  plays: number
  likes: number
  shares: number
  comments: number
  avgWatchSec: number
  publishCount: number
}

export interface LiveModuleStats {
  rooms: number
  viewers: number
  peakOnline: number
  gifts: number
  durationMin: number
  interactionRate: number
}

export interface TrafficPoint {
  time: string
  shop: number
  video: number
  live: number
}

export interface ShareItem {
  name: string
  value: number
}

export interface RankItem {
  module: DashboardModule
  name: string
  value: number
}

export interface RealtimeEvent {
  id: string
  time: string
  module: DashboardModule
  message: string
}

export interface RegionPoint {
  name: string
  lng: number
  lat: number
  province: string
  module: DashboardModule
  value: number
  x?: number
  y?: number
}

export interface DashboardData {
  updatedAt: string
  overview: DashboardOverview
  modules: {
    shop: ShopModuleStats
    video: VideoModuleStats
    live: LiveModuleStats
  }
  trafficTrend: TrafficPoint[]
  sourceShare: ShareItem[]
  topRank: RankItem[]
  realtimeEvents: RealtimeEvent[]
  regions: RegionPoint[]
}
