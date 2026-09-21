import './TabIcon.css'

type TabIconProps = {
  name: string
}

export default function TabIcon({ name }: TabIconProps) {
  return (
    <svg className="tab-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {name === 'home' ? (
        <path
          d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      ) : name === 'shop' ? (
        <>
          <path
            d="M4 8h16l-1.2 11.2a2 2 0 0 1-2 1.8H7.2a2 2 0 0 1-2-1.8L4 8Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path d="M8 8V6a4 4 0 0 1 8 0v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </>
      ) : name === 'video' ? (
        <>
          <rect x="5" y="4" width="14" height="16" rx="3" stroke="currentColor" strokeWidth="1.8" />
          <path d="M10 9.5v5l4.5-2.5L10 9.5Z" fill="currentColor" />
        </>
      ) : name === 'live' ? (
        <>
          <circle cx="12" cy="12" r="2.6" fill="currentColor" />
          <path
            d="M7.2 7.2a6.8 6.8 0 0 0 0 9.6M16.8 7.2a6.8 6.8 0 0 1 0 9.6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </>
      ) : name === 'me' ? (
        <>
          <circle cx="12" cy="8.5" r="3.2" stroke="currentColor" strokeWidth="1.8" />
          <path
            d="M5 19.2c1.6-3 3.9-4.5 7-4.5s5.4 1.5 7 4.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </>
      ) : (
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
      )}
    </svg>
  )
}
