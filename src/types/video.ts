export interface VideoItem {
  id: string
  title: string
  cover: string
  author: string
  authorId?: number
  authorAvatar?: string
  playCount: number
  likeCount: number
  duration: number
  playUrl: string
  description?: string
  tags?: string[]
  city?: string
  liked?: boolean
}

export interface VideoFeedData {
  total: number
  list: VideoItem[]
  source?: string
}

export interface VideoSearchData {
  total: number
  list: VideoItem[]
  keyword: string
}

export interface VideoRelatedData {
  total: number
  list: VideoItem[]
  videoId: string
  keywords: string[]
}

export interface VideoLikeResult {
  videoId: string
  liked: boolean
  likeCount: number
}

export interface VideoPlayResult {
  videoId: string
  playCount: number
}
