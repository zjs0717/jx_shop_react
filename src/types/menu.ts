export interface MenuItem {
  id: string
  title: string
  path?: string
  icon?: string
  children?: MenuItem[]
}

export interface TabItem {
  id: string
  title: string
  path: string
  icon: string
  match: string[]
}
