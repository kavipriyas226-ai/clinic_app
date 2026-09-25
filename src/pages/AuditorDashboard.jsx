import { useEffect, useState } from 'react'
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
import DateRangeFilter, { useDateRange } from '../components/auditor/DateRangeFilter.jsx'
import { getAuditorDashboard } from '../api/auditor.js'

export default function AuditorDashboard() {
  const dateRange = useDateRange('month')
  const { from, to } = dateRange
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stats, setStats] = useState(null)

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
        <DateRangeFilter {...dateRange} />
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
