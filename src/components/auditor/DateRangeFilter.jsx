import { useMemo, useState } from 'react'
import { FormField, Select, TextInput } from '../common/FormField.jsx'

export const RANGE_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'year', label: 'This Year' },
  { value: 'all', label: 'All Time' },
  { value: 'custom', label: 'Custom Date Range' },
]

// Formats using local date components, not toISOString() (which converts to UTC first and
// would shift the date backward for any timezone ahead of UTC, e.g. IST).
function toIso(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// Computes the [from, to] ISO date pair for a named range, anchored to today. "custom" and
// "all" return nulls — "all" means no filtering, "custom" means the caller's own picked dates
// apply instead.
function computeRange(rangeType) {
  const today = new Date()
  const to = toIso(today)
  switch (rangeType) {
    case 'today':
      return { from: to, to }
    case 'week': {
      const day = today.getDay() === 0 ? 7 : today.getDay() // Monday-start week
      const monday = new Date(today)
      monday.setDate(today.getDate() - (day - 1))
      return { from: toIso(monday), to }
    }
    case 'month': {
      const first = new Date(today.getFullYear(), today.getMonth(), 1)
      return { from: toIso(first), to }
    }
    case 'year': {
      const first = new Date(today.getFullYear(), 0, 1)
      return { from: toIso(first), to }
    }
    default:
      return { from: null, to: null }
  }
}

export function useDateRange(initialRangeType = 'month') {
  const [rangeType, setRangeType] = useState(initialRangeType)
  const [customFrom, setCustomFrom] = useState(toIso(new Date(new Date().getFullYear(), new Date().getMonth(), 1)))
  const [customTo, setCustomTo] = useState(toIso(new Date()))

  const { from, to } = useMemo(() => {
    if (rangeType === 'custom') return { from: customFrom, to: customTo }
    return computeRange(rangeType)
  }, [rangeType, customFrom, customTo])

  return { rangeType, setRangeType, customFrom, setCustomFrom, customTo, setCustomTo, from, to }
}

export default function DateRangeFilter({ rangeType, setRangeType, customFrom, setCustomFrom, customTo, setCustomTo, from, to }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end gap-3">
      <FormField label="Date Range" className="w-full sm:w-56">
        <Select value={rangeType} onChange={(e) => setRangeType(e.target.value)}>
          {RANGE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </Select>
      </FormField>
      {rangeType === 'custom' && (
        <>
          <FormField label="From" className="w-full sm:w-44">
            <TextInput type="date" value={customFrom} max={customTo} onChange={(e) => setCustomFrom(e.target.value)} />
          </FormField>
          <FormField label="To" className="w-full sm:w-44">
            <TextInput type="date" value={customTo} min={customFrom} onChange={(e) => setCustomTo(e.target.value)} />
          </FormField>
        </>
      )}
      {rangeType !== 'custom' && from && (
        <p className="text-xs text-gray-400 pb-2.5">{from} to {to}</p>
      )}
      {rangeType === 'all' && (
        <p className="text-xs text-gray-400 pb-2.5">No date filter applied</p>
      )}
    </div>
  )
}
