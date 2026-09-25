import { useEffect, useMemo, useState } from 'react'
import { Wallet, Hourglass, CreditCard, Smartphone, Banknote, CheckCircle2 } from 'lucide-react'
import Card from '../components/common/Card.jsx'
import PageHeader from '../components/common/PageHeader.jsx'
import SearchInput from '../components/common/SearchInput.jsx'
import Table from '../components/common/Table.jsx'
import StatCard from '../components/common/StatCard.jsx'
import Pagination from '../components/common/Pagination.jsx'
import { Select } from '../components/common/FormField.jsx'
import DateRangeFilter, { useDateRange } from '../components/auditor/DateRangeFilter.jsx'
import ExportBar from '../components/auditor/ExportBar.jsx'
import PrintHeader from '../components/auditor/PrintHeader.jsx'
import { getInvoices } from '../api/invoices.js'

const PAGE_SIZE = 10
const money = (n) => `₹${(Number(n) || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`

const methodIcon = { UPI: Smartphone, Card: CreditCard, Cash: Banknote }

const EXPORT_COLUMNS = [
  { header: 'Date', key: 'date' },
  { header: 'Invoice #', key: 'invoiceId' },
  { header: 'Patient Name', key: 'patientName' },
  { header: 'Patient ID', key: 'patientId' },
  { header: 'Amount', key: 'amount' },
  { header: 'Method', key: 'method' },
  { header: 'Note', key: 'note' },
]

