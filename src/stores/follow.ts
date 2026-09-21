import { create } from 'zustand'

const FOLLOW_KEY = 'jj_followed_user_ids'

function readIds(): number[] {
  try {
    const raw = localStorage.getItem(FOLLOW_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.map(Number).filter((n) => Number.isFinite(n) && n > 0)
  } catch {
    return []
  }
}

function writeIds(ids: number[]): void {
  localStorage.setItem(FOLLOW_KEY, JSON.stringify([...new Set(ids)]))
}

interface FollowState {
  ids: number[]
  isFollowing: (userId: number) => boolean
  follow: (userId: number) => void
  unfollow: (userId: number) => void
  toggle: (userId: number) => boolean
}

export const useFollowStore = create<FollowState>((set, get) => ({
  ids: readIds(),
  isFollowing: (userId) => get().ids.includes(userId),
  follow: (userId) => {
    if (!userId) return
    const ids = get().ids
    if (ids.includes(userId)) return
    const next = [...ids, userId]
    writeIds(next)
    set({ ids: next })
  },
  unfollow: (userId) => {
    const next = get().ids.filter((id) => id !== userId)
    writeIds(next)
    set({ ids: next })
  },
  toggle: (userId) => {
    if (get().isFollowing(userId)) {
      get().unfollow(userId)
      return false
    }
    get().follow(userId)
    return true
  },
}))
