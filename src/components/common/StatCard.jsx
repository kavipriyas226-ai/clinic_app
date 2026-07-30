<<<<<<< HEAD
import { Link } from 'react-router-dom'
import { TrendingUp, TrendingDown } from 'lucide-react'
import Card from './Card.jsx'

export default function StatCard({ label, value, change, trend, icon: Icon, to }) {
  const isUp = trend === 'up'
  const content = (
    <Card
      className={`flex items-center justify-between gap-4 h-full ${
        to ? 'hover:shadow-card hover:border-primary-200 transition cursor-pointer' : ''
      }`}
    >
=======
import { TrendingUp, TrendingDown } from 'lucide-react'
import Card from './Card.jsx'

export default function StatCard({ label, value, change, trend, icon: Icon }) {
  const isUp = trend === 'up'
  return (
    <Card className="flex items-center justify-between gap-4">
>>>>>>> 600209e07c32b1f3f515ecd74a8d9c1b3620a293
      <div className="min-w-0">
        <p className="text-sm text-gray-500 font-medium truncate">{label}</p>
        <p className="text-2xl font-bold text-gray-800 mt-1 truncate">{value}</p>
        {change && (
          <div
            className={`flex items-center gap-1 mt-2 text-xs font-semibold ${
              isUp ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{change}</span>
            <span className="text-gray-400 font-normal">vs last month</span>
          </div>
        )}
      </div>
      {Icon && (
        <div className="shrink-0 w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
          <Icon size={22} />
        </div>
      )}
    </Card>
  )
<<<<<<< HEAD

  return to ? <Link to={to} className="block">{content}</Link> : content
=======
>>>>>>> 600209e07c32b1f3f515ecd74a8d9c1b3620a293
}
