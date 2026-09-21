export interface LiveRoom {
  id: string
  title: string
  host: string
  viewers: number
  cover: string
  tag: string
  productHint?: string
  status: 'live' | 'preview' | 'replay'
  startAt?: string
}

export const liveRooms: LiveRoom[] = [
  {
    id: 'l1',
    title: '春季穿搭上新 · 今晚 5 折开抢',
    host: '小橘买手',
    viewers: 28640,
    cover: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80',
    tag: '服饰',
    productHint: '在播 12 件好物',
    status: 'live',
  },
  {
    id: 'l2',
    title: '美妆实验室 · 新品试色直播',
    host: '阿梨美妆',
    viewers: 15210,
    cover: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80',
    tag: '美妆',
    productHint: '唇釉套装热卖中',
    status: 'live',
  },
  {
    id: 'l3',
    title: '厨房好物清仓夜',
    host: '居家小分队',
    viewers: 9340,
    cover: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80',
    tag: '家居',
    productHint: '限时秒杀',
    status: 'live',
  },
  {
    id: 'l4',
    title: '数码开箱 · 耳机耳机耳机',
    host: '极客阿森',
    viewers: 12088,
    cover: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80',
    tag: '数码',
    productHint: '降噪耳机专场',
    status: 'live',
  },
]

export const livePreviews: LiveRoom[] = [
  {
    id: 'p1',
    title: '周末市集 · 手作与零食',
    host: '市集主理人',
    viewers: 0,
    cover: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&q=80',
    tag: '预告',
    status: 'preview',
    startAt: '明天 20:00',
  },
  {
    id: 'p2',
    title: '运动装备闭门场',
    host: '跑者小周',
    viewers: 0,
    cover: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80',
    tag: '预告',
    status: 'preview',
    startAt: '周五 19:30',
  },
]

export const liveReplays: LiveRoom[] = [
  {
    id: 'r1',
    title: '昨夜爆款复盘 · 口红专场',
    host: '阿梨美妆',
    viewers: 42000,
    cover: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&q=80',
    tag: '回放',
    status: 'replay',
  },
  {
    id: 'r2',
    title: '家居收纳挑战赛',
    host: '居家小分队',
    viewers: 18800,
    cover: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80',
    tag: '回放',
    status: 'replay',
  },
]

export function formatViewers(n: number): string {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}万`
  return `${n}`
}
