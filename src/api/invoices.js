import client from './client.js'

export async function getInvoices() {
  const { data } = await client.get('/invoices')
  return data
}

export async function getInvoice(id) {
  const { data } = await client.get(`/invoices/${id}`)
  return data
}

export async function getInvoicesByPatient(patientId) {
  const { data } = await client.get(`/invoices/patient/${patientId}`)
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

export async function addPayment(invoiceId, payload) {
  const { data } = await client.post(`/invoices/${invoiceId}/payments`, payload)
  return data
}

export async function updatePayment(invoiceId, paymentId, payload) {
  const { data } = await client.put(`/invoices/${invoiceId}/payments/${paymentId}`, payload)
  return data
}

export async function deletePayment(invoiceId, paymentId) {
  const { data } = await client.delete(`/invoices/${invoiceId}/payments/${paymentId}`)
  return data
}

export async function deleteInvoice(id) {
  await client.delete(`/invoices/${id}`)
}
