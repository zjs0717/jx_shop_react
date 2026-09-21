import { Outlet, useLocation } from 'react-router-dom'
import AppSideNav from '@/components/nav/AppSideNav'
import AppTabBar from '@/components/nav/AppTabBar'
import AppTopBar from '@/components/nav/AppTopBar'
import { useLayoutMode } from '@/stores/layout'
import './HomeLayout.css'

export default function HomeLayout() {
  const { pathname } = useLocation()
  const { mode, isPc, isTouchLayout } = useLayoutMode()

  const isVideo = pathname.startsWith('/home/video')
  const isDiscover = pathname === '/home' || pathname === '/home/'
  const isDashboard = pathname === '/home/dashboard' || pathname.startsWith('/home/dashboard/')
  const isMe = pathname.startsWith('/home/me')
  const isUser = pathname.startsWith('/home/user')
  const isSearch = pathname === '/home/search' || pathname.startsWith('/home/search/')
  const hideTop = isVideo || isDiscover || isDashboard || isMe || isUser || isSearch
  const darkChrome = isVideo || isDiscover || isUser

  const className = [
    'app-shell',
    `is-${mode}`,
    isVideo && 'is-video',
    isDiscover && 'is-discover',
    isDashboard && 'is-dashboard',
    isUser && 'is-user',
    isPc && 'is-pc',
    isTouchLayout && 'is-touch',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={className}>
      {isPc ? <AppSideNav dark={darkChrome} /> : null}

      <div className="app-shell__body">
        {!hideTop ? <AppTopBar /> : null}

        <main className="app-shell__main">
          <Outlet />
        </main>

        {isTouchLayout ? <AppTabBar dark={darkChrome} /> : null}
      </div>
    </div>
  )
}
