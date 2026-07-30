import client from './client.js'

export async function getPrescriptionsByPatient(patientId) {
  const { data } = await client.get('/prescriptions', { params: { patientId } })
  return data
}

export async function createPrescription(payload) {
  const { data } = await client.post('/prescriptions', payload)
  return data
}
