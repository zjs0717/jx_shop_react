import { useId } from 'react'
import './BrandMark.css'

type BrandMarkProps = {
  size?: number | string
}

export default function BrandMark({ size = 40 }: BrandMarkProps) {
  const uid = useId().replace(/:/g, '')
  const gradId = `lx-grad-${uid}`
  const box = typeof size === 'number' ? `${size}px` : size

  return (
    <span className="brand-mark" style={{ width: box, height: box }} aria-hidden="true">
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={gradId} x1="8" y1="6" x2="56" y2="58" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FF7A00" />
            <stop offset="0.5" stopColor="#FF2D7A" />
            <stop offset="1" stopColor="#7B3EFF" />
          </linearGradient>
        </defs>

        {/* 地方：外方 */}
        <rect fill={`url(#${gradId})`} x="4" y="4" width="56" height="56" rx="10" />

        {/* 天圆：内圆 */}
        <circle cx="32" cy="32" r="18.5" fill="#fff" />

        {/* 短视频：圆内播放 */}
        <path fill={`url(#${gradId})`} d="M27.5 23.8v16.4L42.2 32 27.5 23.8Z" />
      </svg>
    </span>
  )
}
