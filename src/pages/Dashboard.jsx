import { Link } from 'react-router-dom'
import {
  Users,
  CalendarCheck,
  IndianRupee,
  PackageX,
  UserPlus,
  Receipt,
  PackagePlus,
  BarChart3,
  ArrowUpRight,
} from 'lucide-react'
import Card from '../components/common/Card.jsx'
import StatCard from '../components/common/StatCard.jsx'
import Badge from '../components/common/Badge.jsx'
import PageHeader from '../components/common/PageHeader.jsx'
import {
  dashboardStats,
  revenueChart,
  recentPatients,
  lowStockMedicines,
} from '../data/mockData.js'

const statIcons = [Users, CalendarCheck, IndianRupee, PackageX]

const quickActions = [
  { label: 'Register Patient', to: '/patients/register', icon: UserPlus },
  { label: 'Create Invoice', to: '/billing', icon: Receipt },
  { label: 'Add Medicine', to: '/inventory', icon: PackagePlus },
  { label: 'View Reports', to: '/reports', icon: BarChart3 },
]

export default function Dashboard() {
  const maxRevenue = Math.max(...revenueChart.map((d) => d.value))

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Welcome back — here's what's happening at your clinic today."
      />

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {dashboardStats.map((s, i) => (
          <StatCard key={s.label} {...s} icon={statIcons[i]} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue chart placeholder */}
        <Card className="xl:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-gray-800">Revenue Overview</h3>
              <p className="text-xs text-gray-400 mt-0.5">Last 6 months</p>
            </div>
            <Link
              to="/reports"
              className="text-xs font-semibold text-primary-600 hover:underline flex items-center gap-1"
            >
              Full report <ArrowUpRight size={12} />
            </Link>
          </div>
          <div className="flex items-end gap-3 sm:gap-6 h-52">
            {revenueChart.map((d) => (
              <div key={d.month} className="flex-1 flex flex-col items-center justify-end h-full gap-2">
                <span className="text-[11px] font-semibold text-gray-500">
                  ₹{(d.value / 1000).toFixed(0)}k
                </span>
                <div
                  className="w-full max-w-[36px] rounded-t-lg bg-gradient-to-t from-primary-500 to-primary-300 transition-all"
                  style={{ height: `${(d.value / maxRevenue) * 100}%` }}
                />
                <span className="text-xs text-gray-400">{d.month}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick actions */}
        <Card>
          <h3 className="font-bold text-gray-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map(({ label, to, icon: Icon }) => (
              <Link
                key={label}
                to={to}
                className="flex flex-col items-center justify-center gap-2 rounded-xl border border-primary-100 bg-primary-50/50 hover:bg-primary-50 p-4 text-center transition"
              >
                <div className="w-10 h-10 rounded-xl bg-primary-500 text-white flex items-center justify-center">
                  <Icon size={18} />
                </div>
                <span className="text-xs font-semibold text-gray-700 leading-tight">{label}</span>
              </Link>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
        {/* Recent patients */}
        <Card className="xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">Recent Patients</h3>
            <Link to="/patients" className="text-xs font-semibold text-primary-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-1">
            {recentPatients.map((p) => (
              <Link
                to={`/patients/${p.id}`}
                key={p.id}
                className="flex items-center justify-between gap-3 py-2.5 px-2 rounded-xl hover:bg-primary-50/60 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold shrink-0">
                    {p.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{p.name}</p>
                    <p className="text-xs text-gray-400 truncate">{p.concern}</p>
                  </div>
                </div>
                <Badge>{p.status}</Badge>
              </Link>
            ))}
          </div>
        </Card>

        {/* Low stock medicines */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">Low Stock Alerts</h3>
            <Link to="/inventory" className="text-xs font-semibold text-primary-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {lowStockMedicines.map((m) => (
              <div key={m.id} className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">{m.name}</p>
                  <p className="text-xs text-gray-400">Expires {m.expiry}</p>
                </div>
                <Badge color="red">{m.stock} left</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
