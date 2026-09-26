import { useEffect, useMemo, useState } from 'react'
import { ShoppingCart, IndianRupee, ReceiptText, Package, Eye } from 'lucide-react'
import Card from '../components/common/Card.jsx'
import PageHeader from '../components/common/PageHeader.jsx'
import SearchInput from '../components/common/SearchInput.jsx'
import Table from '../components/common/Table.jsx'
import StatCard from '../components/common/StatCard.jsx'
import Modal from '../components/common/Modal.jsx'
import { Select } from '../components/common/FormField.jsx'
import Pagination from '../components/common/Pagination.jsx'
import DateRangeFilter, { useDateRange } from '../components/auditor/DateRangeFilter.jsx'
import ExportBar from '../components/auditor/ExportBar.jsx'
import PrintHeader from '../components/auditor/PrintHeader.jsx'
import { getPurchases } from '../api/purchases.js'

const PAGE_SIZE = 10
const money = (n) => `₹${(Number(n) || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`

const EXPORT_COLUMNS = [
  { header: 'Purchase #', key: 'id' },
  { header: 'Date', key: 'date' },
  { header: 'Supplier', key: 'supplierName' },
  { header: 'Supplier GSTIN', key: 'gstin' },
  { header: 'Items', key: 'itemCount' },
  { header: 'Taxable Amount', key: 'subtotal' },
  { header: 'GST Amount', key: 'gstAmount' },
  { header: 'Total Amount', key: 'total' },
]

