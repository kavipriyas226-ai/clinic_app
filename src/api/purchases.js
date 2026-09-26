import client from './client.js'

export async function getPurchases() {
  const { data } = await client.get('/purchases')
  return data
}

export async function getPurchase(id) {
  const { data } = await client.get(`/purchases/${id}`)
  return data
}

export async function createPurchase(payload) {
  const { data } = await client.post('/purchases', payload)
  return data
}

export async function deletePurchase(id) {
  await client.delete(`/purchases/${id}`)
}
