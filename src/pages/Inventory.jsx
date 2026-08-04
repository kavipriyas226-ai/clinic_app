import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  PackagePlus, ScanBarcode, Stethoscope, PackageCheck, AlertTriangle, PackageX,
  CalendarClock, Sparkles, Activity, PieChart, TrendingDown, History, ArrowUpRight,
} from 'lucide-react'
import Card from '../components/common/Card.jsx'
import PageHeader from '../components/common/PageHeader.jsx'
import Button from '../components/common/Button.jsx'
import StatCard from '../components/common/StatCard.jsx'
import Badge from '../components/common/Badge.jsx'
import InventoryTabs from '../components/inventory/InventoryTabs.jsx'
import { getInventory, getInventoryActivities } from '../api/inventory.js'
import { getTreatmentOptions } from '../api/treatments.js'
import { getStockStatus, isExpiringSoon, daysUntilExpiry } from '../utils/inventory.js'
import { timeAgo } from '../utils/time.js'

const ACTIVITY_ICONS = {
  CREATED: { icon: PackagePlus, color: 'text-primary-600 bg-primary-50' },
  STOCK_ADDED: { icon: PackageCheck, color: 'text-emerald-600 bg-emerald-50' },
  STOCK_REMOVED: { icon: PackageX, color: 'text-rose-600 bg-rose-50' },
  UPDATED: { icon: Activity, color: 'text-sky-600 bg-sky-50' },
  LOW_STOCK: { icon: AlertTriangle, color: 'text-amber-600 bg-amber-50' },
  DELETED: { icon: PackageX, color: 'text-gray-500 bg-gray-100' },
}

function parseIdNumber(id) {
  const n = parseInt((id || '').split('-')[1], 10)
  return Number.isNaN(n) ? 0 : n
}

function buildLowStockTrend(activities) {
  const days = []
  const counts = {}
  const now = new Date()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    days.push(key)
    counts[key] = 0
  }
  activities
    .filter((a) => a.type === 'LOW_STOCK')
    .forEach((a) => {
      const key = new Date(a.createdAt).toISOString().slice(0, 10)
      if (key in counts) counts[key] += 1
    })
  return days.map((key) => ({
    key,
    label: new Date(key).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
    count: counts[key],
  }))
}

