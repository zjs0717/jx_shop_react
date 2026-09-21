import { request } from '@/api/request'
import type { DashboardData } from '@/types/dashboard'

export const fetchDashboardOverview = (): Promise<DashboardData> => {
  return request<DashboardData>('/api/dashboard/overview')
}
