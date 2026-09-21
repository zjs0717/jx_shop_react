import { lazy, type ComponentType } from 'react'
import { createHashRouter, Navigate } from 'react-router-dom'
import HomeLayout from '@/layouts/HomeLayout'

function lazyPage<T extends Record<string, ComponentType>>(
  loader: () => Promise<T>,
  name: keyof T,
) {
  return lazy(() => loader().then((mod) => ({ default: mod[name] })))
}

const LoginPage = lazyPage(() => import('@/pages/auth/LoginPage'), 'LoginPage')
const RegisterPage = lazyPage(() => import('@/pages/auth/RegisterPage'), 'RegisterPage')
const DiscoverPage = lazyPage(() => import('@/pages/discover/DiscoverPage'), 'DiscoverPage')
const DashboardPage = lazyPage(() => import('@/pages/dashboard/DashboardPage'), 'DashboardPage')
const ShopHome = lazyPage(() => import('@/pages/shop/ShopHome'), 'ShopHome')
const ShopCategory = lazyPage(() => import('@/pages/shop/ShopCategory'), 'ShopCategory')
const ShopCart = lazyPage(() => import('@/pages/shop/ShopCart'), 'ShopCart')
const ShopOrders = lazyPage(() => import('@/pages/shop/ShopOrders'), 'ShopOrders')
const VideoFeed = lazyPage(() => import('@/pages/video/VideoFeed'), 'VideoFeed')
const VideoFollow = lazyPage(() => import('@/pages/video/VideoFollow'), 'VideoFollow')
const VideoNearby = lazyPage(() => import('@/pages/video/VideoNearby'), 'VideoNearby')
const SearchPage = lazyPage(() => import('@/pages/search/SearchPage'), 'SearchPage')
const UserSpace = lazyPage(() => import('@/pages/user/UserSpace'), 'UserSpace')
const LiveHall = lazyPage(() => import('@/pages/live/LiveHall'), 'LiveHall')
const LivePreview = lazyPage(() => import('@/pages/live/LivePreview'), 'LivePreview')
const LiveReplay = lazyPage(() => import('@/pages/live/LiveReplay'), 'LiveReplay')
const MeHome = lazyPage(() => import('@/pages/me/MeHome'), 'MeHome')
const ProfilePage = lazyPage(() => import('@/pages/me/ProfilePage'), 'ProfilePage')
const AddressPage = lazyPage(() => import('@/pages/me/AddressPage'), 'AddressPage')
const VideoLibrary = lazyPage(() => import('@/pages/me/VideoLibrary'), 'VideoLibrary')
const PublishedVideos = lazyPage(() => import('@/pages/me/PublishedVideos'), 'PublishedVideos')
const UploadVideo = lazyPage(() => import('@/pages/me/UploadVideo'), 'UploadVideo')

export const router = createHashRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/home',
    element: <HomeLayout />,
    children: [
      { index: true, element: <DiscoverPage /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'shop', element: <ShopHome /> },
      { path: 'shop/category', element: <ShopCategory /> },
      { path: 'shop/cart', element: <ShopCart /> },
      { path: 'shop/orders', element: <ShopOrders /> },
      { path: 'video', element: <VideoFeed /> },
      { path: 'video/follow', element: <VideoFollow /> },
      { path: 'video/nearby', element: <VideoNearby /> },
      { path: 'search', element: <SearchPage /> },
      { path: 'user/:id', element: <UserSpace /> },
      { path: 'live', element: <LiveHall /> },
      { path: 'live/preview', element: <LivePreview /> },
      { path: 'live/replay', element: <LiveReplay /> },
      { path: 'me', element: <MeHome /> },
      { path: 'me/profile', element: <ProfilePage /> },
      { path: 'me/address', element: <AddressPage /> },
      { path: 'me/library', element: <VideoLibrary /> },
      { path: 'me/published', element: <PublishedVideos /> },
      { path: 'me/upload', element: <UploadVideo /> },
    ],
  },
])
