import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import type { MouseEvent } from 'react'
import './ShortVideoPlayer.css'

export type ShortVideoPlayerHandle = {
  togglePlay: () => Promise<void>
  tryPlay: () => Promise<void>
  pause: () => void
}

type ShortVideoPlayerProps = {
  src: string
  cover?: string
  active?: boolean
  onPlay?: () => void
  onPause?: () => void
  onEnded?: () => void
  onError?: (message: string) => void
}

const ShortVideoPlayer = forwardRef<ShortVideoPlayerHandle, ShortVideoPlayerProps>(function ShortVideoPlayer(
  { src, cover = '', active = false, onPlay, onPause, onEnded, onError },
  ref,
) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const playingRef = useRef(false)
  const skipWatch = useRef(true)
  const mutedRef = useRef(true)
  const [ready, setReady] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(true)
  const [progress, setProgress] = useState(0)
  const [showControls, setShowControls] = useState(true)
  const [errorText, setErrorText] = useState('')
  const mediaSig = `${active}:${src}`
  const [prevMedia, setPrevMedia] = useState(mediaSig)
  if (prevMedia !== mediaSig) {
    setPrevMedia(mediaSig)
    if (!active) setProgress(0)
  }

  const bumpControls = useCallback(() => {
    setShowControls(true)
    if (hideTimer.current) clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => {
      if (playingRef.current) setShowControls(false)
    }, 1600)
  }, [])

  const tryPlay = useCallback(async () => {
    const el = videoRef.current
    if (!el || !src) return
    try {
      el.muted = mutedRef.current
      el.playsInline = true
      el.setAttribute('playsinline', '')
      el.setAttribute('webkit-playsinline', '')
      const p = el.play()
      if (p !== undefined) await p
      playingRef.current = true
      setPlaying(true)
      setErrorText('')
      onPlay?.()
      bumpControls()
    } catch {
      playingRef.current = false
      setPlaying(false)
    }
  }, [src, onPlay, bumpControls])

  const pause = useCallback(() => {
    const el = videoRef.current
    if (!el) return
    el.pause()
    playingRef.current = false
    setPlaying(false)
    onPause?.()
    setShowControls(true)
  }, [onPause])

  const togglePlay = useCallback(async () => {
    if (playingRef.current) pause()
    else await tryPlay()
  }, [pause, tryPlay])

  useImperativeHandle(ref, () => ({ togglePlay, tryPlay, pause }), [togglePlay, tryPlay, pause])

  async function toggleMute(): Promise<void> {
    const next = !muted
    mutedRef.current = next
    setMuted(next)
    if (videoRef.current) {
      videoRef.current.muted = next
    }
    if (!next && !playingRef.current) {
      await tryPlay()
    }
    bumpControls()
  }

  function onTimeUpdate(): void {
    const el = videoRef.current
    if (!el || !el.duration) return
    setProgress((el.currentTime / el.duration) * 100)
  }

  function onLoaded(): void {
    setReady(true)
    setErrorText('')
    if (active) void tryPlay()
  }

  function handleEnded(): void {
    playingRef.current = false
    setPlaying(false)
    setProgress(100)
    setShowControls(true)
    onEnded?.()
  }

  function handleError(): void {
    const el = videoRef.current
    const code = el?.error?.code
    const message = code === 4 ? '视频地址无效或无法访问' : '视频加载失败'
    setErrorText(message)
    playingRef.current = false
    setPlaying(false)
    setReady(false)
    onError?.(message)
  }

  function seek(e: MouseEvent<HTMLDivElement>): void {
    const el = videoRef.current
    const bar = e.currentTarget
    if (!el || !el.duration) return
    const rect = bar.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
    el.currentTime = ratio * el.duration
    setProgress(ratio * 100)
    bumpControls()
  }

  function bindVideo(el: HTMLVideoElement | null): void {
    videoRef.current = el
    if (!el) return
    el.setAttribute('playsinline', '')
    el.setAttribute('webkit-playsinline', '')
    el.setAttribute('x5-playsinline', '')
    el.setAttribute('x5-video-player-type', 'h5')
    el.setAttribute('x5-video-player-fullscreen', 'false')
  }

  const tryPlayRef = useRef(tryPlay)
  const pauseRef = useRef(pause)

  useEffect(() => {
    tryPlayRef.current = tryPlay
    pauseRef.current = pause
  }, [tryPlay, pause])

  useEffect(() => {
    if (skipWatch.current) {
      skipWatch.current = false
      return
    }
    if (active) {
      void tryPlayRef.current()
    } else {
      pauseRef.current()
      if (videoRef.current) videoRef.current.currentTime = 0
    }
  }, [active, src])

  useEffect(() => {
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current)
      videoRef.current?.pause()
    }
  }, [])

  const progressStyle = { width: `${Math.min(100, Math.max(0, progress))}%` }
  const uiShow = showControls || !playing

  return (
    <div className="svp" onClick={() => void togglePlay()}>
      <video
        ref={bindVideo}
        className="svp__video"
        src={src}
        poster={cover || undefined}
        playsInline
        preload="metadata"
        loop
        muted={muted}
        onLoadedData={onLoaded}
        onCanPlay={onLoaded}
        onTimeUpdate={onTimeUpdate}
        onEnded={handleEnded}
        onError={handleError}
        onWaiting={() => setReady(false)}
        onPlaying={() => setReady(true)}
      />

      {!ready && !errorText ? <div className="svp__loading">加载中…</div> : null}
      {errorText ? <div className="svp__error">{errorText}</div> : null}

      <div className={`svp__ui${uiShow ? ' is-show' : ''}`}>
        <button
          type="button"
          className="svp__center"
          aria-label={playing ? '暂停' : '播放'}
          onClick={(e) => {
            e.stopPropagation()
            void togglePlay()
          }}
        >
          {playing ? '❚❚' : '▶'}
        </button>

        <div
          className="svp__bottom"
          onClick={(e) => {
            e.stopPropagation()
          }}
        >
          <div className="svp__bar" onClick={seek}>
            <i style={progressStyle} />
          </div>
          <button type="button" className="svp__mute" onClick={() => void toggleMute()}>
            {muted ? '取消静音' : '静音'}
          </button>
        </div>
      </div>
    </div>
  )
})

export default ShortVideoPlayer
