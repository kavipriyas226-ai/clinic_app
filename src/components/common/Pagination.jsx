import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ page, totalPages, onChange, totalItems, pageSize }) {
  if (totalPages <= 0) return null
  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, totalItems)

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 mt-2 border-t border-gray-100">
      <p className="text-xs text-gray-500">
        Showing <span className="font-semibold text-gray-700">{start}-{end}</span> of{' '}
        <span className="font-semibold text-gray-700">{totalItems}</span>
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-primary-50 hover:text-primary-600 disabled:opacity-40 disabled:hover:bg-transparent transition"
        >
          <ChevronLeft size={16} />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`w-8 h-8 text-xs font-semibold rounded-lg transition ${
              p === page
                ? 'bg-primary-500 text-white'
                : 'text-gray-500 hover:bg-primary-50 hover:text-primary-600'
            }`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-primary-50 hover:text-primary-600 disabled:opacity-40 disabled:hover:bg-transparent transition"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
