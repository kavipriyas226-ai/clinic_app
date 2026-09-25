import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

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

/** Renders a print-ready PDF: clinic name, report title, date range, applied filters,
 * generation timestamp, a paginated table (auto-repeating the header row on every page), an
 * optional totals block, and "Page X of Y" on every page. */
export function exportPdf({ filename, clinicName, title, dateRangeLabel, filtersLabel, columns, rows, totals, orientation }) {
  const doc = new jsPDF({
    orientation: orientation || (columns.length > 7 ? 'landscape' : 'portrait'),
    unit: 'pt',
    format: 'a4',
  })
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 40

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(46, 16, 101) // primary-900
  doc.text(clinicName || 'Devs Hair & Skin Clinic', margin, 42)

  doc.setFontSize(11)
  doc.setTextColor(76, 29, 149) // primary-700
  doc.text(title, margin, 60)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(100, 100, 100)
  let y = 76
  if (dateRangeLabel) {
    doc.text(`Date Range: ${dateRangeLabel}`, margin, y)
    y += 13
  }
  if (filtersLabel) {
    doc.text(`Filters: ${filtersLabel}`, margin, y)
    y += 13
  }
  doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, margin, y)
  y += 10

  autoTable(doc, {
    startY: y + 8,
    margin: { left: margin, right: margin },
    head: [columns.map((c) => c.header)],
    body: rowsToAoA(columns, rows),
    styles: { fontSize: 7.5, cellPadding: 4, overflow: 'linebreak' },
    headStyles: { fillColor: [76, 29, 149], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [243, 236, 255] },
    didDrawPage: () => {
      doc.setFontSize(8)
      doc.setTextColor(150, 150, 150)
      doc.text(clinicName || 'Devs Hair & Skin Clinic', margin, doc.internal.pageSize.getHeight() - 20)
    },
  })

  let finalY = doc.lastAutoTable.finalY + 16
  if (totals && totals.length > 0) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(46, 16, 101)
    totals.forEach(([label, value]) => {
      if (finalY > doc.internal.pageSize.getHeight() - 40) {
        doc.addPage()
        finalY = 40
      }
      doc.text(`${label}: ${value}`, margin, finalY)
      finalY += 14
    })
  }

  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, doc.internal.pageSize.getHeight() - 20, { align: 'right' })
  }

  doc.save(`${filename}.pdf`)
}
