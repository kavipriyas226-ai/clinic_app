export default function PageHeader({ title, subtitle, actions }) {
  return (
<<<<<<< HEAD
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 print:hidden">
=======
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
>>>>>>> 600209e07c32b1f3f515ecd74a8d9c1b3620a293
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  )
}
