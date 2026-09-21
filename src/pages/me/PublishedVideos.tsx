import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deleteMyVideoApi, fetchMyVideosApi, updateMyVideoApi } from '@/api/user'
import { queryKeys } from '@/lib/queryKeys'
import type { UserVideoItem } from '@/types/user'
import './PublishedVideos.css'

function formatCount(n: number): string {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}万`
  return `${n}`
}

export function PublishedVideos() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [actingId, setActingId] = useState<number | null>(null)
  const [error, setError] = useState('')

  const listQuery = useQuery({
    queryKey: queryKeys.myVideos('published'),
    queryFn: () => fetchMyVideosApi('published'),
  })

  const unpublishMutation = useMutation({
    mutationFn: (id: number) => updateMyVideoApi(id, { status: 'library' }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.myVideos('published') })
      await queryClient.invalidateQueries({ queryKey: queryKeys.myVideos('library') })
      await queryClient.invalidateQueries({ queryKey: queryKeys.videoFeed })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteMyVideoApi,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.myVideos('published') })
      await queryClient.invalidateQueries({ queryKey: queryKeys.videoFeed })
    },
  })

  const list = listQuery.data?.list ?? []
  const loading = listQuery.isPending
  const queryError = listQuery.error instanceof Error ? listQuery.error.message : ''
  const displayError = error || queryError

  async function unpublish(item: UserVideoItem): Promise<void> {
    setActingId(item.id)
    setError('')
    try {
      await unpublishMutation.mutateAsync(item.id)
    } catch (e) {
      setError(e instanceof Error ? e.message : '操作失败')
    } finally {
      setActingId(null)
    }
  }

  async function remove(item: UserVideoItem): Promise<void> {
    if (!confirm(`删除已发布作品「${item.title}」？`)) return
    setActingId(item.id)
    setError('')
    try {
      await deleteMutation.mutateAsync(item.id)
    } catch (e) {
      setError(e instanceof Error ? e.message : '删除失败')
    } finally {
      setActingId(null)
    }
  }

  return (
    <div className="page">
      <button type="button" className="back" onClick={() => void navigate('/home/me')}>
        ← 我的
      </button>
      <header className="head">
        <div>
          <h1>已发布短视频</h1>
          <p>对外展示的作品库</p>
        </div>
        <div className="head__actions">
          <button type="button" className="link" onClick={() => void navigate('/home/me/upload')}>
            上传
          </button>
          <button type="button" className="link" onClick={() => void navigate('/home/me/library')}>
            视频库
          </button>
        </div>
      </header>

      {displayError ? <p className="err">{displayError}</p> : null}
      {loading ? <p className="hint">加载中…</p> : null}

      {!loading && !list.length ? (
        <div className="empty">
          <p>还没有发布作品</p>
          <button type="button" onClick={() => void navigate('/home/me/upload')}>
            去上传发布
          </button>
        </div>
      ) : !loading ? (
        <div className="grid">
          {list.map((item) => (
            <article key={item.id} className="card">
              <div className="card__media">
                {item.cover ? (
                  <img src={item.cover} alt={item.title} />
                ) : (
                  <video src={item.playUrl} muted playsInline />
                )}
                <span className="badge">已发布</span>
                <div className="stats">
                  <span>{formatCount(item.playCount)} 播放</span>
                  <span>{formatCount(item.likeCount)} 赞</span>
                </div>
              </div>
              <div className="card__body">
                <h3>{item.title}</h3>
                <p>{item.description || '暂无描述'}</p>
                <div className="card__actions">
                  <button
                    type="button"
                    disabled={actingId === item.id}
                    onClick={() => {
                      void unpublish(item)
                    }}
                  >
                    撤回库中
                  </button>
                  <button
                    type="button"
                    className="danger"
                    disabled={actingId === item.id}
                    onClick={() => {
                      void remove(item)
                    }}
                  >
                    删除
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </div>
  )
}