export default function AuditorPurchaseReport() {
  const dateRange = useDateRange('month')
  const { from, to } = dateRange

  const [purchases, setPurchases] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState('date-desc')
  const [page, setPage] = useState(1)
  const [viewTarget, setViewTarget] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError('')
    getPurchases()
      .then(setPurchases)
      .catch(() => setError('Could not load purchase data. Please try again.'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    return purchases
      .filter((p) => (!from || p.date >= from) && (!to || p.date <= to))
      .filter((p) => {
        const q = query.trim().toLowerCase()
        if (!q) return true
        return (
          p.id.toLowerCase().includes(q) ||
          p.supplierName.toLowerCase().includes(q) ||
          (p.gstin || '').toLowerCase().includes(q)
        )
      })
  }, [purchases, from, to, query])

  const sorted = useMemo(() => {
    const list = [...filtered]
    switch (sortBy) {
      case 'date-asc': return list.sort((a, b) => a.date.localeCompare(b.date))
      case 'amount-desc': return list.sort((a, b) => b.total - a.total)
      case 'amount-asc': return list.sort((a, b) => a.total - b.total)
      case 'supplier': return list.sort((a, b) => a.supplierName.localeCompare(b.supplierName))
      default: return list.sort((a, b) => b.date.localeCompare(a.date)) // date-desc
    }
  }, [filtered, sortBy])

  const totals = useMemo(
    () =>
      filtered.reduce(
        (acc, p) => ({
          taxable: acc.taxable + (Number(p.subtotal) || 0),
          gst: acc.gst + (Number(p.gstAmount) || 0),
          total: acc.total + (Number(p.total) || 0),
        }),
        { taxable: 0, gst: 0, total: 0 }
      ),
    [filtered]
  )

  useEffect(() => setPage(1), [query, from, to])

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const pageItems = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const dateRangeLabel = from || to ? `${from || 'earliest'} to ${to || 'latest'}` : 'All Time'
  const filtersLabel = query.trim() ? `Search: "${query.trim()}"` : null
  const exportRows = useMemo(() => sorted.map((p) => ({ ...p, itemCount: p.lineItems?.length || 0 })), [sorted])
  const exportTotals = [
    ['Purchases', filtered.length.toLocaleString('en-IN')],
    ['Total Taxable Amount', money(totals.taxable)],
    ['Total GST Amount', money(totals.gst)],
    ['Total Amount', money(totals.total)],
  ]

  return (
    <div>
      <PageHeader title="Purchase Report" subtitle="Every recorded supplier purchase, with taxable amount and GST shown per item." />
      <PrintHeader title="Purchase Report" dateRangeLabel={dateRangeLabel} filtersLabel={filtersLabel} />

      <Card className="mb-6 print:hidden">
        <DateRangeFilter {...dateRange} />
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard label="Purchases" value={filtered.length.toLocaleString('en-IN')} icon={ShoppingCart} />
        <StatCard label="Taxable Amount" value={money(totals.taxable)} icon={Package} />
        <StatCard label="GST Amount" value={money(totals.gst)} icon={ReceiptText} />
        <StatCard label="Total Amount" value={money(totals.total)} icon={IndianRupee} />
      </div>

      <Card>
        <div className="flex flex-col lg:flex-row gap-3 mb-4 print:hidden">
          <SearchInput value={query} onChange={setQuery} placeholder="Search by purchase #, supplier, or GSTIN..." className="flex-1" />
          <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-48">
            <option value="date-desc">Date (Newest)</option>
            <option value="date-asc">Date (Oldest)</option>
            <option value="amount-desc">Amount (High to Low)</option>
            <option value="amount-asc">Amount (Low to High)</option>
            <option value="supplier">Supplier (A–Z)</option>
          </Select>
        </div>

        <div className="mb-4">
          <ExportBar
            title="Purchase Report"
            filenameBase="purchase-report"
            columns={EXPORT_COLUMNS}
            rows={exportRows}
            dateRangeLabel={dateRangeLabel}
            filtersLabel={filtersLabel}
            totals={exportTotals}
          />
        </div>

        {error && (
          <div className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2 mb-4">{error}</div>
        )}

        <Table columns={['Purchase #', 'Date', 'Supplier', 'Taxable', 'GST', 'Total', 'Actions']}>
          {loading && (
            <tr><td colSpan={7} className="py-10 text-center text-sm text-gray-400">Loading purchases…</td></tr>
          )}
          {!loading && pageItems.length === 0 && (
            <tr><td colSpan={7} className="py-10 text-center text-sm text-gray-400">No purchases match the current filters.</td></tr>
          )}
          {pageItems.map((p) => (
            <tr key={p.id} className="hover:bg-primary-50/40 transition">
              <td className="py-3 px-3 pl-0 font-semibold text-gray-800">{p.id}</td>
              <td className="py-3 px-3 text-gray-600">{p.date}</td>
              <td className="py-3 px-3">
                <p className="font-medium text-gray-800">{p.supplierName}</p>
                {p.gstin && <p className="text-xs text-gray-400">GSTIN: {p.gstin}</p>}
              </td>
              <td className="py-3 px-3 text-gray-600">{money(p.subtotal)}</td>
              <td className="py-3 px-3 text-gray-600">{money(p.gstAmount)}</td>
              <td className="py-3 px-3 font-medium text-gray-700">{money(p.total)}</td>
              <td className="py-3 px-3 print:hidden">
                <button
                  onClick={() => setViewTarget(p)}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-primary-100 hover:text-primary-600 transition"
                  title="View Details"
                >
                  <Eye size={15} />
                </button>
              </td>
            </tr>
          ))}
        </Table>

        <div className="print:hidden">
          <Pagination page={page} totalPages={totalPages} onChange={setPage} totalItems={sorted.length} pageSize={PAGE_SIZE} />
        </div>
      </Card>

      <Modal open={!!viewTarget} onClose={() => setViewTarget(null)} title={viewTarget ? `Purchase ${viewTarget.id}` : ''}>
        {viewTarget && (
          <div className="space-y-3 text-sm">
            <DetailRow label="Supplier" value={viewTarget.supplierName} />
            <DetailRow label="Address" value={viewTarget.address || '—'} />
            <DetailRow label="GSTIN" value={viewTarget.gstin || '—'} />
            <DetailRow label="Date" value={viewTarget.date} />

            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-1.5">Products</p>
              {viewTarget.lineItems?.map((item, idx) => (
                <div key={idx} className="py-1.5 border-b border-gray-50 last:border-0">
                  <div className="flex justify-between text-gray-700">
                    <span className="truncate pr-2">{item.name} × {item.qty} @ {money(item.rate)}</span>
                    <span className="shrink-0 font-medium">{money(item.totalAmount)}</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    HSN/SAC: {item.hsnSacCode || '—'} · GST {item.gstPercent}% ({money(item.gstAmount)}) · Taxable {money(item.taxableAmount)}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-gray-100 space-y-1">
              <DetailRow label="Taxable Amount" value={money(viewTarget.subtotal)} />
              <DetailRow label="GST Amount" value={money(viewTarget.gstAmount)} />
              <DetailRow label="Total Amount" value={<span className="font-bold text-gray-800">{money(viewTarget.total)}</span>} />
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
