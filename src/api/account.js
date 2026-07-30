import client from './client.js'

export async function getAccount() {
  const { data } = await client.get('/account')
  return data
}

export async function updateAccount({ username, currentPassword, newPassword }) {
  const { data } = await client.put('/account', { username, currentPassword, newPassword })
  return data
}
