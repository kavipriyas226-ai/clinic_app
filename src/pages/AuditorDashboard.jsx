import { useEffect, useMemo, useState } from 'react'
import {
  IndianRupee,
  Wallet,
  Hourglass,
  Percent,
  ReceiptText,
  Boxes,
  FileText,
  Users,
  Activity,
} from 'lucide-react'
import Card from '../components/common/Card.jsx'
import StatCard from '../components/common/StatCard.jsx'
import PageHeader from '../components/common/PageHeader.jsx'
import { FormField, Select, TextInput } from '../components/common/FormField.jsx'
import { getAuditorDashboard } from '../api/auditor.js'

const RANGE_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'year', label: 'This Year' },
  { value: 'custom', label: 'Custom Date Range' },
]

// Formats using local date components, not toISOString() (which converts to UTC first and
// would shift the date backward for any timezone ahead of UTC, e.g. IST).
function toIso(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// Computes the [from, to] ISO date pair for a named range, anchored to today. "custom"
// returns nulls — the caller supplies explicit dates from the date pickers instead.
function computeRange(rangeType) {
  const today = new Date()
  const to = toIso(today)
  switch (rangeType) {
    case 'today':
      return { from: to, to }
    case 'week': {
      const day = today.getDay() === 0 ? 7 : today.getDay() // Monday-start week
      const monday = new Date(today)
      monday.setDate(today.getDate() - (day - 1))
      return { from: toIso(monday), to }
    }
    case 'month': {
      const first = new Date(today.getFullYear(), today.getMonth(), 1)
      return { from: toIso(first), to }
    }
    case 'year': {
      const first = new Date(today.getFullYear(), 0, 1)
      return { from: toIso(first), to }
    }
    default:
      return { from: null, to: null }
  }
}

export default function AuditorDashboard() {
  const [rangeType, setRangeType] = useState('month')
  const [customFrom, setCustomFrom] = useState(toIso(new Date(new Date().getFullYear(), new Date().getMonth(), 1)))
  const [customTo, setCustomTo] = useState(toIso(new Date()))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stats, setStats] = useState(null)

  const { from, to } = useMemo(() => {
    if (rangeType === 'custom') return { from: customFrom, to: customTo }
    return computeRange(rangeType)
  }, [rangeType, customFrom, customTo])

  useEffect(() => {
    setLoading(true)
    setError('')
    getAuditorDashboard({ from, to })
      .then(setStats)
      .catch(() => setError('Could not load dashboard data. Please try again.'))
      .finally(() => setLoading(false))
  }, [from, to])

  const cards = stats
    ? [
        { label: 'Total Billing Amount', value: `₹${stats.totalBillingAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, icon: IndianRupee },
        { label: 'Total Amount Collected', value: `₹${stats.totalCollected.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, icon: Wallet },
        { label: 'Total Pending Amount', value: `₹${stats.totalPending.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, icon: Hourglass },
        { label: 'Total Discounts', value: `₹${stats.totalDiscounts.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, icon: Percent },
        { label: 'Total CGST Collected', value: `₹${stats.totalCgst.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, icon: ReceiptText },
        { label: 'Total SGST Collected', value: `₹${stats.totalSgst.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, icon: ReceiptText },
        { label: 'Inventory / Purchase Value', value: `₹${stats.inventoryValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, icon: Boxes },
        { label: 'Total Invoice Count', value: stats.totalInvoiceCount.toLocaleString('en-IN'), icon: FileText },
        { label: 'Total Patients', value: stats.totalPatients.toLocaleString('en-IN'), icon: Users },
        { label: 'Total Billing Transactions', value: stats.totalBillingTransactions.toLocaleString('en-IN'), icon: Activity },
      ]
    : []

  return (
    <div>
      <PageHeader title="Auditor Dashboard" subtitle="Read-only overview of billing, collections, and GST for the selected period." />

      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <FormField label="Date Range" className="w-full sm:w-56">
            <Select value={rangeType} onChange={(e) => setRangeType(e.target.value)}>
              {RANGE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
          </FormField>
          {rangeType === 'custom' && (
            <>
              <FormField label="From" className="w-full sm:w-44">
                <TextInput type="date" value={customFrom} max={customTo} onChange={(e) => setCustomFrom(e.target.value)} />
              </FormField>
              <FormField label="To" className="w-full sm:w-44">
                <TextInput type="date" value={customTo} min={customFrom} onChange={(e) => setCustomTo(e.target.value)} />
              </FormField>
            </>
          )}
          {rangeType !== 'custom' && from && (
            <p className="text-xs text-gray-400 pb-2.5">{from} to {to}</p>
          )}
        </div>
      </Card>

      {error && (
        <div className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2 mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <Card className="text-center py-12">
          <p className="text-gray-500">Loading dashboard…</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {cards.map((c) => (
            <StatCard key={c.label} {...c} />
          ))}
        </div>
      )}
    </div>
  )
}
