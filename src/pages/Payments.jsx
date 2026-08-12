import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CreditCard, Banknote, Smartphone, Filter, History, Eye, PlusCircle, Trash2, AlertCircle } from 'lucide-react'
import Card from '../components/common/Card.jsx'
import PageHeader from '../components/common/PageHeader.jsx'
import SearchInput from '../components/common/SearchInput.jsx'
import Table from '../components/common/Table.jsx'
import Badge from '../components/common/Badge.jsx'
import Button from '../components/common/Button.jsx'
import Modal from '../components/common/Modal.jsx'
import { FormField, Select, TextInput } from '../components/common/FormField.jsx'
import StatCard from '../components/common/StatCard.jsx'
import { getInvoices, getPaymentsSummary, addPayment, deleteInvoice } from '../api/invoices.js'

const methodIcon = {
  UPI: Smartphone,
  Card: CreditCard,
  Cash: Banknote,
  '—': Banknote,
}

const today = () => new Date().toISOString().slice(0, 10)

export default function Payments() {
  const navigate = useNavigate()
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [collectedPeriod, setCollectedPeriod] = useState('total')
  const [totals, setTotals] = useState({ paid: 0, unpaid: 0 })
  const [viewTarget, setViewTarget] = useState(null)
  const [installmentTarget, setInstallmentTarget] = useState(null)
  const [installmentForm, setInstallmentForm] = useState({ amount: 0, method: 'UPI', date: today(), note: '' })
  const [installmentError, setInstallmentError] = useState('')
  const [savingInstallment, setSavingInstallment] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  function reload() {
    setLoading(true)
    return getInvoices()
      .then(setInvoices)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    reload()
  }, [])

  useEffect(() => {
    getPaymentsSummary(collectedPeriod).then((summary) =>
      setTotals({ paid: summary.totalCollected, unpaid: summary.totalUnpaid })
    )
  }, [collectedPeriod, invoices])

  const filtered = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesQuery =
        inv.patientName.toLowerCase().includes(query.toLowerCase()) ||
        inv.id.toLowerCase().includes(query.toLowerCase())
      const matchesStatus = statusFilter === 'All' || inv.status === statusFilter
      return matchesQuery && matchesStatus
    })
  }, [invoices, query, statusFilter])

  function openInstallment(inv) {
    setInstallmentError('')
    setInstallmentForm({ amount: inv.balance, method: 'UPI', date: today(), note: '' })
    setInstallmentTarget(inv)
  }

  async function handleInstallmentSubmit(e) {
    e.preventDefault()
    setInstallmentError('')
    if (!installmentForm.amount || installmentForm.amount <= 0) {
      setInstallmentError('Enter an amount greater than 0.')
      return
    }
    if (installmentForm.amount > installmentTarget.balance) {
      setInstallmentError(`Amount cannot exceed the remaining balance of ₹${installmentTarget.balance.toLocaleString('en-IN')}.`)
      return
    }
    setSavingInstallment(true)
    try {
      const updated = await addPayment(installmentTarget.id, installmentForm)
      setInvoices((prev) => prev.map((inv) => (inv.id === updated.id ? updated : inv)))
      setInstallmentTarget(null)
    } catch (err) {
      setInstallmentError(err.response?.data?.message || 'Could not record the payment. Please try again.')
    } finally {
      setSavingInstallment(false)
    }
  }

  async function confirmDelete() {
    await deleteInvoice(deleteTarget.id)
    setInvoices((prev) => prev.filter((inv) => inv.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  return (
    <div>
      <PageHeader title="Payments" subtitle="Track patient-wise payments and installment plans" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Card className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm text-gray-500 font-medium truncate">Total Collected</p>
              <Select
                value={collectedPeriod}
                onChange={(e) => setCollectedPeriod(e.target.value)}
                className="!w-auto !py-1 !px-2 text-xs"
              >
                <option value="today">Today</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
                <option value="total">Total</option>
              </Select>
            </div>
            <p className="text-2xl font-bold text-gray-800 mt-1 truncate">₹{totals.paid.toLocaleString('en-IN')}</p>
          </div>
          <div className="shrink-0 w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
            <Banknote size={22} />
          </div>
        </Card>
        <StatCard label="Total Outstanding Balance" value={`₹${totals.unpaid.toLocaleString('en-IN')}`} icon={CreditCard} />
      </div>

      <Card>
        <div className="flex items-center gap-2 mb-1">
          <History size={18} className="text-primary-500" />
          <h3 className="font-bold text-gray-800">Payment History</h3>
        </div>
        <p className="text-xs text-gray-400 mb-4">Click a patient to view their full treatment & payment history</p>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <SearchInput value={query} onChange={setQuery} placeholder="Search by patient or invoice ID..." className="flex-1" />
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400 shrink-0" />
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-44">
              <option>All</option>
              <option>Pending</option>
              <option>Partially Paid</option>
              <option>Fully Paid</option>
            </Select>
          </div>
        </div>

        <Table columns={['Invoice ID', 'Patient', 'Date', 'Total', 'Paid', 'Balance', 'Status', 'Actions']}>
          {loading && (
            <tr>
              <td colSpan={8} className="py-10 text-center text-sm text-gray-400">Loading payments…</td>
            </tr>
          )}
          {!loading && filtered.length === 0 && (
            <tr>
              <td colSpan={8} className="py-10 text-center text-sm text-gray-400">No payments found.</td>
            </tr>
          )}
          {filtered.map((inv) => (
            <tr key={inv.id} className="hover:bg-primary-50/40 transition">
              <td className="py-3 px-3 pl-0 font-semibold text-gray-800">{inv.id}</td>
              <td className="py-3 px-3">
                <button
                  onClick={() => navigate(`/payments/patient/${inv.patientId}`)}
                  className="text-primary-600 font-medium hover:underline text-left"
                >
                  {inv.patientName}
                </button>
              </td>
              <td className="py-3 px-3 text-gray-600">{inv.date}</td>
              <td className="py-3 px-3 font-medium text-gray-700">₹{inv.total.toLocaleString('en-IN')}</td>
              <td className="py-3 px-3 text-emerald-700">₹{inv.amountPaid.toLocaleString('en-IN')}</td>
              <td className="py-3 px-3 text-rose-600 font-medium">₹{inv.balance.toLocaleString('en-IN')}</td>
              <td className="py-3 px-3"><Badge>{inv.status}</Badge></td>
              <td className="py-3 px-3">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setViewTarget(inv)}
                    className="p-1.5 rounded-lg text-gray-400 hover:bg-primary-100 hover:text-primary-600 transition"
                    title="View"
                  >
                    <Eye size={15} />
                  </button>
                  {inv.balance > 0 && (
                    <button
                      onClick={() => openInstallment(inv)}
                      className="p-1.5 rounded-lg text-gray-400 hover:bg-emerald-100 hover:text-emerald-600 transition"
                      title="Record Installment"
                    >
                      <PlusCircle size={15} />
                    </button>
                  )}
                  <button
                    onClick={() => setDeleteTarget(inv)}
                    className="p-1.5 rounded-lg text-gray-400 hover:bg-rose-100 hover:text-rose-600 transition"
                    title="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      </Card>

      <Modal open={!!viewTarget} onClose={() => setViewTarget(null)} title="Payment Details">
        {viewTarget && (
          <div className="space-y-3 text-sm">
            <DetailRow label="Invoice ID" value={viewTarget.id} />
            <DetailRow label="Patient" value={viewTarget.patientName} />
            <DetailRow label="Date" value={viewTarget.date} />
            <DetailRow label="Status" value={<Badge>{viewTarget.status}</Badge>} />
            <div className="pt-2 border-t border-gray-100">
              {viewTarget.lineItems?.map((item, idx) => (
                <div key={idx} className="flex justify-between py-1 text-gray-600">
                  <span className="truncate pr-2">{item.name} x{item.qty}</span>
                  <span className="shrink-0">₹{item.amount.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
            <DetailRow label="Total" value={`₹${viewTarget.total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`} />
            <DetailRow label="Amount Paid" value={`₹${viewTarget.amountPaid.toLocaleString('en-IN')}`} />
            <DetailRow label="Balance" value={`₹${viewTarget.balance.toLocaleString('en-IN')}`} />

            {viewTarget.payments?.length > 0 && (
              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Installment History</p>
                <div className="space-y-2">
                  {viewTarget.payments.map((p, i) => {
                    const Icon = methodIcon[p.method] || Banknote
                    return (
                      <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-primary-50/40">
                        <div>
                          <p className="font-medium text-gray-800">Visit {i + 1} — {p.note || p.method}</p>
                          <p className="text-xs text-gray-400 flex items-center gap-1"><Icon size={12} /> {p.method} · {p.date}</p>
                        </div>
                        <span className="font-semibold text-gray-700">₹{p.amount.toLocaleString('en-IN')}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal open={!!installmentTarget} onClose={() => setInstallmentTarget(null)} title="Record Installment">
        {installmentTarget && (
          <form onSubmit={handleInstallmentSubmit} className="space-y-4">
            <p className="text-xs text-gray-400 -mt-1">
              Remaining balance: <span className="font-semibold text-rose-600">₹{installmentTarget.balance.toLocaleString('en-IN')}</span>
            </p>
            {installmentError && (
              <div className="flex items-center gap-2 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
                <AlertCircle size={15} className="shrink-0" />
                {installmentError}
              </div>
            )}
            <FormField label="Amount Paid" required>
              <TextInput
                type="number"
                min="0"
                step="0.01"
                value={installmentForm.amount}
                onChange={(e) => setInstallmentForm((f) => ({ ...f, amount: Number(e.target.value) || 0 }))}
              />
            </FormField>
            <FormField label="Payment Method" required>
              <Select
                value={installmentForm.method}
                onChange={(e) => setInstallmentForm((f) => ({ ...f, method: e.target.value }))}
              >
                <option>UPI</option>
                <option>Card</option>
                <option>Cash</option>
              </Select>
            </FormField>
            <FormField label="Date" required>
              <TextInput
                type="date"
                value={installmentForm.date}
                onChange={(e) => setInstallmentForm((f) => ({ ...f, date: e.target.value }))}
              />
            </FormField>
            <FormField label="Note" hint="e.g. 2nd Visit">
              <TextInput
                value={installmentForm.note}
                onChange={(e) => setInstallmentForm((f) => ({ ...f, note: e.target.value }))}
              />
            </FormField>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setInstallmentTarget(null)}>Cancel</Button>
              <Button type="submit" disabled={savingInstallment}>{savingInstallment ? 'Saving…' : 'Record Payment'}</Button>
            </div>
          </form>
        )}
      </Modal>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Payment"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" onClick={confirmDelete}>Delete</Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to delete invoice <span className="font-semibold">{deleteTarget?.id}</span>?
          This action cannot be undone.
        </p>
      </Modal>
    </div>
  )
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5 border-b border-gray-50 last:border-0">
      <span className="text-gray-400">{label}</span>
      <span className="font-medium text-gray-800 text-right">{value}</span>
    </div>
  )
}
