import { useEffect, useMemo, useState } from 'react'
import { Eye, History } from 'lucide-react'
import Card from '../components/common/Card.jsx'
import PageHeader from '../components/common/PageHeader.jsx'
import SearchInput from '../components/common/SearchInput.jsx'
import Table from '../components/common/Table.jsx'
import Badge from '../components/common/Badge.jsx'
import Modal from '../components/common/Modal.jsx'
import Pagination from '../components/common/Pagination.jsx'
import { Select } from '../components/common/FormField.jsx'
import DateRangeFilter, { useDateRange } from '../components/auditor/DateRangeFilter.jsx'
import { getAuditLog } from '../api/auditor.js'

const PAGE_SIZE = 12
const moduleColor = { Billing: 'purple', Payment: 'blue', Inventory: 'yellow' }

function formatTimestamp(iso) {
  const d = new Date(iso)
  return {
    date: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    time: d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
  }
}

export default function AuditorAuditLog() {
  const dateRange = useDateRange('month')
  const { from, to } = dateRange

  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [moduleFilter, setModuleFilter] = useState('All')
  const [page, setPage] = useState(1)
  const [viewTarget, setViewTarget] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError('')
    getAuditLog({ module: moduleFilter === 'All' ? undefined : moduleFilter, from, to })
      .then(setEntries)
      .catch(() => setError('Could not load the audit log. Please try again.'))
      .finally(() => setLoading(false))
  }, [moduleFilter, from, to])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return entries
    return entries.filter(
      (e) =>
        e.recordId?.toLowerCase().includes(q) ||
        e.userName?.toLowerCase().includes(q) ||
        e.action?.toLowerCase().includes(q) ||
        e.summary?.toLowerCase().includes(q)
    )
  }, [entries, query])

  useEffect(() => setPage(1), [query, moduleFilter, from, to])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div>
      <PageHeader title="Audit Log" subtitle="A record of financial and inventory changes, captured from the moment this log was introduced." />

      <div className="flex items-start gap-2 text-sm text-primary-700 bg-primary-50 border border-primary-100 rounded-xl px-3 py-2.5 mb-6">
        <History size={15} className="shrink-0 mt-0.5" />
        <p>This log only covers changes made after the audit trail was added — it has no way to reconstruct history for changes made before that point.</p>
      </div>

      <Card className="mb-6">
        <DateRangeFilter {...dateRange} />
      </Card>

      <Card>
        <div className="flex flex-col lg:flex-row gap-3 mb-4">
          <SearchInput value={query} onChange={setQuery} placeholder="Search by record ID, user, action, or summary..." className="flex-1" />
          <Select value={moduleFilter} onChange={(e) => setModuleFilter(e.target.value)} className="w-44">
            <option value="All">All Modules</option>
            <option value="Billing">Billing</option>
            <option value="Payment">Payment</option>
            <option value="Inventory">Inventory</option>
          </Select>
        </div>

        {error && (
          <div className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2 mb-4">{error}</div>
        )}

        <Table columns={['Date & Time', 'Module', 'Action', 'Record', 'User', 'Summary', 'Actions']}>
          {loading && (
            <tr><td colSpan={7} className="py-10 text-center text-sm text-gray-400">Loading audit log…</td></tr>
          )}
          {!loading && pageItems.length === 0 && (
            <tr><td colSpan={7} className="py-10 text-center text-sm text-gray-400">No audit entries match the current filters.</td></tr>
          )}
          {pageItems.map((e) => {
            const { date, time } = formatTimestamp(e.timestamp)
            return (
              <tr key={e.id} className="hover:bg-primary-50/40 transition">
                <td className="py-3 px-3 pl-0 text-gray-600">
                  <p>{date}</p>
                  <p className="text-xs text-gray-400">{time}</p>
                </td>
                <td className="py-3 px-3"><Badge color={moduleColor[e.module] || 'gray'}>{e.module}</Badge></td>
                <td className="py-3 px-3 text-gray-800 font-medium">{e.action}</td>
                <td className="py-3 px-3 text-gray-600">{e.recordId}</td>
                <td className="py-3 px-3">
                  <p className="text-gray-800">{e.userName}</p>
                  <p className="text-xs text-gray-400">{e.userRole}</p>
                </td>
                <td className="py-3 px-3 text-gray-500 text-xs max-w-[240px] truncate">{e.summary}</td>
                <td className="py-3 px-3">
                  <button
                    onClick={() => setViewTarget(e)}
                    className="p-1.5 rounded-lg text-gray-400 hover:bg-primary-100 hover:text-primary-600 transition"
                    title="View Details"
                  >
                    <Eye size={15} />
                  </button>
                </td>
              </tr>
            )
          })}
        </Table>

        <Pagination page={page} totalPages={totalPages} onChange={setPage} totalItems={filtered.length} pageSize={PAGE_SIZE} />
      </Card>

      <Modal open={!!viewTarget} onClose={() => setViewTarget(null)} title="Audit Entry Details">
        {viewTarget && (
          <div className="space-y-3 text-sm">
            <DetailRow label="Module" value={<Badge color={moduleColor[viewTarget.module] || 'gray'}>{viewTarget.module}</Badge>} />
            <DetailRow label="Action" value={viewTarget.action} />
            <DetailRow label="Record ID" value={viewTarget.recordId} />
            <DetailRow label="Changed By" value={`${viewTarget.userName} (${viewTarget.userRole})`} />
            <DetailRow label="Date" value={formatTimestamp(viewTarget.timestamp).date} />
            <DetailRow label="Time" value={formatTimestamp(viewTarget.timestamp).time} />
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Summary</p>
              <p className="text-gray-700">{viewTarget.summary}</p>
            </div>
            {viewTarget.oldValue && (
              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Old Value</p>
                <p className="text-gray-700">{viewTarget.oldValue}</p>
              </div>
            )}
            {viewTarget.newValue && (
              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-400 uppercase mb-1">New Value</p>
                <p className="text-gray-700">{viewTarget.newValue}</p>
              </div>
            )}
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
