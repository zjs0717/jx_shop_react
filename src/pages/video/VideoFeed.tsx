import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, MouseEvent, PointerEvent, TouchEvent, WheelEvent } from 'react'
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { fetchProfileApi } from '@/api/user'
import { fetchVideoFeed, recordVideoPlayApi, toggleVideoLikeApi } from '@/api/video'
import ShortVideoPlayer from '@/components/video/ShortVideoPlayer'
import type { ShortVideoPlayerHandle } from '@/components/video/ShortVideoPlayer'
import { queryKeys } from '@/lib/queryKeys'
import { useFollowStore } from '@/stores/follow'
import type { VideoFeedData, VideoItem } from '@/types/video'
import './VideoFeed.css'

const TAP_SLOP = 16

function authorKey(item: VideoItem): number {
  return Number(item.authorId) || 0
}

function formatCount(n: number): string {
  if (n >= 10000) return `${(n / 10000).toFixed(n >= 100000 ? 1 : 2)}万`
  return n.toLocaleString('zh-CN')
}

export function VideoFeed() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const videoIdParam = searchParams.get('v') ?? ''

  const feedQuery = useQuery({
    queryKey: queryKeys.videoFeed,
    queryFn: fetchVideoFeed,
  })

  const profileQuery = useQuery({
    queryKey: queryKeys.profile,
    queryFn: fetchProfileApi,
    retry: false,
  })

  const likeMutation = useMutation({
    mutationFn: toggleVideoLikeApi,
  })

  const playMutation = useMutation({
    mutationFn: recordVideoPlayApi,
  })

  const followIds = useFollowStore((s) => s.ids)
  const toggleFollow = useFollowStore((s) => s.toggle)

  const [list, setList] = useState<VideoItem[]>([])
  const [syncedFeed, setSyncedFeed] = useState<VideoFeedData | undefined>(feedQuery.data)
  const [syncedV, setSyncedV] = useState(videoIdParam)
  const [index, setIndex] = useState(0)
  const [swiping, setSwiping] = useState(false)
  const [deltaY, setDeltaY] = useState(0)
  const [likeBusy, setLikeBusy] = useState<Record<string, boolean>>({})
  const [actionError, setActionError] = useState('')

  const viewportRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<ShortVideoPlayerHandle>(null)
  const likeBusyRef = useRef<Record<string, boolean>>({})
  const startYRef = useRef(0)
  const deltaYRef = useRef(0)
  const swipingRef = useRef(false)
  const indexRef = useRef(0)
  const listLengthRef = useRef(0)
  const wheelLockRef = useRef(false)
  const wheelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const playedOnceRef = useRef<Record<string, boolean>>({})

  const selfId = profileQuery.data?.id ?? null
  const loading = feedQuery.isPending
  const feedError = feedQuery.error instanceof Error ? feedQuery.error.message : ''
  const error = actionError || feedError
  const canPrev = index > 0
  const canNext = index < list.length - 1
  const empty = !loading && !feedQuery.error && list.length === 0

  if (feedQuery.data !== syncedFeed || videoIdParam !== syncedV) {
    setSyncedFeed(feedQuery.data)
    setSyncedV(videoIdParam)
    if (feedQuery.data) {
      const copied = feedQuery.data.list.map((item) => ({ ...item }))
      setList(copied)
      if (videoIdParam) {
        const i = copied.findIndex((item) => String(item.id) === videoIdParam)
        setIndex(i >= 0 ? i : 0)
      } else {
        setIndex(0)
      }
    } else if (!feedQuery.isPending) {
      setList([])
      setIndex(0)
    }
  }

  const go = useCallback((nextIndex: number): void => {
    const len = listLengthRef.current
    if (!len) return
    const next = Math.max(0, Math.min(len - 1, nextIndex))
    if (next === indexRef.current) return
    indexRef.current = next
    setIndex(next)
  }, [])

  const prev = useCallback((): void => {
    if (indexRef.current > 0) go(indexRef.current - 1)
  }, [go])

  const next = useCallback((): void => {
    if (indexRef.current < listLengthRef.current - 1) go(indexRef.current + 1)
  }, [go])

  useEffect(() => {
    indexRef.current = index
    listLengthRef.current = list.length
  }, [index, list.length])

  const toggleActivePlayer = useCallback(async (): Promise<void> => {
    const player = playerRef.current
    if (player) await player.togglePlay()
  }, [])

  const beginSwipe = useCallback((clientY: number): void => {
    if (!listLengthRef.current) return
    startYRef.current = clientY
    deltaYRef.current = 0
    swipingRef.current = true
    setDeltaY(0)
    setSwiping(true)
  }, [])

  const moveSwipe = useCallback((clientY: number): void => {
    if (!swipingRef.current) return
    const d = clientY - startYRef.current
    deltaYRef.current = d
    setDeltaY(d)
  }, [])

  const endSwipe = useCallback(
    (allowTap = false): void => {
      if (!swipingRef.current) return
      const threshold = Math.min(72, (viewportRef.current?.clientHeight || 600) * 0.12)
      const abs = Math.abs(deltaYRef.current)
      if (deltaYRef.current < -threshold) next()
      else if (deltaYRef.current > threshold) prev()
      else if (allowTap && abs <= TAP_SLOP) {
        void toggleActivePlayer()
      }
      swipingRef.current = false
      deltaYRef.current = 0
      setSwiping(false)
      setDeltaY(0)
    },
    [next, prev, toggleActivePlayer],
  )

  const onTouchStart = useCallback(
    (e: TouchEvent<HTMLDivElement>): void => {
      beginSwipe(e.touches[0]?.clientY ?? 0)
    },
    [beginSwipe],
  )

  const onTouchMove = useCallback(
    (e: TouchEvent<HTMLDivElement>): void => {
      if (!swipingRef.current) return
      if (Math.abs((e.touches[0]?.clientY ?? 0) - startYRef.current) > 8) {
        e.preventDefault()
      }
      moveSwipe(e.touches[0]?.clientY ?? 0)
    },
    [moveSwipe],
  )

  const onTouchEnd = useCallback((): void => {
    endSwipe(false)
  }, [endSwipe])

  const onMobileTouchEnd = useCallback((): void => {
    endSwipe(true)
  }, [endSwipe])

  const onPointerDown = useCallback(
    (e: PointerEvent<HTMLDivElement>): void => {
      if (e.pointerType === 'touch') return
      if (e.button !== 0) return
      e.currentTarget.setPointerCapture(e.pointerId)
      beginSwipe(e.clientY)
    },
    [beginSwipe],
  )

  const onPointerMove = useCallback(
    (e: PointerEvent<HTMLDivElement>): void => {
      if (e.pointerType === 'touch') return
      if (!swipingRef.current) return
      moveSwipe(e.clientY)
    },
    [moveSwipe],
  )

  const onPointerUp = useCallback(
    (e: PointerEvent<HTMLDivElement>): void => {
      if (e.pointerType === 'touch') return
      endSwipe(false)
    },
    [endSwipe],
  )

  const onWheel = useCallback(
    (e: WheelEvent<HTMLDivElement>): void => {
      e.preventDefault()
      if (!listLengthRef.current || wheelLockRef.current) return
      if (Math.abs(e.deltaY) < 12) return
      wheelLockRef.current = true
      if (e.deltaY > 0) next()
      else prev()
      wheelTimerRef.current = setTimeout(() => {
        wheelLockRef.current = false
      }, 450)
    },
    [next, prev],
  )

  useEffect(() => {
    const onKeydown = (e: KeyboardEvent): void => {
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        prev()
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        next()
      }
    }
    window.addEventListener('keydown', onKeydown)
    return () => {
      window.removeEventListener('keydown', onKeydown)
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current)
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current)
    }
  }, [next, prev])

  const trackStyle = useMemo((): CSSProperties => {
    const vh = window.innerHeight || 800
    const dragPercent = swiping ? (deltaY / vh) * 100 : 0
    const offset = -index * 100 + dragPercent
    return {
      transform: `translate3d(0, ${offset}%, 0)`,
      transition: swiping ? 'none' : 'transform 0.32s cubic-bezier(0.22, 0.61, 0.36, 1)',
    }
  }, [index, swiping, deltaY])

  function isSelfAuthor(item: VideoItem): boolean {
    const id = authorKey(item)
    return id > 0 && selfId != null && selfId === id
  }

  function openAuthor(item: VideoItem, e?: MouseEvent): void {
    e?.stopPropagation()
    e?.preventDefault()
    const id = authorKey(item)
    if (!id) return
    if (selfId != null && selfId === id) {
      void navigate('/home/me')
      return
    }
    void navigate(`/home/user/${id}`)
  }

  function onFollowClick(item: VideoItem, e: MouseEvent): void {
    e.stopPropagation()
    e.preventDefault()
    const id = authorKey(item)
    if (!id) return
    if (selfId != null && selfId === id) {
      void navigate('/home/me')
      return
    }
    toggleFollow(id)
  }

  async function onLikeClick(item: VideoItem, e: MouseEvent): Promise<void> {
    e.stopPropagation()
    e.preventDefault()
    const id = String(item.id)
    if (!id || likeBusyRef.current[id]) return
    likeBusyRef.current[id] = true
    setLikeBusy((prevBusy) => ({ ...prevBusy, [id]: true }))
    const prevLiked = Boolean(item.liked)
    const prevCount = item.likeCount
    setList((curr) =>
      curr.map((v) =>
        String(v.id) === id
          ? {
              ...v,
              liked: !prevLiked,
              likeCount: Math.max(0, prevCount + (!prevLiked ? 1 : -1)),
            }
          : v,
      ),
    )
    try {
      const res = await likeMutation.mutateAsync(id)
      setList((curr) =>
        curr.map((v) =>
          String(v.id) === id ? { ...v, liked: res.liked, likeCount: res.likeCount } : v,
        ),
      )
    } catch (err) {
      setList((curr) =>
        curr.map((v) =>
          String(v.id) === id ? { ...v, liked: prevLiked, likeCount: prevCount } : v,
        ),
      )
      const message = err instanceof Error ? err.message : '点赞失败'
      setActionError(message)
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current)
      errorTimerRef.current = setTimeout(() => {
        setActionError((curr) =>
          curr.includes('点赞') || curr.includes('登录') ? '' : curr,
        )
      }, 2200)
    } finally {
      likeBusyRef.current[id] = false
      setLikeBusy((prevBusy) => ({ ...prevBusy, [id]: false }))
    }
  }

  async function onPlayerPlay(item: VideoItem): Promise<void> {
    const id = String(item.id)
    if (!id || playedOnceRef.current[id]) return
    playedOnceRef.current[id] = true
    setList((curr) =>
      curr.map((v) =>
        String(v.id) === id ? { ...v, playCount: (v.playCount || 0) + 1 } : v,
      ),
    )
    try {
      const res = await playMutation.mutateAsync(id)
      setList((curr) =>
        curr.map((v) => (String(v.id) === id ? { ...v, playCount: res.playCount } : v)),
      )
    } catch {
      // 播放计数失败不影响观看
    }
  }

  function searchByTag(tag: string, e?: MouseEvent): void {
    e?.stopPropagation()
    e?.preventDefault()
    const q = tag.trim()
    if (!q) return
    void navigate({ pathname: '/home/search', search: `?q=${encodeURIComponent(q)}` })
  }

  const swipeBind = {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onTouchCancel: onTouchEnd,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel: onPointerUp,
    onWheel,
  }

  return (
    <section className="reels">
      <nav className="reels__tabs" aria-label="短视频频道">
        <NavLink to="/home/video" end className={({ isActive }) => (isActive ? 'is-active' : '')}>
          推荐
        </NavLink>
        <NavLink to="/home/video/follow" className={({ isActive }) => (isActive ? 'is-active' : '')}>
          关注
        </NavLink>
        <NavLink to="/home/video/nearby" className={({ isActive }) => (isActive ? 'is-active' : '')}>
          同城
        </NavLink>
      </nav>

      <div className="reels__tools">
        <button type="button" className="reels__search" onClick={() => void navigate('/home/search')}>
          搜索
        </button>
        <button type="button" className="reels__upload" onClick={() => void navigate('/home/me/upload')}>
          上传
        </button>
      </div>

      {error ? <p className="reels__error">{error}</p> : null}

      {loading ? (
        <div className="reels__viewport reels__viewport--skeleton" aria-busy="true">
          <div className="skeleton">
            <div className="skeleton__glow" />
            <p>加载短视频…</p>
          </div>
        </div>
      ) : empty ? (
        <div className="reels__viewport reels__viewport--empty">
          <div className="empty">
            <h2>还没有人发布短视频</h2>
            <p>上传你的第一条，成为推荐流里的第一位</p>
            <button type="button" onClick={() => void navigate('/home/me/upload')}>
              去上传
            </button>
          </div>
        </div>
      ) : (
        <div ref={viewportRef} className="reels__viewport">
          <div className="reels__track" style={trackStyle}>
            {list.map((item, i) => {
              const following = followIds.includes(authorKey(item))
              return (
                <article key={item.id} className="reel">
                  <div className="reel__swipe" aria-hidden="true" {...swipeBind} />

                  <div className="reel__phone">
                    {i === index && item.playUrl ? (
                      <ShortVideoPlayer
                        ref={playerRef}
                        src={item.playUrl}
                        cover={item.cover}
                        active={i === index}
                        onPlay={() => {
                          void onPlayerPlay(item)
                        }}
                        onEnded={next}
                      />
                    ) : item.cover ? (
                      <img className="reel__cover" src={item.cover} alt={item.title} loading="lazy" />
                    ) : (
                      <div className="reel__cover reel__cover--blank" />
                    )}

                    <div
                      className="reel__gesture-mobile"
                      onTouchStart={onTouchStart}
                      onTouchMove={onTouchMove}
                      onTouchEnd={onMobileTouchEnd}
                      onTouchCancel={onMobileTouchEnd}
                    />

                    <div className="reel__mask" />

                    <aside className="reel__actions">
                      <div className="reel__avatar-wrap">
                        <button
                          type="button"
                          className="reel__avatar"
                          disabled={!item.authorId}
                          aria-label={`查看 @${item.author} 的主页`}
                          onClick={(e) => openAuthor(item, e)}
                        >
                          {item.authorAvatar ? (
                            <img src={item.authorAvatar} alt={item.author} />
                          ) : (
                            <span>{(item.author || 'U').slice(0, 1)}</span>
                          )}
                        </button>
                        {item.authorId && !isSelfAuthor(item) ? (
                          <button
                            type="button"
                            className={`reel__follow${following ? ' is-on' : ''}`}
                            aria-label={following ? '取消关注' : '关注'}
                            onClick={(e) => onFollowClick(item, e)}
                          >
                            {following ? '✓' : '+'}
                          </button>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        className={`reel__stat reel__stat--btn${item.liked ? ' is-liked' : ''}`}
                        aria-label={item.liked ? '取消点赞' : '点赞'}
                        disabled={Boolean(likeBusy[String(item.id)])}
                        onClick={(e) => {
                          void onLikeClick(item, e)
                        }}
                      >
                        <span className="reel__heart" aria-hidden="true">
                          {item.liked ? '♥' : '♡'}
                        </span>
                        <strong>{formatCount(item.likeCount)}</strong>
                        <span>赞</span>
                      </button>
                      <div className="reel__stat">
                        <strong>{formatCount(item.playCount)}</strong>
                        <span>播</span>
                      </div>
                    </aside>

                    <div className="reel__info">
                      <button
                        type="button"
                        className="reel__author"
                        disabled={!item.authorId}
                        onClick={(e) => openAuthor(item, e)}
                      >
                        @{item.author}
                      </button>
                      <h3 className="reel__name">{item.title}</h3>
                      {item.description ? <p className="reel__desc">{item.description}</p> : null}
                      {item.tags?.length ? (
                        <div className="reel__tags">
                          {item.tags.slice(0, 4).map((tag) => (
                            <button
                              key={tag}
                              type="button"
                              className="reel__tag"
                              onClick={(e) => searchByTag(tag, e)}
                            >
                              #{tag}
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>

                    {i === index ? (
                      <div className="reel__hint">
                        {canNext ? '上滑看下一条' : canPrev ? '下滑看上一条' : ''}
                      </div>
                    ) : null}
                  </div>

                  <div className="reel__swipe" aria-hidden="true" {...swipeBind} />
                </article>
              )
            })}
          </div>
        </div>
      )}
    </section>
  )
}
