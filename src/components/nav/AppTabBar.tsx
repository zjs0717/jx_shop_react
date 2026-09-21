import { useLocation, useNavigate } from 'react-router-dom'
import { tabList } from '@/data/menu'
import TabIcon from './TabIcon'
import './AppTabBar.css'

type AppTabBarProps = {
  dark?: boolean
}

function getActiveTabId(path: string): string {
  if (path === '/home' || path === '/home/' || path.startsWith('/home/dashboard')) return 'home'
  const hit = tabList.find(
    (tab) => tab.id !== 'home' && tab.match.some((prefix) => path === prefix || path.startsWith(`${prefix}/`)),
  )
  return hit?.id ?? ''
}

export default function AppTabBar({ dark = false }: AppTabBarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const activeId = getActiveTabId(location.pathname)

  function go(path: string): void {
    if (location.pathname === path) return
    void navigate(path)
  }

  return (
    <nav className={`tabbar${dark ? ' is-dark' : ''}`} aria-label="底部导航">
      {tabList.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`tabbar__item${activeId === tab.id ? ' is-active' : ''}`}
          onClick={() => go(tab.path)}
        >
          <span className="tabbar__icon-wrap">
            <TabIcon name={tab.icon} />
            {tab.id === 'live' ? <span className="tabbar__live-dot" aria-hidden="true" /> : null}
          </span>
          <span className="tabbar__label">{tab.title}</span>
        </button>
      ))}
    </nav>
  )
}
