export type UserGender = 'male' | 'female' | 'other' | 'unknown'

export interface UserProfile {
  id: number
  username: string
  nickname: string
  avatarUrl: string
  gender: UserGender
  bio: string
  createdAt?: string
}

export interface PublicUserProfile {
  id: number
  username: string
  nickname: string
  avatarUrl: string
  bio: string
  videoCount: number
  likeCount: number
  playCount: number
}

export interface ProfileUpdatePayload {
  nickname?: string
  gender?: UserGender
  bio?: string
  avatarUrl?: string
}

export interface AddressItem {
  id: number
  name: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
  isDefault: boolean
  createdAt?: string
}

export interface AddressPayload {
  name: string
  phone: string
  province: string
  city: string
  district?: string
  detail: string
  isDefault?: boolean
}

export type UserVideoStatus = 'library' | 'published'

export interface UserVideoItem {
  id: number
  title: string
  cover: string
  playUrl: string
  status: UserVideoStatus
  playCount: number
  likeCount: number
  description: string
  tags: string[]
  duration: number
  width: number
  height: number
  fileSize: number
  mimeType: string
  originalFilename: string
  city: string
  createdAt?: string
  publishedAt?: string | null
  authorId?: number
  author?: string
  authorAvatar?: string
}

export interface UserVideoListData {
  total: number
  list: UserVideoItem[]
}

export interface VideoUploadForm {
  video: File
  cover?: File | null
  title: string
  description?: string
  tags?: string
  city?: string
  status?: UserVideoStatus
  duration?: number
  width?: number
  height?: number
}
