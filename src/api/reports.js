import client from './client.js'

export async function getRevenueReport() {
  const { data } = await client.get('/reports/revenue')
  return data
}

export async function getPatientGrowthReport() {
  const { data } = await client.get('/reports/patient-growth')
  return data
}

export async function getMedicineSalesReport() {
  const { data } = await client.get('/reports/medicine-sales')
  return data
}
