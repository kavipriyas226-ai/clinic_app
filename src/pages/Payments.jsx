import { useEffect, useMemo, useState } from 'react'
import { CreditCard, Banknote, Smartphone, Filter, History, Eye, Pencil, Trash2 } from 'lucide-react'
import Card from '../components/common/Card.jsx'
import PageHeader from '../components/common/PageHeader.jsx'
import SearchInput from '../components/common/SearchInput.jsx'
import Table from '../components/common/Table.jsx'
import Badge from '../components/common/Badge.jsx'
import Button from '../components/common/Button.jsx'
import Modal from '../components/common/Modal.jsx'
import { FormField, Select } from '../components/common/FormField.jsx'
import StatCard from '../components/common/StatCard.jsx'
import { getInvoices, getPaymentsSummary, updateInvoice, deleteInvoice } from '../api/invoices.js'

const methodIcon = {
  UPI: Smartphone,
  Card: CreditCard,
  Cash: Banknote,
  '—': Banknote,
}

export default function Payments() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [collectedPeriod, setCollectedPeriod] = useState('total')
  const [totals, setTotals] = useState({ paid: 0, unpaid: 0 })
  const [viewTarget, setViewTarget] = useState(null)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => {
    getInvoices()
      .then(setInvoices)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    getPaymentsSummary(collectedPeriod).then((summary) =>
      setTotals({ paid: summary.totalCollected, unpaid: summary.totalUnpaid })
    )
  }, [collectedPeriod])

  const filtered = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesQuery =
        inv.patientName.toLowerCase().includes(query.toLowerCase()) ||
        inv.id.toLowerCase().includes(query.toLowerCase())
      const matchesStatus = statusFilter === 'All' || inv.status === statusFilter
      return matchesQuery && matchesStatus
    })
  }, [invoices, query, statusFilter])

  async function handleEdit(e) {
    e.preventDefault()
    const form = new FormData(e.target)
    const payload = {
      status: form.get('status'),
      method: form.get('method'),
    }
    const updated = await updateInvoice(editTarget.id, payload)
    setInvoices((prev) => prev.map((inv) => (inv.id === updated.id ? updated : inv)))
    setEditTarget(null)
  }

  async function confirmDelete() {
    await deleteInvoice(deleteTarget.id)
    setInvoices((prev) => prev.filter((inv) => inv.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  return (
    <div>
      <PageHeader title="Payments" subtitle="Track payment history, methods and statuses" />

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
        <StatCard label="Unpaid Payments" value={`₹${totals.unpaid.toLocaleString('en-IN')}`} icon={CreditCard} />
      </div>

      <Card>
        <div className="flex items-center gap-2 mb-1">
          <History size={18} className="text-primary-500" />
          <h3 className="font-bold text-gray-800">Payment History</h3>
        </div>
        <p className="text-xs text-gray-400 mb-4">Every invoice created in Billing is recorded here automatically</p>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <SearchInput value={query} onChange={setQuery} placeholder="Search by patient or invoice ID..." className="flex-1" />
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400 shrink-0" />
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-40">
              <option>All</option>
              <option>Paid</option>
            </Select>
          </div>
        </div>

        <Table columns={['Invoice ID', 'Patient', 'Date', 'Amount', 'Method', 'Status', 'Actions']}>
          {loading && (
            <tr>
              <td colSpan={7} className="py-10 text-center text-sm text-gray-400">Loading payments…</td>
            </tr>
          )}
          {!loading && filtered.length === 0 && (
            <tr>
              <td colSpan={7} className="py-10 text-center text-sm text-gray-400">No payments found.</td>
            </tr>
          )}
          {filtered.map((inv) => {
            const Icon = methodIcon[inv.method]
            return (
              <tr key={inv.id} className="hover:bg-primary-50/40 transition">
                <td className="py-3 px-3 pl-0 font-semibold text-gray-800">{inv.id}</td>
                <td className="py-3 px-3 text-gray-600">{inv.patientName}</td>
                <td className="py-3 px-3 text-gray-600">{inv.date}</td>
                <td className="py-3 px-3 font-medium text-gray-700">₹{inv.total.toLocaleString('en-IN')}</td>
                <td className="py-3 px-3 text-gray-600">
                  <span className="flex items-center gap-1.5">
                    {Icon && <Icon size={14} className="text-gray-400" />} {inv.method}
                  </span>
                </td>
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
                    <button
                      onClick={() => setEditTarget(inv)}
                      className="p-1.5 rounded-lg text-gray-400 hover:bg-primary-100 hover:text-primary-600 transition"
                      title="Edit"
                    >
                      <Pencil size={15} />
                    </button>
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
            )
          })}
        </Table>
      </Card>

      <Modal
        open={!!viewTarget}
        onClose={() => setViewTarget(null)}
        title="Payment Details"
      >
        {viewTarget && (
          <div className="space-y-3 text-sm">
            <DetailRow label="Invoice ID" value={viewTarget.id} />
            <DetailRow label="Patient" value={viewTarget.patientName} />
            <DetailRow label="Date" value={viewTarget.date} />
            <DetailRow label="Method" value={viewTarget.method} />
            <DetailRow label="Status" value={viewTarget.status} />
            <div className="pt-2 border-t border-gray-100">
              {viewTarget.lineItems?.map((item, idx) => (
                <div key={idx} className="flex justify-between py-1 text-gray-600">
                  <span className="truncate pr-2">{item.name} x{item.qty}</span>
                  <span className="shrink-0">₹{item.amount.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
            <DetailRow label="Subtotal" value={`₹${viewTarget.subtotal.toLocaleString('en-IN')}`} />
            {viewTarget.discountEnabled && (
              <DetailRow label="Discount" value={`- ₹${viewTarget.discountAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`} />
            )}
            {viewTarget.gstEnabled && (
              <DetailRow label="GST" value={`+ ₹${viewTarget.gstAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`} />
            )}
            <DetailRow label="Total" value={`₹${viewTarget.total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`} />
          </div>
        )}
      </Modal>

      <Modal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        title="Edit Payment"
      >
        {editTarget && (
          <form onSubmit={handleEdit} className="space-y-4">
            <FormField label="Status" required>
              <Select name="status" required defaultValue={editTarget.status}>
                <option>Paid</option>
                <option>Unpaid</option>
              </Select>
            </FormField>
            <FormField label="Method" required>
              <Select name="method" required defaultValue={editTarget.method}>
                <option>UPI</option>
                <option>Card</option>
                <option>Cash</option>
                <option value="—">—</option>
              </Select>
            </FormField>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setEditTarget(null)}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
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
