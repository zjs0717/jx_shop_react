import { useLocation, useNavigate } from 'react-router-dom'
import BrandMark from '@/components/brand/BrandMark'
import { tabList } from '@/data/menu'
import TabIcon from './TabIcon'
import './AppSideNav.css'

type AppSideNavProps = {
  dark?: boolean
}

function getActiveTabId(path: string): string {
  if (path === '/home' || path === '/home/' || path.startsWith('/home/dashboard')) return 'home'
  const hit = tabList.find(
    (tab) => tab.id !== 'home' && tab.match.some((prefix) => path === prefix || path.startsWith(`${prefix}/`)),
  )
  return hit?.id ?? ''
}

export default function AppSideNav({ dark = false }: AppSideNavProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const activeId = getActiveTabId(location.pathname)

  function go(path: string): void {
    if (location.pathname === path) return
    void navigate(path)
  }

  return (
    <aside className={`sidenav${dark ? ' is-dark' : ''}`} aria-label="主导航">
      <div className="sidenav__brand">
        <BrandMark size={40} />
        <div className="sidenav__brand-text">
          <strong>乐享</strong>
          <span>分享美好 · 传播快乐</span>
        </div>
      </div>

      <nav className="sidenav__nav">
        {tabList.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`sidenav__item${activeId === tab.id ? ' is-active' : ''}`}
            onClick={() => go(tab.path)}
          >
            <span className="sidenav__icon">
              <TabIcon name={tab.icon} />
              {tab.id === 'live' ? <span className="sidenav__live-dot" aria-hidden="true" /> : null}
            </span>
            <span className="sidenav__label">{tab.title}</span>
          </button>
        ))}
      </nav>

      <p className="sidenav__foot">逛得到 · 刷不停</p>
    </aside>
  )
}
