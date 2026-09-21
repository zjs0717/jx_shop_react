import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { uploadMyVideoApi } from '@/api/user'
import { queryKeys } from '@/lib/queryKeys'
import type { UserVideoStatus } from '@/types/user'
import './UploadVideo.css'

function revoke(url: string): void {
  if (url.startsWith('blob:')) URL.revokeObjectURL(url)
}

export function UploadVideo() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const videoInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const navTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState('')
  const [coverPreview, setCoverPreview] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [city, setCity] = useState('')
  const [status, setStatus] = useState<UserVideoStatus>('published')
  const [duration, setDuration] = useState(0)
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const uploadMutation = useMutation({
    mutationFn: uploadMyVideoApi,
  })

  useEffect(() => {
    return () => {
      revoke(videoPreview)
    }
  }, [videoPreview])

  useEffect(() => {
    return () => {
      revoke(coverPreview)
    }
  }, [coverPreview])

  useEffect(() => {
    return () => {
      if (navTimerRef.current) clearTimeout(navTimerRef.current)
    }
  }, [])

  function onPickVideo(e: ChangeEvent<HTMLInputElement>): void {
    const file = e.target.files?.[0]
    if (!file) return
    revoke(videoPreview)
    setVideoFile(file)
    const url = URL.createObjectURL(file)
    setVideoPreview(url)

    const probe = document.createElement('video')
    probe.preload = 'metadata'
    probe.src = url
    probe.onloadedmetadata = () => {
      setDuration(Number.isFinite(probe.duration) ? Math.round(probe.duration * 10) / 10 : 0)
      setWidth(probe.videoWidth || 0)
      setHeight(probe.videoHeight || 0)
    }
  }

  function onPickCover(e: ChangeEvent<HTMLInputElement>): void {
    const file = e.target.files?.[0]
    if (!file) return
    revoke(coverPreview)
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
  }

  async function submit(e: FormEvent): Promise<void> {
    e.preventDefault()
    if (!videoFile) {
      setError('请先选择短视频文件')
      return
    }
    if (!title.trim()) {
      setError('请填写标题')
      return
    }

    setError('')
    setSuccessMsg('')
    try {
      const created = await uploadMutation.mutateAsync({
        video: videoFile,
        cover: coverFile,
        title: title.trim(),
        description: description.trim(),
        tags: tags.trim(),
        city: city.trim(),
        status,
        duration,
        width,
        height,
      })
      await queryClient.invalidateQueries({ queryKey: queryKeys.myVideos() })
      await queryClient.invalidateQueries({ queryKey: queryKeys.videoFeed })
      setSuccessMsg(status === 'published' ? '已发布到推荐流' : '已保存到视频库')
      navTimerRef.current = setTimeout(() => {
        void navigate(created.status === 'published' ? '/home/video' : '/home/me/library')
      }, 600)
    } catch (err) {
      setError(err instanceof Error ? err.message : '上传失败')
    }
  }

  const uploading = uploadMutation.isPending

  return (
    <div className="studio">
      <header className="studio__head">
        <button type="button" className="back" onClick={() => void navigate('/home/me')}>
          ← 返回我的
        </button>
        <div>
          <h1>发布作品</h1>
          <p>左侧预览 · 右侧填写 · 一键发布到推荐或存入视频库</p>
        </div>
      </header>

      <form className="studio__body" onSubmit={(e) => void submit(e)}>
        <aside className="preview">
          <div className="phone">
            <div className="phone__screen">
              {videoPreview ? (
                <video className="phone__video" src={videoPreview} muted playsInline controls />
              ) : coverPreview ? (
                <img className="phone__cover" src={coverPreview} alt="封面预览" />
              ) : (
                <div className="phone__empty">
                  <strong>作品预览</strong>
                  <span>上传后在这里预览竖屏效果</span>
                </div>
              )}
              {title ? (
                <div className="phone__caption">
                  <p>@你</p>
                  <h3>{title}</h3>
                </div>
              ) : null}
            </div>
          </div>

          <div className="upload-row">
            <button type="button" className="upload-btn" onClick={() => videoInputRef.current?.click()}>
              {videoFile ? '更换视频' : '选择视频'}
            </button>
            <button
              type="button"
              className="upload-btn upload-btn--ghost"
              onClick={() => coverInputRef.current?.click()}
            >
              {coverFile ? '更换封面' : '选择封面'}
            </button>
          </div>
          <p className="hint">支持 mp4 / webm / mov，最大 120MB</p>
          {videoFile ? (
            <p className="meta">
              <span>{videoFile.name}</span>
              {duration ? <span>{duration}s</span> : null}
              {width && height ? (
                <span>
                  {width}×{height}
                </span>
              ) : null}
            </p>
          ) : null}
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            hidden
            onChange={onPickVideo}
          />
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={onPickCover}
          />
        </aside>

        <section className="editor">
          <label className="field">
            <span>标题</span>
            <input
              value={title}
              maxLength={120}
              placeholder="给作品起个吸引人的标题"
              required
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>

          <label className="field">
            <span>描述</span>
            <textarea
              value={description}
              maxLength={500}
              rows={4}
              placeholder="说说这条视频想表达什么"
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>

          <div className="row2">
            <label className="field">
              <span>标签</span>
              <input
                value={tags}
                maxLength={100}
                placeholder="穿搭,日常"
                onChange={(e) => setTags(e.target.value)}
              />
            </label>
            <label className="field">
              <span>同城</span>
              <input
                value={city}
                maxLength={50}
                placeholder="上海"
                onChange={(e) => setCity(e.target.value)}
              />
            </label>
          </div>

          <div className="publish-mode">
            <p className="publish-mode__title">发布方式</p>
            <div className="seg">
              <button
                type="button"
                className={`seg__item${status === 'published' ? ' is-active' : ''}`}
                onClick={() => setStatus('published')}
              >
                发布到推荐
              </button>
              <button
                type="button"
                className={`seg__item${status === 'library' ? ' is-active' : ''}`}
                onClick={() => setStatus('library')}
              >
                先存视频库
              </button>
            </div>
          </div>

          {error ? <p className="err">{error}</p> : null}
          {successMsg ? <p className="ok">{successMsg}</p> : null}

          <div className="actions">
            <button type="button" className="ghost" onClick={() => void navigate('/home/me')}>
              取消
            </button>
            <button type="submit" className="primary" disabled={uploading}>
              {uploading ? '上传中…' : status === 'published' ? '发布作品' : '保存到视频库'}
            </button>
          </div>
        </section>
      </form>
    </div>
  )
}
