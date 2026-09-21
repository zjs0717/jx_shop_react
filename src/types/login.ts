export interface LoginForm {
  username: string
  password: string
  remember: boolean
}

export interface LoginPayload {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
}

export interface RegisterResponse {
  token: string
  username: string
}
