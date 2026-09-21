import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deleteMyVideoApi, fetchMyVideosApi, updateMyVideoApi } from '@/api/user'
import { queryKeys } from '@/lib/queryKeys'
import type { UserVideoItem } from '@/types/user'
import './VideoLibrary.css'

export function VideoLibrary() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [actingId, setActingId] = useState<number | null>(null)
  const [error, setError] = useState('')

  const listQuery = useQuery({
    queryKey: queryKeys.myVideos('library'),
    queryFn: () => fetchMyVideosApi('library'),
  })

  const publishMutation = useMutation({
    mutationFn: (id: number) => updateMyVideoApi(id, { status: 'published' }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.myVideos('library') })
      await queryClient.invalidateQueries({ queryKey: queryKeys.myVideos('published') })
      await queryClient.invalidateQueries({ queryKey: queryKeys.videoFeed })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteMyVideoApi,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.myVideos('library') })
    },
  })

  const list = listQuery.data?.list ?? []
  const loading = listQuery.isPending
  const queryError = listQuery.error instanceof Error ? listQuery.error.message : ''
  const displayError = error || queryError

  async function publish(item: UserVideoItem): Promise<void> {
    setActingId(item.id)
    setError('')
    try {
      await publishMutation.mutateAsync(item.id)
    } catch (e) {
      setError(e instanceof Error ? e.message : '发布失败')
    } finally {
      setActingId(null)
    }
  }

  async function remove(item: UserVideoItem): Promise<void> {
    if (!confirm(`删除「${item.title}」？`)) return
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
          <h1>个人视频库</h1>
          <p>草稿、素材与未公开内容</p>
        </div>
        <div className="head__actions">
          <button type="button" className="link" onClick={() => void navigate('/home/me/upload')}>
            上传
          </button>
          <button type="button" className="link" onClick={() => void navigate('/home/me/published')}>
            看已发布
          </button>
        </div>
      </header>

      {displayError ? <p className="err">{displayError}</p> : null}
      {loading ? <p className="hint">加载中…</p> : null}

      {!loading && !list.length ? (
        <div className="empty">
          <p>视频库还是空的</p>
          <button type="button" onClick={() => void navigate('/home/me/upload')}>
            去上传
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
                <span className="badge">私密库</span>
              </div>
              <div className="card__body">
                <h3>{item.title}</h3>
                <p>{item.description || '暂无描述'}</p>
                <div className="card__actions">
                  <button
                    type="button"
                    disabled={actingId === item.id}
                    onClick={() => {
                      void publish(item)
                    }}
                  >
                    发布
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
