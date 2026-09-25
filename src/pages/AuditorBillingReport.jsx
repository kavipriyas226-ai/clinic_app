import { useEffect, useMemo, useState } from 'react'
import { FileText, IndianRupee, Wallet, Hourglass, ReceiptText, Eye } from 'lucide-react'
import Card from '../components/common/Card.jsx'
import PageHeader from '../components/common/PageHeader.jsx'
import SearchInput from '../components/common/SearchInput.jsx'
import Table from '../components/common/Table.jsx'
import Badge from '../components/common/Badge.jsx'
import StatCard from '../components/common/StatCard.jsx'
import Modal from '../components/common/Modal.jsx'
import { FormField, Select } from '../components/common/FormField.jsx'
import Pagination from '../components/common/Pagination.jsx'
import DateRangeFilter, { useDateRange } from '../components/auditor/DateRangeFilter.jsx'
import { getInvoices } from '../api/invoices.js'
import { splitGst } from '../utils/gst.js'

const PAGE_SIZE = 10
const money = (n) => `₹${(Number(n) || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`

export default function AuditorBillingReport() {
  const dateRange = useDateRange('month')
  const { from, to } = dateRange

  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [gstFilter, setGstFilter] = useState('All')
  const [sortBy, setSortBy] = useState('date-desc')
  const [page, setPage] = useState(1)
  const [viewTarget, setViewTarget] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError('')
    getInvoices()
      .then(setInvoices)
      .catch(() => setError('Could not load billing data. Please try again.'))
      .finally(() => setLoading(false))
  }, [])

  const enriched = useMemo(
    () =>
      invoices.map((inv) => {
        const { cgst, sgst } = splitGst(inv.gstAmount)
        const taxable = (Number(inv.subtotal) || 0) - (Number(inv.discountAmount) || 0)
        return { ...inv, cgst, sgst, taxable }
      }),
    [invoices]
  )

  const filtered = useMemo(() => {
    return enriched
      .filter((inv) => (!from || inv.date >= from) && (!to || inv.date <= to))
      .filter((inv) => {
        const q = query.trim().toLowerCase()
        if (!q) return true
        return (
          inv.id.toLowerCase().includes(q) ||
          inv.patientName.toLowerCase().includes(q) ||
          inv.patientId.toLowerCase().includes(q)
        )
      })
      .filter((inv) => statusFilter === 'All' || inv.status === statusFilter)
      .filter((inv) => {
        if (gstFilter === 'All') return true
        return gstFilter === 'Enabled' ? inv.gstEnabled : !inv.gstEnabled
      })
  }, [enriched, from, to, query, statusFilter, gstFilter])

  const sorted = useMemo(() => {
    const list = [...filtered]
    switch (sortBy) {
      case 'date-asc': return list.sort((a, b) => a.date.localeCompare(b.date))
      case 'amount-desc': return list.sort((a, b) => b.total - a.total)
      case 'amount-asc': return list.sort((a, b) => a.total - b.total)
      case 'patient': return list.sort((a, b) => a.patientName.localeCompare(b.patientName))
      default: return list.sort((a, b) => b.date.localeCompare(a.date)) // date-desc
    }
  }, [filtered, sortBy])

  const totals = useMemo(
    () =>
      filtered.reduce(
        (acc, inv) => ({
          billed: acc.billed + (Number(inv.total) || 0),
          collected: acc.collected + (Number(inv.amountPaid) || 0),
          pending: acc.pending + (Number(inv.balance) || 0),
          cgst: acc.cgst + inv.cgst,
          sgst: acc.sgst + inv.sgst,
        }),
        { billed: 0, collected: 0, pending: 0, cgst: 0, sgst: 0 }
      ),
    [filtered]
  )

  useEffect(() => setPage(1), [query, statusFilter, gstFilter, from, to])

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const pageItems = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div>
      <PageHeader title="Billing & Invoice Report" subtitle="Every invoice, with GST shown as separate CGST and SGST — never a blended figure." />

      <Card className="mb-6">
        <DateRangeFilter {...dateRange} />
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <StatCard label="Invoices" value={filtered.length.toLocaleString('en-IN')} icon={FileText} />
        <StatCard label="Total Billed" value={money(totals.billed)} icon={IndianRupee} />
        <StatCard label="Total Collected" value={money(totals.collected)} icon={Wallet} />
        <StatCard label="Total Pending" value={money(totals.pending)} icon={Hourglass} />
        <StatCard label="Total CGST" value={money(totals.cgst)} icon={ReceiptText} />
        <StatCard label="Total SGST" value={money(totals.sgst)} icon={ReceiptText} />
      </div>

      <Card>
        <div className="flex flex-col lg:flex-row gap-3 mb-4">
          <SearchInput value={query} onChange={setQuery} placeholder="Search by invoice #, patient name, or patient ID..." className="flex-1" />
          <div className="flex flex-wrap gap-2">
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-40">
              <option value="All">All Statuses</option>
              <option>Pending</option>
              <option>Partially Paid</option>
              <option>Fully Paid</option>
            </Select>
            <Select value={gstFilter} onChange={(e) => setGstFilter(e.target.value)} className="w-40">
              <option value="All">GST: All</option>
              <option value="Enabled">GST Enabled</option>
              <option value="Disabled">GST Disabled</option>
            </Select>
            <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-48">
              <option value="date-desc">Date (Newest)</option>
              <option value="date-asc">Date (Oldest)</option>
              <option value="amount-desc">Amount (High to Low)</option>
              <option value="amount-asc">Amount (Low to High)</option>
              <option value="patient">Patient (A–Z)</option>
            </Select>
          </div>
        </div>

        {error && (
          <div className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2 mb-4">{error}</div>
        )}

        <Table columns={['Invoice #', 'Date', 'Patient', 'Final Amount', 'CGST', 'SGST', 'Paid', 'Balance', 'Status', 'Actions']}>
          {loading && (
            <tr><td colSpan={10} className="py-10 text-center text-sm text-gray-400">Loading invoices…</td></tr>
          )}
          {!loading && pageItems.length === 0 && (
            <tr><td colSpan={10} className="py-10 text-center text-sm text-gray-400">No invoices match the current filters.</td></tr>
          )}
          {pageItems.map((inv) => (
            <tr key={inv.id} className="hover:bg-primary-50/40 transition">
              <td className="py-3 px-3 pl-0 font-semibold text-gray-800">{inv.id}</td>
              <td className="py-3 px-3 text-gray-600">{inv.date}</td>
              <td className="py-3 px-3">
                <p className="font-medium text-gray-800">{inv.patientName}</p>
                <p className="text-xs text-gray-400">{inv.patientId}</p>
              </td>
              <td className="py-3 px-3 font-medium text-gray-700">{money(inv.total)}</td>
              <td className="py-3 px-3 text-gray-600">{inv.gstEnabled ? money(inv.cgst) : '—'}</td>
              <td className="py-3 px-3 text-gray-600">{inv.gstEnabled ? money(inv.sgst) : '—'}</td>
              <td className="py-3 px-3 text-emerald-700">{money(inv.amountPaid)}</td>
              <td className="py-3 px-3 text-rose-600 font-medium">{money(inv.balance)}</td>
              <td className="py-3 px-3"><Badge>{inv.status}</Badge></td>
              <td className="py-3 px-3">
                <button
                  onClick={() => setViewTarget(inv)}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-primary-100 hover:text-primary-600 transition"
                  title="View Details"
                >
                  <Eye size={15} />
                </button>
              </td>
            </tr>
          ))}
        </Table>

        <Pagination page={page} totalPages={totalPages} onChange={setPage} totalItems={sorted.length} pageSize={PAGE_SIZE} />
      </Card>

      <Modal open={!!viewTarget} onClose={() => setViewTarget(null)} title={viewTarget ? `Invoice ${viewTarget.id}` : ''}>
        {viewTarget && (
          <div className="space-y-3 text-sm">
            <DetailRow label="Patient" value={`${viewTarget.patientName} (${viewTarget.patientId})`} />
            <DetailRow label="Date" value={viewTarget.date} />

            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-1.5">Treatment / Service Details</p>
              {viewTarget.lineItems?.map((item, idx) => (
                <div key={idx} className="flex justify-between py-1 text-gray-600">
                  <span className="truncate pr-2">{item.name} × {item.qty} @ {money(item.price)}</span>
                  <span className="shrink-0">{money(item.amount)}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-gray-100 space-y-1">
              <DetailRow label="Subtotal" value={money(viewTarget.subtotal)} />
              <DetailRow label="Discount" value={money(viewTarget.discountAmount)} />
              <DetailRow label="Taxable Amount" value={money(viewTarget.taxable)} />
              {viewTarget.gstEnabled ? (
                <>
                  <DetailRow label="CGST @ 9%" value={money(viewTarget.cgst)} />
                  <DetailRow label="SGST @ 9%" value={money(viewTarget.sgst)} />
                </>
              ) : (
                <DetailRow label="GST" value="Not applied" />
              )}
              <DetailRow label="Total GST" value={money(viewTarget.gstAmount)} />
              <DetailRow label="Final Invoice Amount" value={<span className="font-bold text-gray-800">{money(viewTarget.total)}</span>} />
            </div>

            <div className="pt-2 border-t border-gray-100 space-y-1">
              <DetailRow label="Amount Paid" value={money(viewTarget.amountPaid)} />
              <DetailRow label="Remaining Balance" value={money(viewTarget.balance)} />
              <DetailRow label="Payment Status" value={<Badge>{viewTarget.status}</Badge>} />
              <DetailRow label="Payment Method" value={viewTarget.method} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1 text-gray-600">
      <span>{label}</span>
      <span className="font-medium text-gray-800 text-right">{value}</span>
    </div>
  )
}
