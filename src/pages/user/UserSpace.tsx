import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchProfileApi, fetchPublicUserSpaceApi } from '@/api/user'
import { queryKeys } from '@/lib/queryKeys'
import { useFollowStore } from '@/stores/follow'
import type { VideoItem } from '@/types/video'
import './UserSpace.css'

function formatCount(n: number): string {
  if (n >= 10000) return `${(n / 10000).toFixed(n >= 100000 ? 1 : 2)}万`
  return n.toLocaleString('zh-CN')
}

export function UserSpace() {
  const { id: idParam } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const raw = Number(idParam)
  const userId = Number.isFinite(raw) && raw > 0 ? raw : 0

  const spaceQuery = useQuery({
    queryKey: queryKeys.userSpace(userId),
    queryFn: () => fetchPublicUserSpaceApi(userId),
    enabled: userId > 0,
  })

  const profileQuery = useQuery({
    queryKey: queryKeys.profile,
    queryFn: fetchProfileApi,
    retry: false,
  })

  const followed = useFollowStore((s) => (userId > 0 ? s.isFollowing(userId) : false))
  const toggleFollow = useFollowStore((s) => s.toggle)

  const profile = spaceQuery.data?.profile ?? null
  const videos = spaceQuery.data?.videos ?? []
  const selfId = profileQuery.data?.id ?? null
  const isSelf = selfId != null && selfId === userId
  const displayName = profile?.nickname || profile?.username || `用户${userId}`
  const loading = userId > 0 && (spaceQuery.isLoading || profileQuery.isLoading)
  const error =
    userId <= 0
      ? '无效的用户'
      : spaceQuery.error instanceof Error
        ? spaceQuery.error.message
        : ''

  useEffect(() => {
    if (isSelf) {
      void navigate('/home/me', { replace: true })
    }
  }, [isSelf, navigate])

  function back(): void {
    if (window.history.length > 1) navigate(-1)
    else void navigate('/home/video')
  }

  function onFollow(): void {
    if (!userId || isSelf) return
    toggleFollow(userId)
  }

  function openVideo(video: VideoItem): void {
    void navigate({
      pathname: '/home/video',
      search: `?v=${encodeURIComponent(String(video.id))}&authorId=${encodeURIComponent(String(userId))}`,
    })
  }

  return (
    <div className="space">
      <header className="space__bar">
        <button type="button" className="space__back" aria-label="返回" onClick={back}>
          ←
        </button>
        <div className="space__bar-title">
          <strong>{loading ? '主页' : displayName}</strong>
          {profile ? <span>作品 {profile.videoCount}</span> : null}
        </div>
        <span className="space__bar-spacer" />
      </header>

      {loading || isSelf ? (
        <div className="space__state">加载中…</div>
      ) : error ? (
        <div className="space__state">
          <p>{error}</p>
          <button type="button" onClick={() => void spaceQuery.refetch()}>
            重试
          </button>
        </div>
      ) : profile ? (
        <>
          <section className="space__hero">
            <div className="space__avatar">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt={displayName} />
              ) : (
                <span>{displayName.slice(0, 1)}</span>
              )}
            </div>
            <div className="space__who">
              <h1>{displayName}</h1>
              <p>
                @{profile.username} · 乐享号 {profile.id}
              </p>
              <p className="space__bio">{profile.bio || '这个人很懒，还没有简介'}</p>
            </div>
            {!isSelf ? (
              <button
                type="button"
                className={`space__follow${followed ? ' is-on' : ''}`}
                onClick={onFollow}
              >
                {followed ? '已关注' : '关注'}
              </button>
            ) : (
              <button
                type="button"
                className="space__follow is-on"
                onClick={() => void navigate('/home/me/profile')}
              >
                编辑资料
              </button>
            )}
          </section>

          <section className="space__stats" aria-label="数据">
            <div className="space__stat">
              <strong>{formatCount(profile.videoCount)}</strong>
              <span>作品</span>
            </div>
            <div className="space__stat">
              <strong>{formatCount(profile.likeCount)}</strong>
              <span>获赞</span>
            </div>
            <div className="space__stat">
              <strong>{formatCount(profile.playCount)}</strong>
              <span>播放</span>
            </div>
          </section>

          <section className="space__works">
            <h2>作品</h2>
            {videos.length ? (
              <div className="space__grid">
                {videos.map((video) => (
                  <button
                    key={video.id}
                    type="button"
                    className="work"
                    onClick={() => openVideo(video)}
                  >
                    {video.cover ? (
                      <img
                        className="work__cover"
                        src={video.cover}
                        alt={video.title}
                        loading="lazy"
                      />
                    ) : (
                      <div className="work__cover work__cover--blank">
                        <span>{video.title?.slice(0, 1) || '视'}</span>
                      </div>
                    )}
                    <div className="work__meta">
                      <span>{formatCount(video.likeCount)} 赞</span>
                      <span>{formatCount(video.playCount)} 播</span>
                    </div>
                    <p className="work__title">{video.title}</p>
                  </button>
                ))}
              </div>
            ) : (
              <p className="space__empty">暂无公开作品</p>
            )}
          </section>
        </>
      ) : null}
    </div>
  )
}
