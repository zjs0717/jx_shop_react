import { getToken, request } from '@/api/request'
import { fetchVideoFeed } from '@/api/video'
import type {
  AddressItem,
  AddressPayload,
  ProfileUpdatePayload,
  PublicUserProfile,
  UserProfile,
  UserVideoItem,
  UserVideoListData,
  UserVideoStatus,
  VideoUploadForm,
} from '@/types/user'
import type { VideoItem } from '@/types/video'

export const fetchProfileApi = () => request<UserProfile>('/api/user/profile')

export const updateProfileApi = (payload: ProfileUpdatePayload) =>
  request<UserProfile>('/api/user/profile', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })

export async function uploadAvatarApi(file: File): Promise<UserProfile> {
  const form = new FormData()
  form.append('file', file)
  const headers = new Headers()
  const token = getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const response = await fetch('/api/user/avatar', {
    method: 'POST',
    headers,
    body: form,
  })
  const body = await response.json()
  if (body.code !== 200) {
    throw new Error(body.message || '上传失败')
  }
  return body.data as UserProfile
}

export const fetchAddressesApi = () => request<AddressItem[]>('/api/user/addresses')

export const createAddressApi = (payload: AddressPayload) =>
  request<AddressItem>('/api/user/addresses', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const updateAddressApi = (id: number, payload: AddressPayload) =>
  request<AddressItem>(`/api/user/addresses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })

export const deleteAddressApi = (id: number) =>
  request<{ message: string }>(`/api/user/addresses/${id}`, {
    method: 'DELETE',
  })

export const fetchMyVideosApi = (status?: UserVideoStatus) => {
  const query = status ? `?status=${status}` : ''
  return request<UserVideoListData>(`/api/user/videos${query}`)
}

export const updateMyVideoApi = (
  id: number,
  payload: {
    title?: string
    cover?: string
    description?: string
    status?: UserVideoStatus
    tags?: string
    city?: string
  },
) =>
  request<UserVideoItem>(`/api/user/videos/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })

export const deleteMyVideoApi = (id: number) =>
  request<{ message: string }>(`/api/user/videos/${id}`, {
    method: 'DELETE',
  })

export async function uploadMyVideoApi(payload: VideoUploadForm): Promise<UserVideoItem> {
  const form = new FormData()
  form.append('video', payload.video)
  if (payload.cover) form.append('cover', payload.cover)
  form.append('title', payload.title)
  form.append('description', payload.description || '')
  form.append('tags', payload.tags || '')
  form.append('city', payload.city || '')
  form.append('status', payload.status || 'library')
  form.append('duration', String(payload.duration ?? 0))
  form.append('width', String(payload.width ?? 0))
  form.append('height', String(payload.height ?? 0))

  const headers = new Headers()
  const token = getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const response = await fetch('/api/user/videos/upload', {
    method: 'POST',
    headers,
    body: form,
  })
  const body = await response.json()
  if (body.code !== 200) {
    throw new Error(body.message || '上传失败')
  }
  return body.data as UserVideoItem
}

export async function fetchPublicUserSpaceApi(userId: number): Promise<{
  profile: PublicUserProfile
  videos: VideoItem[]
}> {
  const feed = await fetchVideoFeed()
  const videos = feed.list.filter((v) => Number(v.authorId) === userId)

  if (!videos.length) {
    throw new Error('未找到该用户或暂无公开作品')
  }

  const head = videos[0]
  const name = head.author || `用户${userId}`
  const profile: PublicUserProfile = {
    id: userId,
    username: name,
    nickname: name,
    avatarUrl: head.authorAvatar || '',
    bio: '',
    videoCount: videos.length,
    likeCount: videos.reduce((sum, v) => sum + (v.likeCount || 0), 0),
    playCount: videos.reduce((sum, v) => sum + (v.playCount || 0), 0),
  }

  return { profile, videos }
}
