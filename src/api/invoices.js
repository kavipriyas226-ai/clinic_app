import client from './client.js'

export async function getInvoices() {
  const { data } = await client.get('/invoices')
  return data
}

export async function createInvoice(payload) {
  const { data } = await client.post('/invoices', payload)
  return data
}

export async function getPaymentsSummary(period) {
  const { data } = await client.get('/invoices/summary', { params: { period } })
  return data
}
