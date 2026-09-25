import { useEffect, useMemo, useState } from 'react'
import { Boxes, AlertTriangle, CalendarX, PackagePlus, PackageMinus } from 'lucide-react'
import Card from '../components/common/Card.jsx'
import PageHeader from '../components/common/PageHeader.jsx'
import SearchInput from '../components/common/SearchInput.jsx'
import Table from '../components/common/Table.jsx'
import Badge from '../components/common/Badge.jsx'
import StatCard from '../components/common/StatCard.jsx'
import Pagination from '../components/common/Pagination.jsx'
import { Select } from '../components/common/FormField.jsx'
import DateRangeFilter, { useDateRange } from '../components/auditor/DateRangeFilter.jsx'
import { getInventory, getInventoryActivities } from '../api/inventory.js'
import { getStockStatus, isExpiringSoon } from '../utils/inventory.js'

const PAGE_SIZE = 10
const money = (n) => `₹${(Number(n) || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`

const activityTypeLabel = {
  CREATED: 'Item Created',
  STOCK_ADDED: 'Stock Added',
  STOCK_REMOVED: 'Stock Removed',
  UPDATED: 'Details Updated',
  LOW_STOCK: 'Low Stock Alert',
  DELETED: 'Item Deleted',
}

export default function AuditorInventoryReport() {
  const dateRange = useDateRange('month')
  const { from, to } = dateRange

  const [items, setItems] = useState([])
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [stockQuery, setStockQuery] = useState('')
  const [stockStatusFilter, setStockStatusFilter] = useState('All')
  const [stockPage, setStockPage] = useState(1)

  const [movementQuery, setMovementQuery] = useState('')
  const [movementTypeFilter, setMovementTypeFilter] = useState('All')
  const [movementPage, setMovementPage] = useState(1)

  useEffect(() => {
    setLoading(true)
    setError('')
    Promise.all([getInventory(), getInventoryActivities(2000)])
      .then(([inv, acts]) => {
        setItems(inv)
        setActivities(acts)
      })
      .catch(() => setError('Could not load inventory data. Please try again.'))
      .finally(() => setLoading(false))
  }, [])

  const priceByItemId = useMemo(() => Object.fromEntries(items.map((i) => [i.id, i.price])), [items])

  // Product-wise stock — a current snapshot, not date-filtered.
  const filteredItems = useMemo(() => {
    return items
      .filter((i) => {
        const q = stockQuery.trim().toLowerCase()
        if (!q) return true
        return i.name.toLowerCase().includes(q) || i.id.toLowerCase().includes(q) || i.supplier.toLowerCase().includes(q)
      })
      .filter((i) => {
        if (stockStatusFilter === 'All') return true
        if (stockStatusFilter === 'Expiring Soon') return isExpiringSoon(i.expiry)
        return getStockStatus(i) === stockStatusFilter
      })
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [items, stockQuery, stockStatusFilter])

  const stockTotalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE))
  const stockPageItems = filteredItems.slice((stockPage - 1) * PAGE_SIZE, stockPage * PAGE_SIZE)

  const currentStockValue = items.reduce((sum, i) => sum + (Number(i.price) || 0) * (Number(i.stock) || 0), 0)
  const lowStockCount = items.filter((i) => getStockStatus(i) === 'Low Stock' || getStockStatus(i) === 'Out of Stock').length
  const expiringCount = items.filter((i) => isExpiringSoon(i.expiry)).length

  // Stock movement — date-filtered activity feed.
  const filteredActivities = useMemo(() => {
    return activities
      .filter((a) => {
        if (!from && !to) return true
        const date = a.createdAt?.slice(0, 10)
        return (!from || date >= from) && (!to || date <= to)
      })
      .filter((a) => {
        const q = movementQuery.trim().toLowerCase()
        if (!q) return true
        return (a.itemName || '').toLowerCase().includes(q) || (a.itemId || '').toLowerCase().includes(q)
      })
      .filter((a) => movementTypeFilter === 'All' || a.type === movementTypeFilter)
  }, [activities, from, to, movementQuery, movementTypeFilter])

  const stockAdded = filteredActivities.filter((a) => a.type === 'STOCK_ADDED').reduce((sum, a) => sum + (a.quantityChange || 0), 0)
  const stockRemoved = filteredActivities.filter((a) => a.type === 'STOCK_REMOVED').reduce((sum, a) => sum + Math.abs(a.quantityChange || 0), 0)

  const movementTotalPages = Math.max(1, Math.ceil(filteredActivities.length / PAGE_SIZE))
  const movementPageItems = filteredActivities.slice((movementPage - 1) * PAGE_SIZE, movementPage * PAGE_SIZE)

  useEffect(() => setStockPage(1), [stockQuery, stockStatusFilter])
  useEffect(() => setMovementPage(1), [movementQuery, movementTypeFilter, from, to])

  return (
    <div>
      <PageHeader title="Inventory Report" subtitle="Current stock value, low-stock and expiry status, and the stock movement history." />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <StatCard label="Stock Value" value={money(currentStockValue)} icon={Boxes} />
        <StatCard label="Low Stock Items" value={lowStockCount.toLocaleString('en-IN')} icon={AlertTriangle} />
        <StatCard label="Expiring Soon" value={expiringCount.toLocaleString('en-IN')} icon={CalendarX} />
        <StatCard label="Stock Added" value={stockAdded.toLocaleString('en-IN')} icon={PackagePlus} />
        <StatCard label="Stock Removed" value={stockRemoved.toLocaleString('en-IN')} icon={PackageMinus} />
      </div>

      {error && (
        <div className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2 mb-6">{error}</div>
      )}

      <Card className="mb-6">
        <h3 className="font-bold text-gray-800 mb-4">Product-Wise Stock</h3>
        <div className="flex flex-col lg:flex-row gap-3 mb-4">
          <SearchInput value={stockQuery} onChange={setStockQuery} placeholder="Search by product, ID, or supplier..." className="flex-1" />
          <Select value={stockStatusFilter} onChange={(e) => setStockStatusFilter(e.target.value)} className="w-44">
            <option value="All">All Statuses</option>
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
            <option value="Expiring Soon">Expiring Soon</option>
          </Select>
        </div>

        <Table columns={['Product', 'Category', 'Stock', 'Price', 'Stock Value', 'Expiry', 'Supplier', 'Status']}>
          {loading && (
            <tr><td colSpan={8} className="py-10 text-center text-sm text-gray-400">Loading inventory…</td></tr>
          )}
          {!loading && stockPageItems.length === 0 && (
            <tr><td colSpan={8} className="py-10 text-center text-sm text-gray-400">No items match the current filters.</td></tr>
          )}
          {stockPageItems.map((item) => {
            const status = getStockStatus(item)
            return (
              <tr key={item.id} className="hover:bg-primary-50/40 transition">
                <td className="py-3 px-3 pl-0">
                  <p className="font-medium text-gray-800">{item.name}</p>
                  <p className="text-xs text-gray-400">{item.id}</p>
                </td>
                <td className="py-3 px-3 text-gray-600">{item.category}</td>
                <td className="py-3 px-3 text-gray-700">{item.stock}</td>
                <td className="py-3 px-3 text-gray-600">{money(item.price)}</td>
                <td className="py-3 px-3 font-medium text-gray-700">{money(item.price * item.stock)}</td>
                <td className="py-3 px-3 text-gray-600">
                  {item.expiry}
                  {isExpiringSoon(item.expiry) && <span className="ml-1.5"><Badge color="red">Expiring</Badge></span>}
                </td>
                <td className="py-3 px-3 text-gray-600">{item.supplier}</td>
                <td className="py-3 px-3"><Badge>{status}</Badge></td>
              </tr>
            )
          })}
        </Table>

        <Pagination page={stockPage} totalPages={stockTotalPages} onChange={setStockPage} totalItems={filteredItems.length} pageSize={PAGE_SIZE} />
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800">Stock Movement</h3>
        </div>
        <Card className="!p-0 !shadow-none !border-0 mb-4">
          <DateRangeFilter {...dateRange} />
        </Card>
        <div className="flex flex-col lg:flex-row gap-3 mb-4">
          <SearchInput value={movementQuery} onChange={setMovementQuery} placeholder="Search by product name or ID..." className="flex-1" />
          <Select value={movementTypeFilter} onChange={(e) => setMovementTypeFilter(e.target.value)} className="w-48">
            <option value="All">All Transaction Types</option>
            {Object.entries(activityTypeLabel).map(([type, label]) => (
              <option key={type} value={type}>{label}</option>
            ))}
          </Select>
        </div>

        <Table columns={['Date', 'Product', 'Transaction Type', 'Quantity', 'Value']}>
          {loading && (
            <tr><td colSpan={5} className="py-10 text-center text-sm text-gray-400">Loading stock movement…</td></tr>
          )}
          {!loading && movementPageItems.length === 0 && (
            <tr><td colSpan={5} className="py-10 text-center text-sm text-gray-400">No stock movement matches the current filters.</td></tr>
          )}
          {movementPageItems.map((a) => {
            const price = priceByItemId[a.itemId]
            const value = a.quantityChange != null && price != null ? Math.abs(a.quantityChange) * price : null
            return (
              <tr key={a.id} className="hover:bg-primary-50/40 transition">
                <td className="py-3 px-3 pl-0 text-gray-600">{a.createdAt?.slice(0, 10)}</td>
                <td className="py-3 px-3">
                  <p className="font-medium text-gray-800">{a.itemName}</p>
                  <p className="text-xs text-gray-400">{a.itemId}</p>
                </td>
                <td className="py-3 px-3"><Badge color="purple">{activityTypeLabel[a.type] || a.type}</Badge></td>
                <td className="py-3 px-3 text-gray-700">{a.quantityChange != null ? (a.quantityChange > 0 ? `+${a.quantityChange}` : a.quantityChange) : '—'}</td>
                <td className="py-3 px-3 text-gray-600">{value != null ? money(value) : '—'}</td>
              </tr>
            )
          })}
        </Table>

        <Pagination page={movementPage} totalPages={movementTotalPages} onChange={setMovementPage} totalItems={filteredActivities.length} pageSize={PAGE_SIZE} />
        <p className="text-xs text-gray-400 mt-3">
          Value is estimated using each product's current price — the system doesn't keep a historical price at the time of each transaction.
        </p>
      </Card>
    </div>
  )
}
