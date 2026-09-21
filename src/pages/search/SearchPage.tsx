import { useMemo, useState } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchRelatedVideosApi, searchVideosApi } from '@/api/video'
import { queryKeys } from '@/lib/queryKeys'
import type { VideoItem } from '@/types/video'
import { formatNumber } from '@/utils/format'
import './SearchPage.css'

const EMPTY_VIDEOS: VideoItem[] = []

export function SearchPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const keyword = (searchParams.get('q') ?? '').trim()
  const [draft, setDraft] = useState(keyword)
  const [syncedKeyword, setSyncedKeyword] = useState(keyword)

  if (keyword !== syncedKeyword) {
    setSyncedKeyword(keyword)
    setDraft(keyword)
  }

  const searchQuery = useQuery({
    queryKey: queryKeys.videoSearch(keyword),
    queryFn: () => searchVideosApi(keyword),
    enabled: !!keyword,
  })

  const results = searchQuery.data?.list ?? EMPTY_VIDEOS
  const id = results[0]?.id

  const relatedQuery = useQuery({
    queryKey: queryKeys.videoRelated(id ?? ''),
    queryFn: () => fetchRelatedVideosApi(id ?? '', 8),
    enabled: !!id,
  })

  const related = useMemo(() => {
    if (!id) return EMPTY_VIDEOS
    const list = relatedQuery.data?.list ?? EMPTY_VIDEOS
    return list.filter((item) => !results.some((r) => r.id === item.id))
  }, [id, relatedQuery.data, results])

  const relatedKeywords = id ? (relatedQuery.data?.keywords ?? []) : []
  const hasQuery = keyword.length > 0
  const loading = hasQuery && searchQuery.isFetching
  const errorMessage = searchQuery.error
    ? searchQuery.error instanceof Error
      ? searchQuery.error.message
      : '搜索失败'
    : ''
  const empty = !loading && !errorMessage && hasQuery && results.length === 0

  const submit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    const q = draft.trim()
    if (!q) return
    setSearchParams({ q })
  }

  const openVideo = (item: VideoItem): void => {
    void navigate(`/home/video?v=${item.id}`)
  }

  const onCardKeyDown = (event: KeyboardEvent<HTMLElement>, item: VideoItem): void => {
    if (event.key === 'Enter') openVideo(item)
  }

  const searchTag = (tag: string): void => {
    setDraft(tag)
    setSearchParams({ q: tag })
  }

  return (
    <section className="search">
      <header className="search__head">
        <button type="button" className="search__back" onClick={() => navigate(-1)}>
          返回
        </button>
        <form className="search__box" onSubmit={submit}>
          <span className="search__icon" aria-hidden="true">
            ⌕
          </span>
          <input
            className="search__input"
            type="search"
            maxLength={80}
            placeholder="搜标题、标签、创作者"
            enterKeyHint="search"
            autoFocus
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
          <button type="submit" className="search__go">
            搜索
          </button>
        </form>
      </header>

      {errorMessage ? <p className="search__error">{errorMessage}</p> : null}

      {!hasQuery ? (
        <div className="search__hint">
          <h1>搜相关短视频</h1>
          <p>输入标题、标签或创作者昵称，找到你想刷的内容</p>
        </div>
      ) : loading ? (
        <div className="search__hint">正在搜索「{keyword}」…</div>
      ) : empty ? (
        <div className="search__hint">
          <h2>没有找到相关视频</h2>
          <p>换个关键词试试，或去推荐流随便刷刷</p>
          <button type="button" className="search__cta" onClick={() => void navigate('/home/video')}>
            去刷推荐
          </button>
        </div>
      ) : (
        <>
          <div className="search__meta">
            找到 <strong>{results.length}</strong> 条与「{keyword}」相关的短视频
          </div>

          <div className="grid">
            {results.map((item) => (
              <article
                key={item.id}
                className="card"
                role="button"
                tabIndex={0}
                onClick={() => openVideo(item)}
                onKeyDown={(event) => onCardKeyDown(event, item)}
              >
                <div className="card__cover">
                  {item.cover ? (
                    <img src={item.cover} alt={item.title} loading="lazy" />
                  ) : (
                    <div className="card__blank" />
                  )}
                  <span className="card__plays">{formatNumber(item.playCount)} 播</span>
                </div>
                <div className="card__body">
                  <h3>{item.title}</h3>
                  <p>
                    @{item.author} · {formatNumber(item.likeCount)} 赞
                  </p>
                  {item.tags?.length ? (
                    <div className="card__tags">
                      {item.tags.slice(0, 3).map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            searchTag(tag)
                          }}
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </article>
            ))}
          </div>

          {related.length ? (
            <section className="related">
              <div className="related__head">
                <h2>相关推荐</h2>
                {relatedKeywords.length ? (
                  <p>基于 {relatedKeywords.slice(0, 3).join(' · ')}</p>
                ) : null}
              </div>
              <div className="grid">
                {related.map((item) => (
                  <article
                    key={`rel-${item.id}`}
                    className="card"
                    role="button"
                    tabIndex={0}
                    onClick={() => openVideo(item)}
                    onKeyDown={(event) => onCardKeyDown(event, item)}
                  >
                    <div className="card__cover">
                      {item.cover ? (
                        <img src={item.cover} alt={item.title} loading="lazy" />
                      ) : (
                        <div className="card__blank" />
                      )}
                      <span className="card__plays">{formatNumber(item.playCount)} 播</span>
                    </div>
                    <div className="card__body">
                      <h3>{item.title}</h3>
                      <p>
                        @{item.author} · {formatNumber(item.likeCount)} 赞
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ) : null}
        </>
      )}
    </section>
  )
}
