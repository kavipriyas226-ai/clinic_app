import { useClinicProfile } from '../../context/ClinicProfileContext.jsx'

/** Screen-hidden, print-only header shown above a report's table when printed directly from
 * the browser (as opposed to the PDF export, which draws its own equivalent header) — so a
 * plain browser print still carries the clinic name, report title, date range, filters, and
 * a generation timestamp instead of just the bare table. */
export default function PrintHeader({ title, dateRangeLabel, filtersLabel }) {
  const { profile } = useClinicProfile()
  return (
    <div className="hidden print:block mb-4 pb-3 border-b-2 border-primary-700">
      <h1 className="text-lg font-bold text-primary-900">{profile?.name || 'Devs Hair & Skin Clinic'}</h1>
      <h2 className="text-base font-semibold text-primary-700 mt-0.5">{title}</h2>
      <div className="text-xs text-gray-500 mt-1.5 space-y-0.5">
        {dateRangeLabel && <p>Date Range: {dateRangeLabel}</p>}
        {filtersLabel && <p>Filters: {filtersLabel}</p>}
        <p>Generated: {new Date().toLocaleString('en-IN')}</p>
      </div>
    </div>
  )
}
