import { FileSpreadsheet, FileText } from 'lucide-react'
import Button from '../common/Button.jsx'
import { exportSpreadsheet } from '../../utils/exportUtils.js'

/**
 * Excel/CSV actions for one exportable report table. `rows` must be the full filtered (and
 * sorted) dataset — not just the current page — since every format is required to contain
 * every record matching the applied filters, not only what's visible on screen.
 */
export default function ExportBar({ filenameBase, columns, rows }) {
  function handleExcel() {
    exportSpreadsheet({ filename: filenameBase, columns, rows, format: 'xlsx' })
  }

  function handleCsv() {
    exportSpreadsheet({ filename: filenameBase, columns, rows, format: 'csv' })
  }

  return (
    <div className="flex flex-wrap gap-2 print:hidden">
      <Button variant="outline" size="sm" icon={FileSpreadsheet} onClick={handleExcel}>Excel</Button>
      <Button variant="outline" size="sm" icon={FileText} onClick={handleCsv}>CSV</Button>
    </div>
  )
}
