import client, { setToken, setRole, clearToken } from './client.js'

export async function login(username, password, loginType) {
  const { data } = await client.post('/auth/login', { username, password, loginType })
  setToken(data.token)
  setRole(data.role)
  return data
}

export function logout() {
  clearToken()
}
