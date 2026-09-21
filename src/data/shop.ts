export interface ShopProduct {
  id: string
  title: string
  price: number
  originPrice?: number
  sales: number
  cover: string
  tag?: string
  category: string
}

export interface ShopCategory {
  id: string
  name: string
}

export const shopCategories: ShopCategory[] = [
  { id: 'all', name: '全部' },
  { id: 'beauty', name: '美妆' },
  { id: 'digital', name: '数码' },
  { id: 'home', name: '家居' },
  { id: 'fashion', name: '穿搭' },
  { id: 'food', name: '零食' },
  { id: 'sport', name: '运动' },
]

export const shopProducts: ShopProduct[] = [
  {
    id: 'p1',
    title: '柔雾唇釉套装 · 日常显白三色',
    price: 89,
    originPrice: 129,
    sales: 12840,
    cover: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80',
    tag: '直播同款',
    category: 'beauty',
  },
  {
    id: 'p2',
    title: '降噪蓝牙耳机 Pro · 续航 36h',
    price: 299,
    originPrice: 459,
    sales: 8621,
    cover: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80',
    tag: '热卖',
    category: 'digital',
  },
  {
    id: 'p3',
    title: '北欧陶瓷咖啡杯双件套',
    price: 68,
    originPrice: 98,
    sales: 5402,
    cover: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&q=80',
    category: 'home',
  },
  {
    id: 'p4',
    title: '轻盈运动夹克 · 防泼水',
    price: 199,
    originPrice: 329,
    sales: 3310,
    cover: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80',
    tag: '上新',
    category: 'fashion',
  },
  {
    id: 'p5',
    title: '日式低糖曲奇礼盒',
    price: 49,
    originPrice: 69,
    sales: 21088,
    cover: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&q=80',
    tag: '爆款',
    category: 'food',
  },
  {
    id: 'p6',
    title: '便携筋膜枪 · 深层放松',
    price: 259,
    originPrice: 399,
    sales: 4190,
    cover: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80',
    category: 'sport',
  },
  {
    id: 'p7',
    title: '极简机械键盘 · 青轴热插拔',
    price: 349,
    originPrice: 499,
    sales: 2760,
    cover: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=600&q=80',
    category: 'digital',
  },
  {
    id: 'p8',
    title: '丝绒沙发靠垫 · 双色可选',
    price: 79,
    originPrice: 119,
    sales: 6933,
    cover: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80',
    category: 'home',
  },
]

export function formatSales(n: number): string {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}万+`
  return `${n}`
}
