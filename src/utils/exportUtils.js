import * as XLSX from 'xlsx'

// Shared by every Auditor report's Export bar. `columns` is [{ header, key }], `rows` is the
// full filtered (and sorted) dataset for the report — never just the current page, per the
// spec's "export must contain all records matching the selected filters" requirement.

function rowsToAoA(columns, rows) {
  return rows.map((row) => columns.map((c) => (row[c.key] ?? '')))
}

/** Writes an .xlsx or .csv file — both go through the same SheetJS sheet object, just with a
 * different `bookType`, so there's one code path for both spreadsheet formats. */
export function exportSpreadsheet({ filename, columns, rows, format = 'xlsx' }) {
  const aoa = [columns.map((c) => c.header), ...rowsToAoA(columns, rows)]
  const ws = XLSX.utils.aoa_to_sheet(aoa)
  ws['!cols'] = columns.map((c) => ({ wch: Math.max(10, c.header.length + 2) }))

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Report')
  XLSX.writeFile(wb, `${filename}.${format}`, { bookType: format })
}
