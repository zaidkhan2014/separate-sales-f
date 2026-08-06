import axios, { AxiosError } from 'axios'
import { clearSession, getAccessToken } from '@/features/auth/session'
import { routes } from '@/router/paths'
import type { ErrorResponse } from '@/api/types'

function redirectToLogin() {
  if (window.location.pathname !== routes.login) {
    window.location.assign(routes.login)
  }
}

export const adminClient = axios.create({
  baseURL: import.meta.env.VITE_ADMIN_API_BASE_URL ?? '',
  timeout: 20000,
})

adminClient.interceptors.request.use((config) => {
  const token = getAccessToken()
  const configuredBaseUrl = config.baseURL ?? ''
  const requestUrl = typeof config.url === 'string' ? config.url : ''
  const targetUrl = requestUrl.startsWith('http') ? requestUrl : `${configuredBaseUrl}${requestUrl}`
  if (/\.ngrok-free\./i.test(targetUrl)) {
    config.headers['ngrok-skip-browser-warning'] = 'true'
  }
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

adminClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status as number | undefined
    if (status === 401) {
      clearSession()
      redirectToLogin()
    }
    if (error instanceof AxiosError) {
      const serverMessage = (error.response?.data as ErrorResponse | undefined)?.message
      if (serverMessage && serverMessage.length > 0) {
        error.message = serverMessage
      }
    }
    return Promise.reject(error)
  },
)
