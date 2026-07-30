import client from './client.js'

export async function getTreatmentOptions() {
  const { data } = await client.get('/treatments')
  return data
}

export async function createTreatmentOption(payload) {
  const { data } = await client.post('/treatments', payload)
  return data
}

export async function updateTreatmentOption(id, payload) {
  const { data } = await client.put(`/treatments/${id}`, payload)
  return data
}

export async function deleteTreatmentOption(id) {
  await client.delete(`/treatments/${id}`)
}
