export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface UserLoginResponse {
  id: number
  username: string
  email: string
  token: TokenResponse
}

export interface UserRegisterResponse {
  id: number
  username: string
  email: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  username: string
  email: string
  password: string
}

export interface StoredUser {
  email: string
  password: string
  token: string
  refreshToken: string
  username: string
  user_id: number
}
