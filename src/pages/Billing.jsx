import { useMemo, useState } from 'react'
import { Plus, Minus, Trash2, Printer, Receipt } from 'lucide-react'
import Card from '../components/common/Card.jsx'
import PageHeader from '../components/common/PageHeader.jsx'
import Button from '../components/common/Button.jsx'
import { FormField, Select, TextInput } from '../components/common/FormField.jsx'
import { patients, treatmentOptions, medicineOptions, clinicProfile } from '../data/mockData.js'

const GST_RATE = 0.18

export default function Billing() {
  const [patientId, setPatientId] = useState(patients[0].id)
  const [lineItems, setLineItems] = useState([
    { id: treatmentOptions[0].id, type: 'Treatment', name: treatmentOptions[0].name, price: treatmentOptions[0].price, qty: 1 },
  ])
  const [discount, setDiscount] = useState(0)

  const selectedPatient = patients.find((p) => p.id === patientId)

  function addItem(kind) {
    const options = kind === 'Treatment' ? treatmentOptions : medicineOptions
    const first = options[0]
    setLineItems((prev) => [
      ...prev,
      { uid: crypto.randomUUID(), id: first.id, type: kind, name: first.name, price: first.price, qty: 1 },
    ])
  }

  function updateItem(idx, patch) {
    setLineItems((prev) => prev.map((item, i) => (i === idx ? { ...item, ...patch } : item)))
  }

  function removeItem(idx) {
    setLineItems((prev) => prev.filter((_, i) => i !== idx))
  }

  function handleItemSelect(idx, kind, itemId) {
    const options = kind === 'Treatment' ? treatmentOptions : medicineOptions
    const found = options.find((o) => o.id === itemId)
    updateItem(idx, { id: found.id, name: found.name, price: found.price })
  }

  const subtotal = useMemo(
    () => lineItems.reduce((sum, item) => sum + item.price * item.qty, 0),
    [lineItems]
  )
  const discountAmount = (subtotal * discount) / 100
  const taxable = subtotal - discountAmount
  const gstAmount = taxable * GST_RATE
  const total = taxable + gstAmount

  return (
    <div>
      <PageHeader
        title="Billing"
        subtitle="Create an invoice for treatments and medicines"
        actions={
          <Button icon={Printer} onClick={() => window.print()}>
            Print Invoice
          </Button>
        }
      />

      <div className="grid lg:grid-cols-3 gap-6 print:block">
        <div className="lg:col-span-2 space-y-6 print:hidden">
          <Card>
            <h3 className="font-bold text-gray-800 mb-4">Patient</h3>
            <FormField label="Select Patient">
              <Select value={patientId} onChange={(e) => setPatientId(e.target.value)}>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} — {p.id}</option>
                ))}
              </Select>
            </FormField>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">Line Items</h3>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" icon={Plus} onClick={() => addItem('Treatment')}>
                  Treatment
                </Button>
                <Button size="sm" variant="secondary" icon={Plus} onClick={() => addItem('Medicine')}>
                  Medicine
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {lineItems.map((item, idx) => {
                const options = item.type === 'Treatment' ? treatmentOptions : medicineOptions
                return (
                  <div key={item.uid || item.id + idx} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-xl border border-gray-100">
                    <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-primary-50 text-primary-700 w-fit shrink-0">
                      {item.type}
                    </span>
                    <select
                      value={item.id}
                      onChange={(e) => handleItemSelect(idx, item.type, e.target.value)}
                      className="flex-1 text-sm px-3 py-2 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none"
                    >
                      {options.map((o) => (
                        <option key={o.id} value={o.id}>{o.name}</option>
                      ))}
                    </select>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => updateItem(idx, { qty: Math.max(1, item.qty - 1) })}
                        className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-primary-50"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold">{item.qty}</span>
                      <button
                        onClick={() => updateItem(idx, { qty: item.qty + 1 })}
                        className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-primary-50"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                    <span className="text-sm font-semibold text-gray-700 w-24 text-right shrink-0">
                      ₹{(item.price * item.qty).toLocaleString('en-IN')}
                    </span>
                    <button
                      onClick={() => removeItem(idx)}
                      className="p-1.5 rounded-lg text-gray-400 hover:bg-rose-100 hover:text-rose-600 shrink-0"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                )
              })}
              {lineItems.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-8">No items added yet.</p>
              )}
            </div>
          </Card>

          <Card>
            <h3 className="font-bold text-gray-800 mb-4">Discount</h3>
            <FormField label="Discount (%)" hint="Applied to subtotal before GST">
              <TextInput
                type="number"
                min="0"
                max="100"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value) || 0)}
              />
            </FormField>
          </Card>
        </div>

        {/* Invoice summary / printable */}
        <Card className="h-fit print:shadow-none print:border-0">
          <div className="hidden print:block mb-4">
            <h2 className="font-bold text-lg">{clinicProfile.name}</h2>
            <p className="text-xs text-gray-500">{clinicProfile.address}</p>
            <p className="text-xs text-gray-500">GSTIN: {clinicProfile.gstin}</p>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <Receipt size={18} className="text-primary-500" />
            <h3 className="font-bold text-gray-800">Invoice Summary</h3>
          </div>

          <div className="text-sm text-gray-600 mb-4 pb-4 border-b border-gray-100">
            <p><span className="text-gray-400">Patient:</span> <span className="font-medium text-gray-800">{selectedPatient?.name}</span></p>
            <p><span className="text-gray-400">Patient ID:</span> {selectedPatient?.id}</p>
            <p><span className="text-gray-400">Date:</span> {new Date().toLocaleDateString('en-IN')}</p>
          </div>

          <div className="space-y-2 text-sm mb-4 pb-4 border-b border-gray-100">
            {lineItems.map((item, idx) => (
              <div key={idx} className="flex justify-between text-gray-600">
                <span className="truncate pr-2">{item.name} x{item.qty}</span>
                <span className="shrink-0">₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Discount ({discount}%)</span>
              <span>- ₹{discountAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>GST (18%)</span>
              <span>+ ₹{gstAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-gray-800 pt-2 border-t border-gray-100">
              <span>Total</span>
              <span>₹{total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
            </div>
          </div>

          <Button className="w-full mt-5 print:hidden" icon={Printer} onClick={() => window.print()}>
            Print Invoice
          </Button>
        </Card>
      </div>
    </div>
  )
}
