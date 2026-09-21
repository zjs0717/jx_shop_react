import { useEffect, useState } from 'react'
import { heroSlideImages } from '@/data/heroSlides'
import './HeroSlideshow.css'

type HeroSlideshowProps = {
  images?: string[]
  interval?: number
  showDots?: boolean
}

export default function HeroSlideshow({
  images = heroSlideImages,
  interval = 5200,
  showDots = true,
}: HeroSlideshowProps) {
  const slides = images.length ? images : heroSlideImages
  const [index, setIndex] = useState(0)
  const [epoch, setEpoch] = useState(0)
  const slideSig = `${interval}:${slides.length}`
  const [prevSig, setPrevSig] = useState(slideSig)
  if (prevSig !== slideSig) {
    setPrevSig(slideSig)
    setIndex(0)
  }

  useEffect(() => {
    if (slides.length <= 1) return
    const timer = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length)
    }, interval)
    return () => window.clearInterval(timer)
  }, [interval, slides.length, epoch])

  function go(next: number): void {
    const len = slides.length
    if (len <= 0) return
    setIndex(((next % len) + len) % len)
  }

  return (
    <>
      <div className="slides" aria-hidden="true">
        {slides.map((src, i) => (
          <img
            key={src}
            className={`slides__img${i === index ? ' is-active' : ''}`}
            src={src}
            alt=""
            decoding="async"
            loading={i === 0 ? 'eager' : 'lazy'}
          />
        ))}
      </div>
      {showDots && slides.length > 1 ? (
        <div className="slides__dots" aria-hidden="true">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`slides__dot${i === index ? ' is-active' : ''}`}
              tabIndex={-1}
              onClick={() => {
                go(i)
                setEpoch((n) => n + 1)
              }}
            />
          ))}
        </div>
      ) : null}
    </>
  )
}
