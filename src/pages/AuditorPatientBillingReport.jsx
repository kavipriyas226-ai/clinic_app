import { useEffect, useMemo, useState } from 'react'
import { ClipboardList, Stethoscope, Users } from 'lucide-react'
import Card from '../components/common/Card.jsx'
import PageHeader from '../components/common/PageHeader.jsx'
import SearchInput from '../components/common/SearchInput.jsx'
import Table from '../components/common/Table.jsx'
import Badge from '../components/common/Badge.jsx'
import StatCard from '../components/common/StatCard.jsx'
import Pagination from '../components/common/Pagination.jsx'
import { Select } from '../components/common/FormField.jsx'
import DateRangeFilter, { useDateRange } from '../components/auditor/DateRangeFilter.jsx'
import { getInvoices } from '../api/invoices.js'
import { splitGst } from '../utils/gst.js'

const PAGE_SIZE = 10
const money = (n) => `₹${(Number(n) || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`

// A patient's treatment/medicine billing is only verifiable at the invoice level for
// discount/GST/payment figures — the existing billing system applies those to the whole
// invoice, not per line item — so each line item row here carries its parent invoice's
// figures rather than a fabricated per-line split.
export default function AuditorPatientBillingReport() {
  const dateRange = useDateRange('month')
  const { from, to } = dateRange

  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [sortBy, setSortBy] = useState('date-desc')
  const [page, setPage] = useState(1)

  useEffect(() => {
    setLoading(true)
    setError('')
    getInvoices()
      .then(setInvoices)
      .catch(() => setError('Could not load billing data. Please try again.'))
      .finally(() => setLoading(false))
  }, [])

  const rows = useMemo(() => {
    return invoices.flatMap((inv) => {
      const { cgst, sgst } = splitGst(inv.gstAmount)
      const taxable = (Number(inv.subtotal) || 0) - (Number(inv.discountAmount) || 0)
      return (inv.lineItems || []).map((item, idx) => ({
        key: `${inv.id}-${idx}`,
        patientId: inv.patientId,
        patientName: inv.patientName,
        invoiceId: inv.id,
        date: inv.date,
        treatmentName: item.name,
        treatmentType: item.type,
        treatmentAmount: item.amount,
        discountAmount: inv.discountAmount,
        taxable,
        cgst: inv.gstEnabled ? cgst : 0,
        sgst: inv.gstEnabled ? sgst : 0,
        gstEnabled: inv.gstEnabled,
        total: inv.total,
        amountPaid: inv.amountPaid,
        balance: inv.balance,
        status: inv.status,
      }))
    })
  }, [invoices])

  const filtered = useMemo(() => {
    return rows
      .filter((r) => (!from || r.date >= from) && (!to || r.date <= to))
      .filter((r) => {
        const q = query.trim().toLowerCase()
        if (!q) return true
        return (
          r.patientName.toLowerCase().includes(q) ||
          r.patientId.toLowerCase().includes(q) ||
          r.invoiceId.toLowerCase().includes(q) ||
          r.treatmentName.toLowerCase().includes(q)
        )
      })
      .filter((r) => typeFilter === 'All' || r.treatmentType === typeFilter)
  }, [rows, from, to, query, typeFilter])

  const sorted = useMemo(() => {
    const list = [...filtered]
    switch (sortBy) {
      case 'date-asc': return list.sort((a, b) => a.date.localeCompare(b.date))
      case 'amount-desc': return list.sort((a, b) => b.treatmentAmount - a.treatmentAmount)
      case 'amount-asc': return list.sort((a, b) => a.treatmentAmount - b.treatmentAmount)
      case 'patient': return list.sort((a, b) => a.patientName.localeCompare(b.patientName))
      default: return list.sort((a, b) => b.date.localeCompare(a.date)) // date-desc
    }
  }, [filtered, sortBy])

  const uniquePatients = new Set(filtered.map((r) => r.patientId)).size
  const totalTreatmentAmount = filtered.reduce((sum, r) => sum + (Number(r.treatmentAmount) || 0), 0)

  useEffect(() => setPage(1), [query, typeFilter, from, to])

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const pageItems = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div>
      <PageHeader title="Patient & Treatment Billing Report" subtitle="Every billed treatment or medicine, line by line, for verifying patient billing." />

      <Card className="mb-6">
        <DateRangeFilter {...dateRange} />
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Billed Line Items" value={filtered.length.toLocaleString('en-IN')} icon={ClipboardList} />
        <StatCard label="Unique Patients" value={uniquePatients.toLocaleString('en-IN')} icon={Users} />
        <StatCard label="Total Treatment Amount" value={money(totalTreatmentAmount)} icon={Stethoscope} />
      </div>

      <Card>
        <div className="flex flex-col lg:flex-row gap-3 mb-4">
          <SearchInput value={query} onChange={setQuery} placeholder="Search by patient, invoice #, or treatment/medicine name..." className="flex-1" />
          <div className="flex flex-wrap gap-2">
            <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-40">
              <option value="All">All Types</option>
              <option value="Treatment">Treatment</option>
              <option value="Medicine">Medicine</option>
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

        <Table columns={['Patient', 'Invoice #', 'Date', 'Treatment / Medicine', 'Amount', 'CGST', 'SGST', 'Final Amount', 'Balance', 'Status']}>
          {loading && (
            <tr><td colSpan={10} className="py-10 text-center text-sm text-gray-400">Loading billing data…</td></tr>
          )}
          {!loading && pageItems.length === 0 && (
            <tr><td colSpan={10} className="py-10 text-center text-sm text-gray-400">No billed items match the current filters.</td></tr>
          )}
          {pageItems.map((r) => (
            <tr key={r.key} className="hover:bg-primary-50/40 transition">
              <td className="py-3 px-3 pl-0">
                <p className="font-medium text-gray-800">{r.patientName}</p>
                <p className="text-xs text-gray-400">{r.patientId}</p>
              </td>
              <td className="py-3 px-3 font-semibold text-gray-800">{r.invoiceId}</td>
              <td className="py-3 px-3 text-gray-600">{r.date}</td>
              <td className="py-3 px-3">
                <p className="text-gray-800">{r.treatmentName}</p>
                <p className="text-xs text-gray-400">{r.treatmentType}</p>
              </td>
              <td className="py-3 px-3 font-medium text-gray-700">{money(r.treatmentAmount)}</td>
              <td className="py-3 px-3 text-gray-600">{r.gstEnabled ? money(r.cgst) : '—'}</td>
              <td className="py-3 px-3 text-gray-600">{r.gstEnabled ? money(r.sgst) : '—'}</td>
              <td className="py-3 px-3 font-medium text-gray-700">{money(r.total)}</td>
              <td className="py-3 px-3 text-rose-600 font-medium">{money(r.balance)}</td>
              <td className="py-3 px-3"><Badge>{r.status}</Badge></td>
            </tr>
          ))}
        </Table>

        <Pagination page={page} totalPages={totalPages} onChange={setPage} totalItems={sorted.length} pageSize={PAGE_SIZE} />
      </Card>
    </div>
  )
}
