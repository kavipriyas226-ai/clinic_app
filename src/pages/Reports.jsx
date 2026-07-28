import { useState } from 'react'
import { Download, TrendingUp, Users, Pill } from 'lucide-react'
import Card from '../components/common/Card.jsx'
import PageHeader from '../components/common/PageHeader.jsx'
import Button from '../components/common/Button.jsx'
import { Select } from '../components/common/FormField.jsx'
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
            <Button icon={Download} variant="outline">Export</Button>
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
