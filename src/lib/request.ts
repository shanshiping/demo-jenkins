import axios from 'axios'
import Cookies from 'js-cookie'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

// 请求拦截器 - 自动附加 token
request.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器
request.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status
    if (status === 401) {
      Cookies.remove('token')
      Cookies.remove('userInfo')
      window.location.href = '/login'
    }
    return Promise.reject(error.response?.data || error)
  }
)

export default request
