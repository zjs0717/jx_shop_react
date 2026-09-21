export function formatNumber(value: number): string {
  if (value >= 10000) {
    return `${(value / 10000).toFixed(value >= 100000 ? 1 : 2)}万`
  }
  return value.toLocaleString('zh-CN')
}

export function formatMoney(value: number): string {
  if (value >= 10000) {
    return `¥${(value / 10000).toFixed(2)}万`
  }
  return `¥${value.toLocaleString('zh-CN')}`
}

export function formatUpdatedAt(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '--'
  const hh = String(date.getHours()).padStart(2, '0')
  const mm = String(date.getMinutes()).padStart(2, '0')
  const ss = String(date.getSeconds()).padStart(2, '0')
  return `${hh}:${mm}:${ss}`
}

export const moduleLabel: Record<string, string> = {
  shop: '购物',
  video: '短视频',
  live: '直播',
}
