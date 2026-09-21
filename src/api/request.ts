export interface ApiResponseBody<T> {
  code: number
  data: T
  message: string
}

export class ApiError extends Error {
  code: number

  constructor(message: string, code: number) {
    super(message)
    this.name = 'ApiError'
    this.code = code
  }
}

const TOKEN_KEY = 'auth_token'

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY)

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token)
}

export const clearToken = (): void => {
  localStorage.removeItem(TOKEN_KEY)
}

export async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json')
  }

  const token = getToken()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  let body: ApiResponseBody<T>
  try {
    body = (await response.json()) as ApiResponseBody<T>
  } catch {
    throw new ApiError('请求失败，请稍后重试', response.status || 500)
  }

  if (body.code !== 200) {
    throw new ApiError(body.message || '请求失败，请稍后重试', body.code)
  }

  return body.data
}