export default function Inventory() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [inventory, setInventory] = useState([])
  const [treatments, setTreatments] = useState([])
  const [activities, setActivities] = useState([])

  useEffect(() => {
    Promise.all([getInventory(), getTreatmentOptions(), getInventoryActivities(50)])
      .then(([inv, treat, acts]) => {
        setInventory(inv)
        setTreatments(treat)
        setActivities(acts)
      })
      .finally(() => setLoading(false))
  }, [])

  const inStockCount = useMemo(() => inventory.filter((i) => getStockStatus(i) === 'In Stock').length, [inventory])
  const lowStockCount = useMemo(() => inventory.filter((i) => getStockStatus(i) === 'Low Stock').length, [inventory])
  const outOfStockCount = useMemo(() => inventory.filter((i) => getStockStatus(i) === 'Out of Stock').length, [inventory])

  const expiringSoon = useMemo(
    () =>
      inventory
        .filter((i) => isExpiringSoon(i.expiry))
        .sort((a, b) => daysUntilExpiry(a.expiry) - daysUntilExpiry(b.expiry))
        .slice(0, 5),
    [inventory]
  )

  const recentlyAdded = useMemo(
    () => inventory.slice().sort((a, b) => parseIdNumber(b.id) - parseIdNumber(a.id)).slice(0, 5),
    [inventory]
  )

  const categoryDistribution = useMemo(() => {
    const counts = inventory.reduce((acc, i) => {
      acc[i.category] = (acc[i.category] || 0) + 1
      return acc
    }, {})
    return Object.entries(counts).map(([category, count]) => ({ category, count }))
  }, [inventory])

  const stockMovement = useMemo(() => {
    return activities.reduce(
      (acc, a) => {
        if (typeof a.quantityChange === 'number') {
          if (a.quantityChange > 0) acc.added += a.quantityChange
          else acc.removed += Math.abs(a.quantityChange)
        }
        return acc
      },
      { added: 0, removed: 0 }
    )
  }, [activities])

  const lowStockTrend = useMemo(() => buildLowStockTrend(activities), [activities])
  const maxCategoryCount = Math.max(1, ...categoryDistribution.map((c) => c.count))
  const maxTrendCount = Math.max(1, ...lowStockTrend.map((d) => d.count))
  const recentActivities = activities.slice(0, 8)

  function goToMedicine(itemId) {
    navigate('/inventory/medicines', { state: { editItemId: itemId } })
  }

  const statCards = [
    { label: 'Total Medicines', value: String(inventory.length), icon: PackagePlus, to: '/inventory/medicines' },
    { label: 'Total Treatments', value: String(treatments.length), icon: Stethoscope, to: '/inventory/treatments' },
    { label: 'In-Stock Items', value: String(inStockCount), icon: PackageCheck, to: '/inventory/medicines', state: { initialStockFilter: 'In Stock' } },
    { label: 'Low Stock Alerts', value: String(lowStockCount), icon: AlertTriangle, to: '/inventory/medicines', state: { initialStockFilter: 'Low Stock' } },
    { label: 'Out-of-Stock Items', value: String(outOfStockCount), icon: PackageX, to: '/inventory/medicines', state: { initialStockFilter: 'Out of Stock' } },
  ]

  if (loading) {
    return (
      <Card className="text-center py-12">
        <p className="text-gray-500">Loading inventory dashboard…</p>
      </Card>
    )
  }

  return (
    <div>
      <PageHeader
        title="Inventory"
        subtitle="Manage medicines and treatments offered at your clinic"
        actions={
          <Button icon={ScanBarcode} onClick={() => navigate('/inventory/medicines', { state: { autoOpenScan: true } })}>
            Scan Barcode
          </Button>
        }
      />

      <InventoryTabs />

      {/* Stat grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {statCards.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <PieChart size={16} className="text-primary-500" /> Inventory Distribution
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">Medicines by category</p>
            </div>
            <Link to="/inventory/medicines" className="text-xs font-semibold text-primary-600 hover:underline flex items-center gap-1">
              View all <ArrowUpRight size={12} />
            </Link>
          </div>
          {categoryDistribution.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-10">No medicines yet.</p>
          ) : (
            <div className="flex items-end gap-3 sm:gap-6 h-48">
              {categoryDistribution.map((c) => (
                <Link
                  key={c.category}
                  to="/inventory/medicines"
                  state={{ initialCategoryFilter: c.category }}
                  className="flex-1 flex flex-col items-center justify-end h-full gap-2 group"
                >
                  <span className="text-[11px] font-semibold text-gray-500">{c.count}</span>
                  <div
                    className="w-full max-w-[36px] rounded-t-lg bg-gradient-to-t from-primary-500 to-primary-300 group-hover:opacity-80 transition-all"
                    style={{ height: `${(c.count / maxCategoryCount) * 100}%` }}
                  />
                  <span className="text-xs text-gray-400 text-center leading-tight">{c.category}</span>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <TrendingDown size={16} className="text-amber-500" /> Low Stock Trend
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">New low-stock alerts, last 7 days</p>
            </div>
            <Link
              to="/inventory/medicines"
              state={{ initialStockFilter: 'Low Stock' }}
              className="text-xs font-semibold text-primary-600 hover:underline flex items-center gap-1"
            >
              View all <ArrowUpRight size={12} />
            </Link>
          </div>
          <div className="flex items-end gap-2 sm:gap-3 h-48">
            {lowStockTrend.map((d) => (
              <div key={d.key} className="flex-1 flex flex-col items-center justify-end h-full gap-2" title={`${d.count} on ${d.label}`}>
                <span className="text-[11px] font-semibold text-gray-500">{d.count}</span>
                <div
                  className="w-full max-w-[28px] rounded-t-lg bg-gradient-to-t from-amber-500 to-amber-300 transition-all"
                  style={{ height: `${Math.max(4, (d.count / maxTrendCount) * 100)}%` }}
                />
                <span className="text-[11px] text-gray-400">{d.label}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Lists */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Sparkles size={16} className="text-primary-500" /> Recently Added Items
            </h3>
            <Link to="/inventory/medicines" className="text-xs font-semibold text-primary-600 hover:underline">
              View all
            </Link>
          </div>
          {recentlyAdded.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No medicines yet.</p>
          ) : (
            <div className="space-y-1">
              {recentlyAdded.map((item) => (
                <button
                  key={item.id}
                  onClick={() => goToMedicine(item.id)}
                  className="w-full flex items-center justify-between gap-3 py-2.5 px-2 rounded-xl hover:bg-primary-50/60 transition text-left"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
                    <p className="text-xs text-gray-400">{item.id} · {item.category}</p>
                  </div>
                  <Badge color="purple">{item.stock} units</Badge>
                </button>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <CalendarClock size={16} className="text-amber-500" /> Expiring Soon Medicines
            </h3>
            <Link to="/inventory/medicines" className="text-xs font-semibold text-primary-600 hover:underline">
              View all
            </Link>
          </div>
          {expiringSoon.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Nothing expiring in the next 60 days.</p>
          ) : (
            <div className="space-y-1">
              {expiringSoon.map((item) => {
                const days = Math.ceil(daysUntilExpiry(item.expiry))
                return (
                  <button
                    key={item.id}
                    onClick={() => goToMedicine(item.id)}
                    className="w-full flex items-center justify-between gap-3 py-2.5 px-2 rounded-xl hover:bg-primary-50/60 transition text-left"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
                      <p className="text-xs text-gray-400">Expires {item.expiry}</p>
                    </div>
                    <Badge color={days <= 0 ? 'red' : days <= 14 ? 'yellow' : 'gray'}>
                      {days <= 0 ? 'Expired' : `${days}d left`}
                    </Badge>
                  </button>
                )
              })}
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card>
          <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-1">
            <Activity size={16} className="text-primary-500" /> Stock Movement Summary
          </h3>
          <p className="text-xs text-gray-400 mb-5">From the most recent inventory activity</p>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="text-gray-600 font-medium">Units added</span>
                <span className="font-bold text-emerald-600">+{stockMovement.added}</span>
              </div>
              <div className="h-2 rounded-full bg-emerald-50 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${Math.min(100, (stockMovement.added / Math.max(1, stockMovement.added + stockMovement.removed)) * 100)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="text-gray-600 font-medium">Units removed</span>
                <span className="font-bold text-rose-600">-{stockMovement.removed}</span>
              </div>
              <div className="h-2 rounded-full bg-rose-50 overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full"
                  style={{ width: `${Math.min(100, (stockMovement.removed / Math.max(1, stockMovement.added + stockMovement.removed)) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </Card>

        <Card className="xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <History size={16} className="text-primary-500" /> Recent Inventory Activities
            </h3>
          </div>
          {recentActivities.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No activity yet.</p>
          ) : (
            <div className="space-y-1">
              {recentActivities.map((a) => {
                const meta = ACTIVITY_ICONS[a.type] || ACTIVITY_ICONS.UPDATED
                const Icon = meta.icon
                const stillExists = a.itemId && inventory.some((i) => i.id === a.itemId)
                const rowContent = (
                  <>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${meta.color}`}>
                      <Icon size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-700 truncate">{a.message}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{timeAgo(a.createdAt)}</p>
                    </div>
                  </>
                )
                return stillExists ? (
                  <button
                    key={a.id}
                    onClick={() => goToMedicine(a.itemId)}
                    className="w-full flex items-center gap-3 py-2 px-2 rounded-xl hover:bg-primary-50/60 transition text-left"
                  >
                    {rowContent}
                  </button>
                ) : (
                  <div key={a.id} className="w-full flex items-center gap-3 py-2 px-2">
                    {rowContent}
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
