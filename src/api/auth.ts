import { request, setToken } from '@/api/request'
import type { LoginPayload, LoginResponse, RegisterResponse } from '@/types/login'

export const loginApi = async (payload: LoginPayload): Promise<LoginResponse> => {
  const data = await request<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  setToken(data.token)
  return data
}

export const registerApi = async (payload: LoginPayload): Promise<RegisterResponse> => {
  const data = await request<RegisterResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  setToken(data.token)
  return data
}
