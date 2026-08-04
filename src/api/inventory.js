import client from './client.js'

export async function getInventory() {
  const { data } = await client.get('/inventory')
  return data
}

export async function createInventoryItem(payload) {
  const { data } = await client.post('/inventory', payload)
  return data
}

export async function updateInventoryItem(id, payload) {
  const { data } = await client.put(`/inventory/${id}`, payload)
  return data
}

export async function deleteInventoryItem(id) {
  await client.delete(`/inventory/${id}`)
}

export async function getInventoryActivities(limit = 20) {
  const { data } = await client.get(`/inventory/activities?limit=${limit}`)
  return data
}
