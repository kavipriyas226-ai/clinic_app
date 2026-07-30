import client, { setToken, clearToken } from './client.js'

export async function login(username, password) {
  const { data } = await client.post('/auth/login', { username, password })
  setToken(data.token)
  return data
}

export function logout() {
  clearToken()
}
