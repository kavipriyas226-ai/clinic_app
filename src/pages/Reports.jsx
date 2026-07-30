<<<<<<< HEAD
import { useEffect, useState } from 'react'
=======
import { useState } from 'react'
>>>>>>> 600209e07c32b1f3f515ecd74a8d9c1b3620a293
import { Download, TrendingUp, Users, Pill } from 'lucide-react'
import Card from '../components/common/Card.jsx'
import PageHeader from '../components/common/PageHeader.jsx'
import Button from '../components/common/Button.jsx'
import { Select } from '../components/common/FormField.jsx'
<<<<<<< HEAD
import { getRevenueReport, getPatientGrowthReport, getMedicineSalesReport } from '../api/reports.js'

function toCsvRow(cells) {
  return cells.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')
}

function exportReportsCsv(reportRevenueByMonth, reportPatientGrowth, reportMedicineSales) {
  const lines = []

  lines.push(toCsvRow(['Revenue Report']))
  lines.push(toCsvRow(['Month', 'Revenue']))
  reportRevenueByMonth.forEach((d) => lines.push(toCsvRow([d.month, d.value])))
  lines.push('')

  lines.push(toCsvRow(['Patient Growth']))
  lines.push(toCsvRow(['Month', 'New Patients', 'Returning Patients']))
  reportPatientGrowth.forEach((d) => lines.push(toCsvRow([d.month, d.new, d.returning])))
  lines.push('')

  lines.push(toCsvRow(['Medicine Sales']))
  lines.push(toCsvRow(['Medicine', 'Units Sold', 'Revenue']))
  reportMedicineSales.forEach((d) => lines.push(toCsvRow([d.name, d.units, d.revenue])))

  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `clinic-reports-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export default function Reports() {
  const [range, setRange] = useState('6m')
  const [loading, setLoading] = useState(true)
  const [reportRevenueByMonth, setReportRevenueByMonth] = useState([])
  const [reportPatientGrowth, setReportPatientGrowth] = useState([])
  const [reportMedicineSales, setReportMedicineSales] = useState([])

  useEffect(() => {
    Promise.all([getRevenueReport(), getPatientGrowthReport(), getMedicineSalesReport()])
      .then(([revenue, growth, sales]) => {
        setReportRevenueByMonth(revenue)
        setReportPatientGrowth(growth)
        setReportMedicineSales(sales)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <Card className="text-center py-12">
        <p className="text-gray-500">Loading reports…</p>
      </Card>
    )
  }

  const maxRevenue = Math.max(1, ...reportRevenueByMonth.map((d) => d.value))
  const maxPatients = Math.max(1, ...reportPatientGrowth.map((d) => d.new + d.returning))
  const maxSales = Math.max(1, ...reportMedicineSales.map((d) => d.revenue))
=======
import {
  reportRevenueByMonth,
  reportPatientGrowth,
  reportMedicineSales,
} from '../data/mockData.js'

export default function Reports() {
  const [range, setRange] = useState('6m')
  const maxRevenue = Math.max(...reportRevenueByMonth.map((d) => d.value))
  const maxPatients = Math.max(...reportPatientGrowth.map((d) => d.new + d.returning))
  const maxSales = Math.max(...reportMedicineSales.map((d) => d.revenue))
>>>>>>> 600209e07c32b1f3f515ecd74a8d9c1b3620a293

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="Revenue, patient growth, and medicine sales insights"
        actions={
          <>
            <Select value={range} onChange={(e) => setRange(e.target.value)} className="w-36">
              <option value="6m">Last 6 months</option>
              <option value="12m">Last 12 months</option>
              <option value="ytd">Year to date</option>
            </Select>
<<<<<<< HEAD
            <Button
              icon={Download}
              variant="outline"
              onClick={() => exportReportsCsv(reportRevenueByMonth, reportPatientGrowth, reportMedicineSales)}
            >
              Export
            </Button>
=======
            <Button icon={Download} variant="outline">Export</Button>
>>>>>>> 600209e07c32b1f3f515ecd74a8d9c1b3620a293
          </>
        }
      />

      {/* Revenue report */}
      <Card className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp size={18} className="text-primary-500" />
          <h3 className="font-bold text-gray-800">Revenue Report</h3>
        </div>
        <p className="text-xs text-gray-400 mb-6">Monthly revenue trend across all treatments and pharmacy sales</p>
        <div className="flex items-end gap-3 sm:gap-6 h-56">
          {reportRevenueByMonth.map((d) => (
            <div key={d.month} className="flex-1 flex flex-col items-center justify-end h-full gap-2">
              <span className="text-[11px] font-semibold text-gray-500">₹{(d.value / 1000).toFixed(0)}k</span>
              <div
                className="w-full max-w-[40px] rounded-t-lg bg-gradient-to-t from-primary-500 to-primary-300"
                style={{ height: `${(d.value / maxRevenue) * 100}%` }}
              />
              <span className="text-xs text-gray-400">{d.month}</span>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Patient growth */}
        <Card>
          <div className="flex items-center gap-2 mb-1">
            <Users size={18} className="text-primary-500" />
            <h3 className="font-bold text-gray-800">Patient Growth</h3>
          </div>
          <p className="text-xs text-gray-400 mb-6">New vs returning patients per month</p>
          <div className="flex items-end gap-2 sm:gap-4 h-48">
            {reportPatientGrowth.map((d) => (
              <div key={d.month} className="flex-1 flex flex-col items-center justify-end h-full gap-2">
                <div className="w-full max-w-[32px] rounded-t-lg overflow-hidden flex flex-col justify-end" style={{ height: `${((d.new + d.returning) / maxPatients) * 100}%` }}>
                  <div className="bg-primary-300" style={{ height: `${(d.returning / (d.new + d.returning)) * 100}%` }} />
                  <div className="bg-primary-500" style={{ height: `${(d.new / (d.new + d.returning)) * 100}%` }} />
                </div>
                <span className="text-xs text-gray-400">{d.month}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-primary-500" /> New</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-primary-300" /> Returning</span>
          </div>
        </Card>

        {/* Medicine sales */}
        <Card>
          <div className="flex items-center gap-2 mb-1">
            <Pill size={18} className="text-primary-500" />
            <h3 className="font-bold text-gray-800">Medicine Sales</h3>
          </div>
          <p className="text-xs text-gray-400 mb-6">Top-selling medicines by revenue</p>
          <div className="space-y-3">
<<<<<<< HEAD
            {reportMedicineSales.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-8">No medicine sales recorded yet.</p>
            )}
=======
>>>>>>> 600209e07c32b1f3f515ecd74a8d9c1b3620a293
            {reportMedicineSales.map((m) => (
              <div key={m.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700 font-medium truncate pr-2">{m.name}</span>
                  <span className="text-gray-500 shrink-0">{m.units} units · ₹{m.revenue.toLocaleString('en-IN')}</span>
                </div>
                <div className="h-2 rounded-full bg-primary-50 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary-500"
                    style={{ width: `${(m.revenue / maxSales) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
