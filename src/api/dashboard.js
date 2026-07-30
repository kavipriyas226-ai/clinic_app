import client from './client.js'

export async function getDashboardStats() {
  const { data } = await client.get('/dashboard/stats')
  return data
}
