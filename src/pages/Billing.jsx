import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Plus, Minus, Trash2, Printer, Receipt, AlertCircle } from 'lucide-react'
import Card from '../components/common/Card.jsx'
import PageHeader from '../components/common/PageHeader.jsx'
import Button from '../components/common/Button.jsx'
import SearchInput from '../components/common/SearchInput.jsx'
import { FormField, Select, TextInput } from '../components/common/FormField.jsx'
import { getPatients } from '../api/patients.js'
import { getTreatmentOptions } from '../api/treatments.js'
import { getInventory } from '../api/inventory.js'
import { getClinicProfile } from '../api/clinicProfile.js'
import { createInvoice } from '../api/invoices.js'
import { getPrescriptionsByPatient } from '../api/prescriptions.js'
import logo from '../assets/logo.png'

const GST_RATE = 0.18

function buildLineItemsFromBill(billItems, inventory) {
  return billItems.map((b) => {
    const med = inventory.find((m) => m.id === b.id)
    const price = med ? med.price : 0
    return {
      uid: crypto.randomUUID(),
      id: b.id,
      type: 'Medicine',
      name: b.name,
      price,
      qty: b.qty,
      amount: price * b.qty,
    }
  })
}

export default function Billing() {
  const location = useLocation()
  const incomingBillItems = location.state?.billItems
  const incomingPatientId = location.state?.patientId

  const [loading, setLoading] = useState(true)
  const [patients, setPatients] = useState([])
  const [treatmentOptions, setTreatmentOptions] = useState([])
  const [inventory, setInventory] = useState([])
  const [medicineOptions, setMedicineOptions] = useState([])
  const [clinicProfile, setClinicProfile] = useState(null)

  const [patientId, setPatientId] = useState(incomingPatientId || '')
  const [patientQuery, setPatientQuery] = useState('')
  const [lineItems, setLineItems] = useState([])
  const [discountEnabled, setDiscountEnabled] = useState(false)
  const [discount, setDiscount] = useState(0)
  const [gstEnabled, setGstEnabled] = useState(false)
  const [itemSearch, setItemSearch] = useState({ idx: null, query: '' })
  const [error, setError] = useState('')
  const [printing, setPrinting] = useState(false)
  const [patientPrescription, setPatientPrescription] = useState(null)
  const [savedInvoice, setSavedInvoice] = useState(null)
  const [printedAt, setPrintedAt] = useState(null)

  useEffect(() => {
    Promise.all([getPatients(), getTreatmentOptions(), getInventory(), getClinicProfile()])
      .then(([p, t, inv, profile]) => {
        setPatients(p)
        setTreatmentOptions(t)
        setInventory(inv)
        setMedicineOptions(inv.map(({ id, name, price }) => ({ id, name, price })))
        setClinicProfile(profile)

        if (incomingBillItems && incomingBillItems.length > 0) {
          setLineItems(buildLineItemsFromBill(incomingBillItems, inv))
        } else if (t.length > 0) {
          setLineItems([{ id: t[0].id, type: 'Treatment', name: t[0].name, price: t[0].price, qty: 1, amount: t[0].price }])
        }

        if (!incomingPatientId && p.length > 0) {
          setPatientId(p[0].id)
        }
      })
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!patientId) {
      setPatientPrescription(null)
      return
    }
    getPrescriptionsByPatient(patientId)
      .then((list) => setPatientPrescription(list.length > 0 ? list[0] : null))
      .catch(() => setPatientPrescription(null))
  }, [patientId])

  const selectedPatient = patients.find((p) => p.id === patientId)

  const filteredPatients = useMemo(
    () => patients.filter((p) => p.name.toLowerCase().includes(patientQuery.toLowerCase())),
    [patients, patientQuery]
  )

  function addItem(kind) {
    const options = kind === 'Treatment' ? treatmentOptions : medicineOptions
    const first = options[0]
    if (!first) return
    setLineItems((prev) => [
      ...prev,
      { uid: crypto.randomUUID(), id: first.id, type: kind, name: first.name, price: first.price, qty: 1, amount: first.price },
    ])
  }

  function updateItem(idx, patch) {
    setLineItems((prev) => prev.map((item, i) => (i === idx ? { ...item, ...patch } : item)))
  }

  function updateQty(idx, qty) {
    setLineItems((prev) => prev.map((item, i) => (i === idx ? { ...item, qty, amount: item.price * qty } : item)))
  }

  function removeItem(idx) {
    setLineItems((prev) => prev.filter((_, i) => i !== idx))
  }

  function openItemSearch(idx) {
    setItemSearch({ idx, query: '' })
  }

  function closeItemSearch() {
    setItemSearch({ idx: null, query: '' })
  }

  function selectSearchedItem(idx, option) {
    updateItem(idx, { id: option.id, name: option.name, price: option.price, amount: option.price * lineItems[idx].qty })
    closeItemSearch()
  }

  const subtotal = useMemo(
    () => lineItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0),
    [lineItems]
  )
  const discountAmount = discountEnabled ? (subtotal * discount) / 100 : 0
  const taxable = subtotal - discountAmount
  const gstAmount = gstEnabled ? taxable * GST_RATE : 0
  const total = taxable + gstAmount

  async function handlePrintInvoice() {
    setError('')
    if (!patientId || lineItems.length === 0) {
      setError('Select a patient and add at least one line item before printing.')
      return
    }
    setPrinting(true)
    try {
      const invoice = await createInvoice({
        patientId,
        lineItems: lineItems.map((item) => ({
          refId: item.id,
          type: item.type,
          name: item.name,
          price: item.price,
          qty: item.qty,
          amount: Number(item.amount) || 0,
        })),
        discountEnabled,
        discountPercent: discount,
        gstEnabled,
      })
      setSavedInvoice(invoice)
      setPrintedAt(new Date())
      window.print()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save the invoice. Please try again.')
    } finally {
      setPrinting(false)
    }
  }

  if (loading) {
    return (
      <Card className="text-center py-12">
        <p className="text-gray-500">Loading billing data…</p>
      </Card>
    )
  }

  return (
    <div>
      <PageHeader
        title="Billing"
        subtitle="Create an invoice for treatments and medicines"
        actions={
          <Button icon={Printer} onClick={handlePrintInvoice} disabled={printing}>
            {printing ? 'Saving…' : 'Print Invoice'}
          </Button>
        }
      />

      {error && (
        <div className="flex items-center gap-2 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2 mb-4 print:hidden">
          <AlertCircle size={15} className="shrink-0" />
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6 print:block">
        <div className="lg:col-span-2 space-y-6 print:hidden">
          <Card>
            <h3 className="font-bold text-gray-800 mb-4">Patient</h3>
            <SearchInput
              value={patientQuery}
              onChange={setPatientQuery}
              placeholder="Search patients by name..."
              className="mb-3"
            />
            <FormField label="Select Patient">
              <Select value={patientId} onChange={(e) => setPatientId(e.target.value)}>
                {filteredPatients.length === 0 && <option value="">No patients found</option>}
                {filteredPatients.map((p) => (
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
                    <div className="relative flex-1 min-w-0">
                      {itemSearch.idx === idx ? (
                        <>
                          <input
                            autoFocus
                            type="text"
                            value={itemSearch.query}
                            onChange={(e) => setItemSearch({ idx, query: e.target.value })}
                            onBlur={closeItemSearch}
                            placeholder={`Search ${item.type.toLowerCase()}s...`}
                            className="w-full text-sm px-3 py-2 rounded-xl border border-primary-300 focus:ring-2 focus:ring-primary-100 outline-none"
                          />
                          <div className="absolute z-20 top-full left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-white border border-gray-100 rounded-xl shadow-card">
                            {options.filter((o) => o.name.toLowerCase().includes(itemSearch.query.toLowerCase())).length === 0 && (
                              <p className="px-3 py-2 text-sm text-gray-400">No {item.type.toLowerCase()}s found.</p>
                            )}
                            {options
                              .filter((o) => o.name.toLowerCase().includes(itemSearch.query.toLowerCase()))
                              .map((o) => (
                                <button
                                  key={o.id}
                                  type="button"
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={() => selectSearchedItem(idx, o)}
                                  className="w-full text-left px-3 py-2 text-sm hover:bg-primary-50 flex items-center justify-between gap-2"
                                >
                                  <span className="truncate">{o.name}</span>
                                  <span className="text-gray-400 shrink-0">₹{o.price.toLocaleString('en-IN')}</span>
                                </button>
                              ))}
                          </div>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openItemSearch(idx)}
                          className="w-full text-left text-sm px-3 py-2 rounded-xl border border-gray-200 hover:border-primary-300 truncate transition"
                        >
                          {item.name}
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => updateQty(idx, Math.max(1, item.qty - 1))}
                        className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-primary-50"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold">{item.qty}</span>
                      <button
                        onClick={() => updateQty(idx, item.qty + 1)}
                        className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-primary-50"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                    <div className="relative w-28 shrink-0">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">₹</span>
                      <input
                        type="number"
                        min="0"
                        value={item.amount}
                        onChange={(e) => updateItem(idx, { amount: e.target.value === '' ? '' : Number(e.target.value) })}
                        className="w-full pl-5 pr-2 py-1.5 text-sm font-semibold text-gray-700 text-right rounded-lg border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition"
                      />
                    </div>
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
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">Discount</h3>
              <button
                type="button"
                onClick={() => setDiscountEnabled((v) => !v)}
                className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
                  discountEnabled ? 'bg-primary-500' : 'bg-gray-200'
                }`}
                aria-pressed={discountEnabled}
                aria-label="Enable discount"
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    discountEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            <FormField
              label="Discount (%)"
              hint={discountEnabled ? 'Applied to subtotal before GST' : 'Enable the toggle above to apply a discount'}
            >
              <TextInput
                type="number"
                min="0"
                max="100"
                disabled={!discountEnabled}
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                className={!discountEnabled ? 'opacity-50 cursor-not-allowed' : ''}
              />
            </FormField>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-800">GST</h3>
                <p className="text-xs text-gray-400 mt-1">
                  {gstEnabled ? 'GST (18%) is applied to the taxable amount' : 'Enable the toggle to apply GST'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setGstEnabled((v) => !v)}
                className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
                  gstEnabled ? 'bg-primary-500' : 'bg-gray-200'
                }`}
                aria-pressed={gstEnabled}
                aria-label="Enable GST"
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    gstEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </Card>
        </div>

        {/* Invoice summary — on-screen builder preview only, not printed */}
        <Card className="h-fit print:hidden">
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
                <span className="shrink-0">₹{(Number(item.amount) || 0).toLocaleString('en-IN')}</span>
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
              <span>GST {gstEnabled ? '(18%)' : '(disabled)'}</span>
              <span>+ ₹{gstAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-gray-800 pt-2 border-t border-gray-100">
              <span>Total</span>
              <span>₹{total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
            </div>
          </div>

          {patientPrescription && (
            <div className="mt-5 pt-4 border-t border-gray-100">
              <h4 className="font-bold text-gray-800 text-sm mb-2">Prescription {patientPrescription.id}</h4>
              <div className="space-y-1.5 text-sm">
                {patientPrescription.items.map((it, i) => (
                  <div key={i} className="flex justify-between gap-2 text-gray-600">
                    <span className="truncate">{it.name}</span>
                    <span className="text-xs text-gray-500 text-right shrink-0">
                      {[it.dosage, it.frequency, it.duration].filter(Boolean).join(' · ')}
                    </span>
                  </div>
                ))}
                {patientPrescription.items.length === 0 && (
                  <p className="text-xs text-gray-400">No medicines listed on this prescription.</p>
                )}
              </div>
            </div>
          )}

          <Button className="w-full mt-5" icon={Printer} onClick={handlePrintInvoice} disabled={printing}>
            {printing ? 'Saving…' : 'Print Invoice'}
          </Button>
        </Card>

        {/* Dedicated printable invoice — screen-hidden, print-only */}
        <div className="hidden print:block print:text-gray-900">
          <div className="flex items-start justify-between gap-6 pb-4 border-b-2 border-gray-800">
            <div className="flex items-start gap-3 min-w-0">
              <img
                src={clinicProfile?.logoDataUrl || logo}
                alt={clinicProfile?.name || 'Clinic logo'}
                className="w-14 h-14 object-contain shrink-0"
              />
              <div className="min-w-0">
                <h1 className="text-xl font-bold leading-tight">{clinicProfile?.name}</h1>
                {clinicProfile?.tagline && (
                  <p className="text-xs text-gray-500 mt-0.5">{clinicProfile.tagline}</p>
                )}
                <p className="text-xs text-gray-600 mt-1.5 whitespace-pre-line leading-relaxed">
                  {clinicProfile?.address}
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  {[clinicProfile?.phone, clinicProfile?.email].filter(Boolean).join('  ·  ')}
                </p>
                {clinicProfile?.gstin && (
                  <p className="text-xs text-gray-600 mt-0.5">GSTIN: {clinicProfile.gstin}</p>
                )}
              </div>
            </div>
            <div className="text-right shrink-0">
              <h2 className="text-lg font-bold uppercase tracking-wide">Invoice</h2>
              {savedInvoice?.id && (
                <p className="text-xs text-gray-500 mt-1">Invoice No: <span className="font-semibold text-gray-700">{savedInvoice.id}</span></p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Date: {(printedAt || new Date()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
              <p className="text-xs text-gray-500">
                Time: {(printedAt || new Date()).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          <div className="py-4">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Billed To</p>
            <p className="text-sm font-semibold text-gray-800">{selectedPatient?.name}</p>
            <p className="text-xs text-gray-600">Patient ID: {selectedPatient?.id}</p>
            {selectedPatient?.phone && <p className="text-xs text-gray-600">{selectedPatient.phone}</p>}
          </div>

          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-800 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                <th className="py-2 pr-2 w-8">#</th>
                <th className="py-2 pr-2">Item</th>
                <th className="py-2 pr-2 text-left">Type</th>
                <th className="py-2 pr-2 text-right w-16">Qty</th>
                <th className="py-2 pr-2 text-right w-24">Price</th>
                <th className="py-2 pl-2 text-right w-28">Amount</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-200">
                  <td className="py-2 pr-2 text-gray-500">{idx + 1}</td>
                  <td className="py-2 pr-2 text-gray-800">{item.name}</td>
                  <td className="py-2 pr-2 text-gray-500">{item.type}</td>
                  <td className="py-2 pr-2 text-right text-gray-600">{item.qty}</td>
                  <td className="py-2 pr-2 text-right text-gray-600">₹{Number(item.price || 0).toLocaleString('en-IN')}</td>
                  <td className="py-2 pl-2 text-right font-medium text-gray-800">₹{(Number(item.amount) || 0).toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end mt-4">
            <div className="w-64 space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Discount ({discount}%)</span>
                <span>- ₹{discountAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>GST {gstEnabled ? '(18%)' : '(disabled)'}</span>
                <span>+ ₹{gstAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t-2 border-gray-800">
                <span>Total</span>
                <span>₹{total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
            </div>
          </div>

          {patientPrescription && (
            <div className="mt-6 pt-4 border-t-2 border-gray-800">
              <h3 className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-2">
                Prescription — {patientPrescription.id}
              </h3>
              {patientPrescription.items.length > 0 ? (
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-gray-300 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                      <th className="py-1.5 pr-2">Medicine</th>
                      <th className="py-1.5 px-2">Dosage</th>
                      <th className="py-1.5 px-2">Frequency</th>
                      <th className="py-1.5 pl-2">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patientPrescription.items.map((it, i) => (
                      <tr key={i} className="border-b border-gray-100">
                        <td className="py-1.5 pr-2 text-gray-800">{it.name}</td>
                        <td className="py-1.5 px-2 text-gray-600">{it.dosage}</td>
                        <td className="py-1.5 px-2 text-gray-600">{it.frequency}</td>
                        <td className="py-1.5 pl-2 text-gray-600">{it.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-xs text-gray-400">No medicines listed on this prescription.</p>
              )}
            </div>
          )}

          <div className="mt-10 pt-4 border-t border-gray-200 text-center text-[11px] text-gray-400">
            Thank you for visiting {clinicProfile?.name}. Wishing you good health.
          </div>
        </div>
      </div>
    </div>
  )
}
