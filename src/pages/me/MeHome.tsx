import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchMyVideosApi, fetchProfileApi } from '@/api/user'
import SceneCanvas from '@/components/fx/SceneCanvas'
import { queryKeys } from '@/lib/queryKeys'
import { useAuthStore } from '@/stores/auth'
import { genderLabel } from '@/utils/gender'
import './MeHome.css'

const tiles = [
  { title: '编辑资料', desc: '头像昵称性别', path: '/home/me/profile', tone: 'a' },
  { title: '收货地址', desc: '常用收货信息', path: '/home/me/address', tone: 'b' },
  { title: '视频库', desc: '草稿与私密', path: '/home/me/library', tone: 'c' },
  { title: '已发布', desc: '对外作品', path: '/home/me/published', tone: 'a' },
  { title: '我的订单', desc: '物流与售后', path: '/home/shop/orders', tone: 'b' },
  { title: '去逛商城', desc: '发现好物', path: '/home/shop', tone: 'c' },
] as const

export function MeHome() {
  const navigate = useNavigate()

  const profileQuery = useQuery({
    queryKey: queryKeys.profile,
    queryFn: fetchProfileApi,
  })

  const publishedQuery = useQuery({
    queryKey: queryKeys.myVideos('published'),
    queryFn: () => fetchMyVideosApi('published'),
  })

  const libraryQuery = useQuery({
    queryKey: queryKeys.myVideos('library'),
    queryFn: () => fetchMyVideosApi('library'),
  })

  const profile = profileQuery.data ?? null
  const loading = profileQuery.isPending || publishedQuery.isPending || libraryQuery.isPending
  const publishedCount = publishedQuery.data?.total ?? 0
  const libraryCount = libraryQuery.data?.total ?? 0
  const error =
    profileQuery.error instanceof Error
      ? profileQuery.error.message
      : publishedQuery.error instanceof Error
        ? publishedQuery.error.message
        : libraryQuery.error instanceof Error
          ? libraryQuery.error.message
          : ''

  const displayName = profile?.nickname || profile?.username || '乐享用户'

  function go(path: string): void {
    void navigate(path)
  }

  function retry(): void {
    void profileQuery.refetch()
    void publishedQuery.refetch()
    void libraryQuery.refetch()
  }

  function logout(): void {
    useAuthStore.getState().logout()
    void navigate('/login')
  }

  return (
    <div className="me">
      <section className="banner">
        <SceneCanvas mode="soft" />
        <div className="banner__shade" />

        {loading ? (
          <div className="banner__state">加载中…</div>
        ) : error ? (
          <div className="banner__state">
            <p>{error}</p>
            <button type="button" onClick={retry}>
              重试
            </button>
          </div>
        ) : profile ? (
          <div className="banner__body">
            <button type="button" className="avatar" onClick={() => go('/home/me/profile')}>
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt={displayName} />
              ) : (
                <span>{displayName.slice(0, 1)}</span>
              )}
            </button>
            <div className="who">
              <h1>{displayName}</h1>
              <p>
                @{profile.username} · {genderLabel(profile.gender)}
              </p>
              <p className="bio">{profile.bio || '写一句简介，让别人记住你'}</p>
            </div>
            <button type="button" className="publish" onClick={() => go('/home/me/upload')}>
              上传作品
            </button>
          </div>
        ) : null}

        <div className="stats">
          <button type="button" className="stat" onClick={() => go('/home/me/published')}>
            <strong>{publishedCount}</strong>
            <span>已发布</span>
          </button>
          <button type="button" className="stat" onClick={() => go('/home/me/library')}>
            <strong>{libraryCount}</strong>
            <span>视频库</span>
          </button>
          <button type="button" className="stat" onClick={() => go('/home/me/profile')}>
            <strong>{genderLabel(profile?.gender).slice(0, 1)}</strong>
            <span>资料</span>
          </button>
        </div>
      </section>

      <section className="grid">
        {tiles.map((tile) => (
          <button
            key={tile.path}
            type="button"
            className={`tile tile--${tile.tone}`}
            onClick={() => go(tile.path)}
          >
            <strong>{tile.title}</strong>
            <span>{tile.desc}</span>
          </button>
        ))}
      </section>

      <button type="button" className="logout" onClick={logout}>
        退出登录
      </button>
    </div>
  )
}
