import { NavLink } from 'react-router-dom'
import { LayoutGrid, PackagePlus, Stethoscope } from 'lucide-react'

const tabs = [
  { to: '/inventory', label: 'Dashboard', icon: LayoutGrid, end: true },
  { to: '/inventory/medicines', label: 'Medicines', icon: PackagePlus, end: false },
  { to: '/inventory/treatments', label: 'Treatments', icon: Stethoscope, end: false },
]

export default function InventoryTabs() {
  return (
    <div className="flex items-center gap-2 mb-6">
      {tabs.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold border transition ${
              isActive
                ? 'bg-primary-500 text-white border-primary-500 shadow-soft'
                : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'
            }`
          }
        >
          <Icon size={15} /> {label}
        </NavLink>
      ))}
    </div>
  )
}
