<<<<<<< HEAD
import { useEffect, useMemo, useState } from 'react'
import { CreditCard, Banknote, Smartphone, Filter, History } from 'lucide-react'
=======
import { useMemo, useState } from 'react'
import { CreditCard, Banknote, Smartphone, Filter } from 'lucide-react'
>>>>>>> 600209e07c32b1f3f515ecd74a8d9c1b3620a293
import Card from '../components/common/Card.jsx'
import PageHeader from '../components/common/PageHeader.jsx'
import SearchInput from '../components/common/SearchInput.jsx'
import Table from '../components/common/Table.jsx'
import Badge from '../components/common/Badge.jsx'
import { Select } from '../components/common/FormField.jsx'
import StatCard from '../components/common/StatCard.jsx'
<<<<<<< HEAD
import { getInvoices, getPaymentsSummary } from '../api/invoices.js'
=======
import { invoices } from '../data/mockData.js'
>>>>>>> 600209e07c32b1f3f515ecd74a8d9c1b3620a293

const methodIcon = {
  UPI: Smartphone,
  Card: CreditCard,
  Cash: Banknote,
  '—': Banknote,
}

export default function Payments() {
<<<<<<< HEAD
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [collectedPeriod, setCollectedPeriod] = useState('total')
  const [totals, setTotals] = useState({ paid: 0, unpaid: 0 })

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
=======
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
>>>>>>> 600209e07c32b1f3f515ecd74a8d9c1b3620a293

  const filtered = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesQuery =
<<<<<<< HEAD
        inv.patientName.toLowerCase().includes(query.toLowerCase()) ||
=======
        inv.patient.toLowerCase().includes(query.toLowerCase()) ||
>>>>>>> 600209e07c32b1f3f515ecd74a8d9c1b3620a293
        inv.id.toLowerCase().includes(query.toLowerCase())
      const matchesStatus = statusFilter === 'All' || inv.status === statusFilter
      return matchesQuery && matchesStatus
    })
<<<<<<< HEAD
  }, [invoices, query, statusFilter])
=======
  }, [query, statusFilter])

  const totals = useMemo(() => {
    const paid = invoices.filter((i) => i.status === 'Paid').reduce((s, i) => s + i.amount, 0)
    const pending = invoices.filter((i) => i.status === 'Pending').reduce((s, i) => s + i.amount, 0)
    const overdue = invoices.filter((i) => i.status === 'Overdue').reduce((s, i) => s + i.amount, 0)
    return { paid, pending, overdue }
  }, [])
>>>>>>> 600209e07c32b1f3f515ecd74a8d9c1b3620a293

  return (
    <div>
      <PageHeader title="Payments" subtitle="Track payment history, methods and statuses" />

<<<<<<< HEAD
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

=======
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Collected" value={`₹${totals.paid.toLocaleString('en-IN')}`} icon={Banknote} />
        <StatCard label="Pending Payments" value={`₹${totals.pending.toLocaleString('en-IN')}`} icon={CreditCard} />
        <StatCard label="Overdue Payments" value={`₹${totals.overdue.toLocaleString('en-IN')}`} icon={Smartphone} />
      </div>

      <Card>
>>>>>>> 600209e07c32b1f3f515ecd74a8d9c1b3620a293
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <SearchInput value={query} onChange={setQuery} placeholder="Search by patient or invoice ID..." className="flex-1" />
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400 shrink-0" />
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-40">
              <option>All</option>
              <option>Paid</option>
<<<<<<< HEAD
=======
              <option>Pending</option>
              <option>Overdue</option>
>>>>>>> 600209e07c32b1f3f515ecd74a8d9c1b3620a293
            </Select>
          </div>
        </div>

        <Table columns={['Invoice ID', 'Patient', 'Date', 'Amount', 'Method', 'Status']}>
<<<<<<< HEAD
          {loading && (
            <tr>
              <td colSpan={6} className="py-10 text-center text-sm text-gray-400">Loading payments…</td>
            </tr>
          )}
          {!loading && filtered.length === 0 && (
=======
          {filtered.length === 0 && (
>>>>>>> 600209e07c32b1f3f515ecd74a8d9c1b3620a293
            <tr>
              <td colSpan={6} className="py-10 text-center text-sm text-gray-400">No payments found.</td>
            </tr>
          )}
          {filtered.map((inv) => {
            const Icon = methodIcon[inv.method]
            return (
              <tr key={inv.id} className="hover:bg-primary-50/40 transition">
                <td className="py-3 px-3 pl-0 font-semibold text-gray-800">{inv.id}</td>
<<<<<<< HEAD
                <td className="py-3 px-3 text-gray-600">{inv.patientName}</td>
                <td className="py-3 px-3 text-gray-600">{inv.date}</td>
                <td className="py-3 px-3 font-medium text-gray-700">₹{inv.total.toLocaleString('en-IN')}</td>
                <td className="py-3 px-3 text-gray-600">
                  <span className="flex items-center gap-1.5">
                    {Icon && <Icon size={14} className="text-gray-400" />} {inv.method}
=======
                <td className="py-3 px-3 text-gray-600">{inv.patient}</td>
                <td className="py-3 px-3 text-gray-600">{inv.date}</td>
                <td className="py-3 px-3 font-medium text-gray-700">₹{inv.amount.toLocaleString('en-IN')}</td>
                <td className="py-3 px-3 text-gray-600">
                  <span className="flex items-center gap-1.5">
                    <Icon size={14} className="text-gray-400" /> {inv.method}
>>>>>>> 600209e07c32b1f3f515ecd74a8d9c1b3620a293
                  </span>
                </td>
                <td className="py-3 px-3"><Badge>{inv.status}</Badge></td>
              </tr>
            )
          })}
        </Table>
      </Card>
    </div>
  )
}
