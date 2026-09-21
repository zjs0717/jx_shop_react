import type { UserGender } from '@/types/user'

export const genderLabel = (gender?: UserGender | string): string => {
  switch (gender) {
    case 'male':
      return '男'
    case 'female':
      return '女'
    case 'other':
      return '其他'
    default:
      return '未设置'
  }
}

export function formatCount(n: number): string {
  if (n >= 10000) return `${(n / 10000).toFixed(n >= 100000 ? 1 : 2)}万`
  return n.toLocaleString('zh-CN')
}
