import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Receipt,
  CreditCard,
  Boxes,
  Pill,
  BarChart3,
  Settings,
  ChevronsLeft,
  ChevronsRight,
  Sparkles,
  X,
} from 'lucide-react'
import logo from '../../assets/logo.png'
import { useClinicProfile } from '../../context/ClinicProfileContext.jsx'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/patients', label: 'Patients', icon: Users },
  { to: '/patients/register', label: 'Register Patient', icon: UserPlus },
  { to: '/billing', label: 'Billing', icon: Receipt },
  { to: '/payments', label: 'Payments', icon: CreditCard },
  { to: '/inventory', label: 'Inventory', icon: Boxes },
  { to: '/pharmacy', label: 'Pharmacy', icon: Pill },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar({ collapsed, onToggle, mobileOpen, onCloseMobile }) {
  const { profile } = useClinicProfile()
  const clinicShortName = profile?.name || 'Devs Hair & Skin'

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-gray-900/40 z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 h-screen z-50 lg:z-0 bg-white border-r border-primary-100/70 flex flex-col transition-all duration-200 print:hidden
          ${collapsed ? 'lg:w-[76px]' : 'lg:w-64'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
          w-64`}
      >
        <div className="flex items-center justify-between px-4 h-20 border-b border-primary-100/70 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <img
              src={profile?.logoDataUrl || logo}
              alt={clinicShortName}
              width={48}
              height={48}
              className="w-12 h-12 rounded-xl object-contain shrink-0"
            />
            {!collapsed && (
              <span className="font-extrabold text-gray-800 text-base leading-tight truncate">{clinicShortName}</span>
            )}
          </div>
          <button
            onClick={onCloseMobile}
            className="lg:hidden text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/patients'}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors group relative ${
                  isActive
                    ? 'bg-primary-500 text-white shadow-soft'
                    : 'text-gray-600 hover:bg-primary-50 hover:text-primary-700'
                }`
              }
              title={collapsed ? label : undefined}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-primary-100/70 hidden lg:block">
          <button
            onClick={onToggle}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-gray-400 hover:bg-primary-50 hover:text-primary-600 transition"
          >
            {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
          </button>
        </div>

        {!collapsed && (
          <div className="p-3 hidden lg:block">
            <div className="bg-primary-50 rounded-xl p-3 flex items-center gap-2">
              <Sparkles size={16} className="text-primary-500 shrink-0" />
              <p className="text-xs text-primary-700 font-medium leading-snug">
                Connected to Devs Clinic API
              </p>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
