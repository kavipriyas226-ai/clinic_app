import axios from 'axios'

const TOKEN_STORAGE_KEY = 'devs-clinic-token'
const ROLE_STORAGE_KEY = 'devs-clinic-role'

export function getToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function setToken(token) {
  localStorage.setItem(TOKEN_STORAGE_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
  localStorage.removeItem(ROLE_STORAGE_KEY)
}

export function getRole() {
  return localStorage.getItem(ROLE_STORAGE_KEY)
}

export function setRole(role) {
  localStorage.setItem(ROLE_STORAGE_KEY, role)
}

export function isAdmin() {
  return getRole() === 'ADMIN'
}

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
})

client.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearToken()
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default client
