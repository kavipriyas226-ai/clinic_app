import client from './client.js'

export async function getPatients() {
  const { data } = await client.get('/patients')
  return data
}

export async function getPatient(id) {
  const { data } = await client.get(`/patients/${id}`)
  return data
}

export async function createPatient(payload) {
  const { data } = await client.post('/patients', payload)
  return data
}

export async function updatePatient(id, payload) {
  const { data } = await client.put(`/patients/${id}`, payload)
  return data
}

export async function deletePatient(id) {
  await client.delete(`/patients/${id}`)
}
