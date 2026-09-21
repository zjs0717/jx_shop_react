import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import BrandMark from '@/components/brand/BrandMark'
import './AppTopBar.css'

type AppTopBarProps = {
  showSearch?: boolean
  placeholder?: string
}

export default function AppTopBar({
  showSearch = true,
  placeholder = '搜短视频、标签、创作者',
}: AppTopBarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const searchQ = location.pathname.startsWith('/home/search')
    ? new URLSearchParams(location.search).get('q') || ''
    : null
  const [keyword, setKeyword] = useState(searchQ ?? '')
  const [prevSearchQ, setPrevSearchQ] = useState(searchQ)
  if (searchQ !== null && searchQ !== prevSearchQ) {
    setPrevSearchQ(searchQ)
    setKeyword(searchQ)
  }

  function goCart(): void {
    void navigate('/home/shop/cart')
  }

  function goMe(): void {
    void navigate('/home/me')
  }

  function onSearch(e: FormEvent<HTMLFormElement>): void {
    e.preventDefault()
    const q = keyword.trim()
    if (!q) {
      void navigate('/home/search')
      return
    }
    void navigate(`/home/search?q=${encodeURIComponent(q)}`)
  }

  return (
    <header className="topbar">
      <Link to="/home" className="topbar__brand" aria-label="乐享首页">
        <BrandMark size={32} />
        <span className="topbar__name">乐享</span>
      </Link>

      {showSearch !== false ? (
        <form className="topbar__search" onSubmit={onSearch}>
          <span className="topbar__search-icon" aria-hidden="true">
            ⌕
          </span>
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="topbar__input"
            type="search"
            placeholder={placeholder}
            enterKeyHint="search"
          />
        </form>
      ) : null}

      <div className="topbar__actions">
        <button type="button" className="topbar__btn" title="购物车" onClick={goCart}>
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M3 4h2l2.2 11h10.6L21 7H7"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="10" cy="19" r="1.4" fill="currentColor" />
            <circle cx="17" cy="19" r="1.4" fill="currentColor" />
          </svg>
        </button>
        <button type="button" className="topbar__btn topbar__btn--text" onClick={goMe}>
          我的
        </button>
      </div>
    </header>
  )
}
