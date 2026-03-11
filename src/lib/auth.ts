import Cookies from 'js-cookie'
import type { UserInfo } from '@/types'

const TOKEN_KEY = 'token'
const USER_KEY = 'userInfo'

export const auth = {
  setToken: (token: string, expiresIn?: number) => {
    const expires = expiresIn ? expiresIn / 86400 : 1
    Cookies.set(TOKEN_KEY, token, { expires, sameSite: 'strict' })
  },

  getToken: () => Cookies.get(TOKEN_KEY),

  setUser: (user: UserInfo) => {
    Cookies.set(USER_KEY, JSON.stringify(user), { expires: 1 })
  },

  getUser: (): UserInfo | null => {
    const raw = Cookies.get(USER_KEY)
    try { return raw ? JSON.parse(raw) : null } catch { return null }
  },

  clear: () => {
    Cookies.remove(TOKEN_KEY)
    Cookies.remove(USER_KEY)
  },

  isLoggedIn: () => !!Cookies.get(TOKEN_KEY),
}
