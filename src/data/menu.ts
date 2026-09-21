import type { TabItem } from '@/types/menu'

export const tabList: TabItem[] = [
  {
    id: 'home',
    title: '首页',
    path: '/home',
    icon: 'home',
    match: ['/home', '/home/dashboard'],
  },
  {
    id: 'shop',
    title: '商城',
    path: '/home/shop',
    icon: 'shop',
    match: ['/home/shop'],
  },
  {
    id: 'video',
    title: '短视频',
    path: '/home/video',
    icon: 'video',
    match: ['/home/video'],
  },
  {
    id: 'live',
    title: '直播',
    path: '/home/live',
    icon: 'live',
    match: ['/home/live'],
  },
  {
    id: 'me',
    title: '我的',
    path: '/home/me',
    icon: 'me',
    match: ['/home/me'],
  },
]

export default tabList
