import request from '@/lib/request'
import type { ApiResponse, LoginRequest, LoginResponse, RegisterRequest, UserInfo } from '@/types'

export const authApi = {
  login: (data: LoginRequest) =>
    request.post<never, ApiResponse<LoginResponse>>('/auth/login', data),

  register: (data: RegisterRequest) =>
    request.post<never, ApiResponse<UserInfo>>('/auth/register', data),

  logout: () =>
    request.post<never, ApiResponse<null>>('/auth/logout'),

  me: () =>
    request.get<never, ApiResponse<UserInfo>>('/auth/me'),
}
