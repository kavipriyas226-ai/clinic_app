const palettes = {
  purple: 'bg-primary-50 text-primary-700 border-primary-100',
  green: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  yellow: 'bg-amber-50 text-amber-700 border-amber-100',
  red: 'bg-rose-50 text-rose-700 border-rose-100',
  gray: 'bg-gray-100 text-gray-600 border-gray-200',
  blue: 'bg-sky-50 text-sky-700 border-sky-100',
}

const statusMap = {
  New: 'blue',
  Inactive: 'gray',
  Paid: 'green',
  Unpaid: 'red',
  'Low Stock': 'red',
  'In Stock': 'green',
  Pending: 'red',
  'Partially Paid': 'yellow',
  'Fully Paid': 'green',
}

export default function Badge({ children, color }) {
  const resolved = color || statusMap[children] || 'gray'
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${palettes[resolved]}`}
    >
      {children}
    </span>
  )
}