export default function AuditorPaymentReport() {
  const dateRange = useDateRange('month')
  const { from, to } = dateRange

  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [methodFilter, setMethodFilter] = useState('All')
  const [sortBy, setSortBy] = useState('date-desc')
  const [page, setPage] = useState(1)

  useEffect(() => {
    setLoading(true)
    setError('')
    getInvoices()
      .then(setInvoices)
      .catch(() => setError('Could not load payment data. Please try again.'))
      .finally(() => setLoading(false))
  }, [])

  // Flatten every installment payment across every invoice into its own row — the
  // transaction-level ledger an auditor needs, rather than just invoice-level totals.
  const allPayments = useMemo(
    () =>
      invoices.flatMap((inv) =>
        (inv.payments || []).map((p) => ({
          ...p,
          invoiceId: inv.id,
          patientName: inv.patientName,
          patientId: inv.patientId,
        }))
      ),
    [invoices]
  )

  const filteredPayments = useMemo(() => {
    return allPayments
      .filter((p) => (!from || p.date >= from) && (!to || p.date <= to))
      .filter((p) => {
        const q = query.trim().toLowerCase()
        if (!q) return true
        return (
          p.invoiceId.toLowerCase().includes(q) ||
          p.patientName.toLowerCase().includes(q) ||
          p.patientId.toLowerCase().includes(q)
        )
      })
      .filter((p) => methodFilter === 'All' || p.method === methodFilter)
  }, [allPayments, from, to, query, methodFilter])

  const sortedPayments = useMemo(() => {
    const list = [...filteredPayments]
    switch (sortBy) {
      case 'date-asc': return list.sort((a, b) => a.date.localeCompare(b.date))
      case 'amount-desc': return list.sort((a, b) => b.amount - a.amount)
      case 'amount-asc': return list.sort((a, b) => a.amount - b.amount)
      default: return list.sort((a, b) => b.date.localeCompare(a.date)) // date-desc
    }
  }, [filteredPayments, sortBy])

  const totalCollected = filteredPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
  const methodTotals = useMemo(() => {
    const totals = { UPI: 0, Card: 0, Cash: 0 }
    filteredPayments.forEach((p) => {
      if (totals[p.method] !== undefined) totals[p.method] += Number(p.amount) || 0
    })
    return totals
  }, [filteredPayments])

  // Invoice-status breakdown (Paid/Partially Paid/Pending) and outstanding balance are
  // whole-invoice snapshots, not filtered to the payment date range — an invoice's current
  // status doesn't have a "period," unlike an individual payment transaction.
  const invoiceStatusCounts = useMemo(() => {
    const counts = { 'Fully Paid': 0, 'Partially Paid': 0, Pending: 0 }
    invoices.forEach((inv) => {
      if (counts[inv.status] !== undefined) counts[inv.status] += 1
    })
    return counts
  }, [invoices])
  const totalOutstanding = invoices.reduce((sum, inv) => sum + (Number(inv.balance) || 0), 0)

  useEffect(() => setPage(1), [query, methodFilter, from, to])

  const totalPages = Math.max(1, Math.ceil(sortedPayments.length / PAGE_SIZE))
  const pageItems = sortedPayments.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const dateRangeLabel = from || to ? `${from || 'earliest'} to ${to || 'latest'}` : 'All Time'
  const filtersLabel = [
    methodFilter !== 'All' ? `Method: ${methodFilter}` : null,
    query.trim() ? `Search: "${query.trim()}"` : null,
  ].filter(Boolean).join(', ') || null
  const exportTotals = [
    ['Total Collected', money(totalCollected)],
    ['Total Outstanding', money(totalOutstanding)],
    ['Fully Paid Invoices', invoiceStatusCounts['Fully Paid']],
    ['Partially Paid Invoices', invoiceStatusCounts['Partially Paid']],
    ['Pending Invoices', invoiceStatusCounts['Pending']],
    ...Object.entries(methodTotals).map(([m, amt]) => [`${m} Collected`, money(amt)]),
  ]

  return (
    <div>
      <PageHeader title="Payment & Collection Report" subtitle="Every recorded payment, plus collection totals by method and invoice status." />
      <PrintHeader title="Payment & Collection Report" dateRangeLabel={dateRangeLabel} filtersLabel={filtersLabel} />

      <Card className="mb-6 print:hidden">
        <DateRangeFilter {...dateRange} />
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <StatCard label="Total Collected" value={money(totalCollected)} icon={Wallet} />
        <StatCard label="Outstanding" value={money(totalOutstanding)} icon={Hourglass} />
        <StatCard label="Fully Paid" value={invoiceStatusCounts['Fully Paid'].toLocaleString('en-IN')} icon={CheckCircle2} />
        <StatCard label="Partially Paid" value={invoiceStatusCounts['Partially Paid'].toLocaleString('en-IN')} icon={CheckCircle2} />
        <StatCard label="Pending" value={invoiceStatusCounts['Pending'].toLocaleString('en-IN')} icon={CheckCircle2} />
      </div>

      <Card className="mb-6">
        <h3 className="font-bold text-gray-800 mb-4">Collection by Payment Method</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Object.entries(methodTotals).map(([method, amount]) => {
            const Icon = methodIcon[method]
            return (
              <div key={method} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-xs text-gray-400">{method}</p>
                  <p className="font-bold text-gray-800">{money(amount)}</p>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      <Card>
        <div className="flex flex-col lg:flex-row gap-3 mb-4 print:hidden">
          <SearchInput value={query} onChange={setQuery} placeholder="Search by invoice #, patient name, or patient ID..." className="flex-1" />
          <div className="flex flex-wrap gap-2">
            <Select value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)} className="w-40">
              <option value="All">All Methods</option>
              <option>UPI</option>
              <option>Card</option>
              <option>Cash</option>
            </Select>
            <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-48">
              <option value="date-desc">Date (Newest)</option>
              <option value="date-asc">Date (Oldest)</option>
              <option value="amount-desc">Amount (High to Low)</option>
              <option value="amount-asc">Amount (Low to High)</option>
            </Select>
          </div>
        </div>

        <div className="mb-4">
          <ExportBar
            title="Payment & Collection Report"
            filenameBase="payment-collection-report"
            columns={EXPORT_COLUMNS}
            rows={sortedPayments}
            dateRangeLabel={dateRangeLabel}
            filtersLabel={filtersLabel}
            totals={exportTotals}
          />
        </div>

        {error && (
          <div className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2 mb-4">{error}</div>
        )}

        <Table columns={['Date', 'Invoice #', 'Patient', 'Amount', 'Method', 'Note']}>
          {loading && (
            <tr><td colSpan={6} className="py-10 text-center text-sm text-gray-400">Loading payments…</td></tr>
          )}
          {!loading && pageItems.length === 0 && (
            <tr><td colSpan={6} className="py-10 text-center text-sm text-gray-400">No payments match the current filters.</td></tr>
          )}
          {pageItems.map((p) => (
            <tr key={`${p.invoiceId}-${p.id}`} className="hover:bg-primary-50/40 transition">
              <td className="py-3 px-3 pl-0 text-gray-600">{p.date}</td>
              <td className="py-3 px-3 font-semibold text-gray-800">{p.invoiceId}</td>
              <td className="py-3 px-3">
                <p className="font-medium text-gray-800">{p.patientName}</p>
                <p className="text-xs text-gray-400">{p.patientId}</p>
              </td>
              <td className="py-3 px-3 font-medium text-emerald-700">{money(p.amount)}</td>
              <td className="py-3 px-3 text-gray-600">{p.method}</td>
              <td className="py-3 px-3 text-gray-400 text-xs">{p.note || '—'}</td>
            </tr>
          ))}
        </Table>

        <div className="print:hidden">
          <Pagination page={page} totalPages={totalPages} onChange={setPage} totalItems={sortedPayments.length} pageSize={PAGE_SIZE} />
        </div>
      </Card>
    </div>
  )
}
