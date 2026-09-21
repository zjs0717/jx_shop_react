import { request } from '@/api/request'
import type {
  VideoFeedData,
  VideoLikeResult,
  VideoPlayResult,
  VideoRelatedData,
  VideoSearchData,
} from '@/types/video'

export const fetchVideoFeed = (): Promise<VideoFeedData> => {
  return request<VideoFeedData>('/api/video/feed')
}

export const searchVideosApi = (keyword: string, limit = 30): Promise<VideoSearchData> => {
  const q = encodeURIComponent(keyword.trim())
  return request<VideoSearchData>(`/api/video/search?keyword=${q}&limit=${limit}`)
}

export const fetchRelatedVideosApi = (
  videoId: string | number,
  limit = 12,
): Promise<VideoRelatedData> => {
  return request<VideoRelatedData>(`/api/video/${videoId}/related?limit=${limit}`)
}

export const toggleVideoLikeApi = (videoId: string | number): Promise<VideoLikeResult> => {
  return request<VideoLikeResult>(`/api/video/${videoId}/like`, { method: 'POST' })
}

export const recordVideoPlayApi = (videoId: string | number): Promise<VideoPlayResult> => {
  return request<VideoPlayResult>(`/api/video/${videoId}/play`, { method: 'POST' })
}
