import client from './client.js'

export async function getAuditorDashboard({ from, to } = {}) {
  const { data } = await client.get('/auditor/dashboard', { params: { from, to } })
  return data
}
