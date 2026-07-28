import { useMemo, useState } from 'react'
import { CreditCard, Banknote, Smartphone, Filter } from 'lucide-react'
import Card from '../components/common/Card.jsx'
import PageHeader from '../components/common/PageHeader.jsx'
import SearchInput from '../components/common/SearchInput.jsx'
import Table from '../components/common/Table.jsx'
import Badge from '../components/common/Badge.jsx'
import { Select } from '../components/common/FormField.jsx'
import StatCard from '../components/common/StatCard.jsx'
import { invoices } from '../data/mockData.js'

const methodIcon = {
  UPI: Smartphone,
  Card: CreditCard,
  Cash: Banknote,
  '—': Banknote,
}

export default function Payments() {
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  const filtered = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesQuery =
        inv.patient.toLowerCase().includes(query.toLowerCase()) ||
        inv.id.toLowerCase().includes(query.toLowerCase())
      const matchesStatus = statusFilter === 'All' || inv.status === statusFilter
      return matchesQuery && matchesStatus
    })
  }, [query, statusFilter])

  const totals = useMemo(() => {
    const paid = invoices.filter((i) => i.status === 'Paid').reduce((s, i) => s + i.amount, 0)
    const pending = invoices.filter((i) => i.status === 'Pending').reduce((s, i) => s + i.amount, 0)
    const overdue = invoices.filter((i) => i.status === 'Overdue').reduce((s, i) => s + i.amount, 0)
    return { paid, pending, overdue }
  }, [])

  return (
    <div>
      <PageHeader title="Payments" subtitle="Track payment history, methods and statuses" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Collected" value={`₹${totals.paid.toLocaleString('en-IN')}`} icon={Banknote} />
        <StatCard label="Pending Payments" value={`₹${totals.pending.toLocaleString('en-IN')}`} icon={CreditCard} />
        <StatCard label="Overdue Payments" value={`₹${totals.overdue.toLocaleString('en-IN')}`} icon={Smartphone} />
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <SearchInput value={query} onChange={setQuery} placeholder="Search by patient or invoice ID..." className="flex-1" />
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400 shrink-0" />
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-40">
              <option>All</option>
              <option>Paid</option>
              <option>Pending</option>
              <option>Overdue</option>
            </Select>
          </div>
        </div>

        <Table columns={['Invoice ID', 'Patient', 'Date', 'Amount', 'Method', 'Status']}>
          {filtered.length === 0 && (
            <tr>
              <td colSpan={6} className="py-10 text-center text-sm text-gray-400">No payments found.</td>
            </tr>
          )}
          {filtered.map((inv) => {
            const Icon = methodIcon[inv.method]
            return (
              <tr key={inv.id} className="hover:bg-primary-50/40 transition">
                <td className="py-3 px-3 pl-0 font-semibold text-gray-800">{inv.id}</td>
                <td className="py-3 px-3 text-gray-600">{inv.patient}</td>
                <td className="py-3 px-3 text-gray-600">{inv.date}</td>
                <td className="py-3 px-3 font-medium text-gray-700">₹{inv.amount.toLocaleString('en-IN')}</td>
                <td className="py-3 px-3 text-gray-600">
                  <span className="flex items-center gap-1.5">
                    <Icon size={14} className="text-gray-400" /> {inv.method}
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
