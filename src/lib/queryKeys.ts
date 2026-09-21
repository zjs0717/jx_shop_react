export const queryKeys = {
  profile: ['user', 'profile'] as const,
  addresses: ['user', 'addresses'] as const,
  myVideos: (status?: string) => ['user', 'videos', status ?? 'all'] as const,
  videoFeed: ['video', 'feed'] as const,
  videoSearch: (keyword: string) => ['video', 'search', keyword] as const,
  videoRelated: (id: string | number) => ['video', 'related', String(id)] as const,
  userSpace: (id: number) => ['user', 'space', id] as const,
  dashboard: ['dashboard', 'overview'] as const,
}
