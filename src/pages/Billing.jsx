import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Plus, Minus, Trash2, Printer, Receipt, AlertCircle, Save, CheckCircle2, FilePlus2, Pill } from 'lucide-react'
import Card from '../components/common/Card.jsx'
import PageHeader from '../components/common/PageHeader.jsx'
import Button from '../components/common/Button.jsx'
import Badge from '../components/common/Badge.jsx'
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
  const navigate = useNavigate()
  const incomingBillItems = location.state?.billItems
  const incomingPatientId = location.state?.patientId

  const [loading, setLoading] = useState(true)
  const [patients, setPatients] = useState([])
  const [treatmentOptions, setTreatmentOptions] = useState([])
  const [inventory, setInventory] = useState([])
  const [medicineOptions, setMedicineOptions] = useState([])
  const [clinicProfile, setClinicProfile] = useState(null)

  const [patientId, setPatientId] = useState(incomingPatientId || '')
  const [patientSearchQuery, setPatientSearchQuery] = useState('')
  const [patientSearchOpen, setPatientSearchOpen] = useState(false)
  const [lineItems, setLineItems] = useState([])
  const [discountEnabled, setDiscountEnabled] = useState(false)
  const [discount, setDiscount] = useState(0)
  const [gstEnabled, setGstEnabled] = useState(false)
  const [initialPaymentAmount, setInitialPaymentAmount] = useState(0)
  const [initialPaymentTouched, setInitialPaymentTouched] = useState(false)
  const [initialPaymentMethod, setInitialPaymentMethod] = useState('UPI')
  const [itemSearch, setItemSearch] = useState({ idx: null, query: '' })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
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

  const filteredPatients = useMemo(() => {
    // Empty query -> no results shown. The dropdown should never dump the
    // full patient list; matches only appear once the user starts typing.
    const q = patientSearchQuery.trim().toLowerCase()
    if (!q) return []
    return patients.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.phone || '').toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        (p.email || '').toLowerCase().includes(q)
    )
  }, [patients, patientSearchQuery])

  function openPatientSearch() {
    if (formLocked) return
    setPatientSearchQuery('')
    setPatientSearchOpen(true)
  }

  function closePatientSearch() {
    setPatientSearchOpen(false)
  }

  function selectPatient(p) {
    setPatientId(p.id)
    closePatientSearch()
  }

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

  useEffect(() => {
    if (!initialPaymentTouched) setInitialPaymentAmount(total)
  }, [total, initialPaymentTouched])

  const formLocked = !!savedInvoice

  // Payment details shown on the invoice. Before Save is clicked these are a live
  // preview computed from the form; once saved, they reflect the persisted invoice
  // so the displayed numbers always match what Payment History actually has.
  const draftAmountPaid = Number(initialPaymentAmount) || 0
  const draftBalance = Math.max(0, total - draftAmountPaid)
  const draftStatus = draftAmountPaid <= 0 ? 'Pending' : draftBalance <= 0 ? 'Fully Paid' : 'Partially Paid'
  const draftMethod = draftAmountPaid > 0 ? initialPaymentMethod : '—'

  const paymentDetails = formLocked
    ? {
        total: savedInvoice.total,
        amountPaid: savedInvoice.amountPaid,
        balance: savedInvoice.balance,
        status: savedInvoice.status,
        method: savedInvoice.method,
      }
    : { total, amountPaid: draftAmountPaid, balance: draftBalance, status: draftStatus, method: draftMethod }

  function validateForm() {
    if (!patientId || lineItems.length === 0) {
      setError('Select a patient and add at least one line item before continuing.')
      return false
    }
    if (initialPaymentAmount < 0 || initialPaymentAmount > total) {
      setError(`Amount received now cannot exceed the invoice total of ₹${total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}.`)
      return false
    }
    return true
  }

  function handlePrint() {
    setError('')
    if (!validateForm()) return
    setPrintedAt(new Date())
    window.print()
  }

  function handlePrescription() {
    const medicineItems = lineItems.filter((item) => item.type === 'Medicine')
    navigate('/pharmacy', {
      state: {
        patientId,
        medicines: medicineItems.map((item) => ({ id: item.id, name: item.name })),
      },
    })
  }

  async function handleSaveInvoice() {
    setError('')
    if (formLocked) return
    if (!validateForm()) return
    setSaving(true)
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
        initialPaymentAmount: Number(initialPaymentAmount) || 0,
        initialPaymentMethod,
      })
      setSavedInvoice(invoice)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save the invoice. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  function handleNewInvoice() {
    setSavedInvoice(null)
    setPrintedAt(null)
    setError('')
    setPatientId(patients[0]?.id || '')
    setLineItems(
      treatmentOptions.length > 0
        ? [{ id: treatmentOptions[0].id, type: 'Treatment', name: treatmentOptions[0].name, price: treatmentOptions[0].price, qty: 1, amount: treatmentOptions[0].price }]
        : []
    )
    setDiscountEnabled(false)
    setDiscount(0)
    setGstEnabled(false)
    setInitialPaymentTouched(false)
    setInitialPaymentMethod('UPI')
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
          formLocked && (
            <Button variant="secondary" icon={FilePlus2} onClick={handleNewInvoice}>
              New Invoice
            </Button>
          )
        }
      />

      {error && (
        <div className="flex items-center gap-2 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2 mb-4 print:hidden">
          <AlertCircle size={15} className="shrink-0" />
          {error}
        </div>
      )}

      {formLocked && (
        <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2 mb-4 print:hidden">
          <CheckCircle2 size={15} className="shrink-0" />
          Invoice {savedInvoice.id} saved — this payment has been added to Payment History. Start a new invoice to make further changes.
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6 print:block">
        <div className="lg:col-span-2 space-y-6 print:hidden">
          <Card>
            <h3 className="font-bold text-gray-800 mb-4">Patient</h3>
            <div className="relative">
              {patientSearchOpen ? (
                <>
                  <input
                    autoFocus
                    type="text"
                    value={patientSearchQuery}
                    onChange={(e) => setPatientSearchQuery(e.target.value)}
                    onBlur={closePatientSearch}
                    placeholder="Search by name, phone, or patient ID..."
                    className="w-full text-sm px-3 py-2 rounded-xl border border-primary-300 focus:ring-2 focus:ring-primary-100 outline-none"
                  />
                  <div className="absolute z-20 top-full left-0 right-0 mt-1 max-h-64 overflow-y-auto bg-white border border-gray-100 rounded-xl shadow-card">
                    {patientSearchQuery.trim() === '' ? (
                      <p className="px-3 py-2 text-sm text-gray-400">Start typing a name, phone, or patient ID…</p>
                    ) : filteredPatients.length === 0 ? (
                      <p className="px-3 py-2 text-sm text-gray-400">No patients found.</p>
                    ) : (
                      filteredPatients.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => selectPatient(p)}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-primary-50 flex items-center justify-between gap-2"
                        >
                          <span className="truncate">
                            <span className="font-medium text-gray-800">{p.name}</span>
                            <span className="text-gray-400"> — {p.id}</span>
                          </span>
                          {p.phone && <span className="text-gray-400 shrink-0 text-xs">{p.phone}</span>}
                        </button>
                      ))
                    )}
                  </div>
                </>
              ) : (
                <button
                  type="button"
                  onClick={openPatientSearch}
                  disabled={formLocked}
                  className="w-full text-left text-sm px-3 py-2 rounded-xl border border-gray-200 hover:border-primary-300 truncate transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {selectedPatient ? `${selectedPatient.name} — ${selectedPatient.id}` : 'Search and select a patient...'}
                </button>
              )}
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">Line Items</h3>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" icon={Plus} onClick={() => addItem('Treatment')} disabled={formLocked}>
                  Treatment
                </Button>
                <Button size="sm" variant="secondary" icon={Plus} onClick={() => addItem('Medicine')} disabled={formLocked}>
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
                          disabled={formLocked}
                          className="w-full text-left text-sm px-3 py-2 rounded-xl border border-gray-200 hover:border-primary-300 truncate transition disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {item.name}
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => updateQty(idx, Math.max(1, item.qty - 1))}
                        disabled={formLocked}
                        className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-primary-50 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold">{item.qty}</span>
                      <button
                        onClick={() => updateQty(idx, item.qty + 1)}
                        disabled={formLocked}
                        className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-primary-50 disabled:opacity-60 disabled:cursor-not-allowed"
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
                        disabled={formLocked}
                        onChange={(e) => updateItem(idx, { amount: e.target.value === '' ? '' : Number(e.target.value) })}
                        className="w-full pl-5 pr-2 py-1.5 text-sm font-semibold text-gray-700 text-right rounded-lg border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>
                    <button
                      onClick={() => removeItem(idx)}
                      disabled={formLocked}
                      className="p-1.5 rounded-lg text-gray-400 hover:bg-rose-100 hover:text-rose-600 shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
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

            <div className="mt-4 pt-4 border-t border-gray-100">
              <Button variant="secondary" icon={Pill} onClick={handlePrescription} disabled={!patientId}>
                Prescription
              </Button>
              <p className="text-xs text-gray-400 mt-2">
                Opens Pharmacy with this patient and any medicine line items ready to prescribe.
              </p>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">Discount</h3>
              <button
                type="button"
                onClick={() => setDiscountEnabled((v) => !v)}
                disabled={formLocked}
                className={`relative w-11 h-6 rounded-full transition-colors shrink-0 disabled:opacity-60 disabled:cursor-not-allowed ${
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
                disabled={!discountEnabled || formLocked}
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
                disabled={formLocked}
                className={`relative w-11 h-6 rounded-full transition-colors shrink-0 disabled:opacity-60 disabled:cursor-not-allowed ${
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

          <Card>
            <h3 className="font-bold text-gray-800 mb-1">Payment Details (This Visit)</h3>
            <p className="text-xs text-gray-400 mb-4">
              Defaults to the full invoice total. Lower it to start an installment plan — the remaining balance can be collected on later visits from the Payments module.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Amount Received Now">
                <TextInput
                  type="number"
                  min="0"
                  max={total}
                  disabled={formLocked}
                  value={initialPaymentAmount}
                  onChange={(e) => {
                    setInitialPaymentTouched(true)
                    setInitialPaymentAmount(e.target.value === '' ? '' : Number(e.target.value))
                  }}
                />
              </FormField>
              <FormField label="Payment Method">
                <Select value={initialPaymentMethod} onChange={(e) => setInitialPaymentMethod(e.target.value)} disabled={formLocked}>
                  <option>UPI</option>
                  <option>Card</option>
                  <option>Cash</option>
                </Select>
              </FormField>
            </div>
            {Number(initialPaymentAmount) < total && (
              <p className="text-xs text-amber-600 mt-2">
                Balance of ₹{(total - (Number(initialPaymentAmount) || 0)).toLocaleString('en-IN', { maximumFractionDigits: 0 })} will remain pending after this visit.
              </p>
            )}
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

          <div className="mt-4 pt-4 border-t border-gray-100">
            <h4 className="font-bold text-gray-800 text-sm mb-2">Payment Details</h4>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Total Treatment Amount</span>
                <span className="font-medium text-gray-800">₹{paymentDetails.total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Amount Paid</span>
                <span className="font-medium text-emerald-700">₹{paymentDetails.amountPaid.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Remaining Balance</span>
                <span className="font-medium text-rose-600">₹{paymentDetails.balance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span>Payment Status</span>
                <Badge>{paymentDetails.status}</Badge>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Payment Method</span>
                <span className="font-medium text-gray-800">{paymentDetails.method}</span>
              </div>
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

          {formLocked ? (
            <>
              <div className="flex items-center justify-center gap-1.5 text-emerald-700 text-sm font-semibold mt-5">
                <CheckCircle2 size={16} /> Invoice Saved
              </div>
              <Button className="w-full mt-3" icon={Printer} onClick={handlePrint}>
                Print Invoice
              </Button>
              <p className="text-xs text-gray-400 text-center mt-2">
                This payment has been added to Payment History.
              </p>
            </>
          ) : (
            <>
              <Button className="w-full mt-5" icon={Save} onClick={handleSaveInvoice} disabled={saving}>
                {saving ? 'Saving…' : 'Save Invoice'}
              </Button>
              <p className="text-xs text-gray-400 text-center mt-2">
                Save the invoice to add this payment to Payment History. Printing becomes available once it's saved.
              </p>
            </>
          )}
        </Card>

        {/* Dedicated printable invoice — screen-hidden, print-only. Sized for A5 paper. */}
        <div className="hidden print:block print:text-gray-900 text-[11px] leading-snug">
          <style>{`
            @page {
              size: A5 portrait;
              margin: 8mm;
            }
            @media print {
              html, body {
                width: 148mm;
                height: 210mm;
              }
            }
          `}</style>

          <div className="flex items-start justify-between gap-3 pb-2 border-b-2 border-gray-800">
            <div className="flex items-start gap-2 min-w-0">
              <img
                src={clinicProfile?.logoDataUrl || logo}
                alt={clinicProfile?.name || 'Clinic logo'}
                className="w-9 h-9 object-contain shrink-0"
              />
              <div className="min-w-0">
                <h1 className="text-sm font-bold leading-tight">{clinicProfile?.name}</h1>
                {clinicProfile?.tagline && (
                  <p className="text-[9px] text-gray-500 mt-0.5 leading-snug">{clinicProfile.tagline}</p>
                )}
                <p className="text-[9px] text-gray-600 mt-1 whitespace-pre-line leading-snug">
                  {clinicProfile?.address}
                </p>
                <p className="text-[9px] text-gray-600 mt-0.5 leading-snug">
                  {[clinicProfile?.phone, clinicProfile?.email].filter(Boolean).join('  ·  ')}
                </p>
                {clinicProfile?.gstin && (
                  <p className="text-[9px] text-gray-600 mt-0.5 leading-snug">GSTIN: {clinicProfile.gstin}</p>
                )}
              </div>
            </div>
            <div className="text-right shrink-0">
              <h2 className="text-xs font-bold uppercase tracking-wide">Invoice</h2>
              {savedInvoice?.id ? (
                <p className="text-[9px] text-gray-500 mt-0.5">Invoice No: <span className="font-semibold text-gray-700">{savedInvoice.id}</span></p>
              ) : (
                <p className="text-[9px] font-bold text-amber-600 mt-0.5 uppercase tracking-wide">Preview — Not Saved</p>
              )}
              <p className="text-[9px] text-gray-500 mt-0.5">
                Date: {(printedAt || new Date()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
              <p className="text-[9px] text-gray-500">
                Time: {(printedAt || new Date()).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          <div className="py-2">
            <p className="text-[8px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Billed To</p>
            <p className="text-[11px] font-semibold text-gray-800">{selectedPatient?.name}</p>
            <p className="text-[9px] text-gray-600">Patient ID: {selectedPatient?.id}</p>
            {selectedPatient?.phone && <p className="text-[9px] text-gray-600">{selectedPatient.phone}</p>}
          </div>

          <table className="w-full border-collapse table-fixed">
            <thead>
              <tr className="border-b-2 border-gray-800 text-left text-[8px] font-semibold text-gray-500 uppercase tracking-wide">
                <th className="py-1 pr-1 w-4">#</th>
                <th className="py-1 pr-1">Item</th>
                <th className="py-1 pr-1 text-right w-8">Qty</th>
                <th className="py-1 pr-1 text-right w-14">Price</th>
                <th className="py-1 pl-1 text-right w-16">Amount</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-200">
                  <td className="py-1 pr-1 text-gray-500 align-top">{idx + 1}</td>
                  <td className="py-1 pr-1 text-gray-800 align-top break-words">{item.name}</td>
                  <td className="py-1 pr-1 text-right text-gray-600 align-top">{item.qty}</td>
                  <td className="py-1 pr-1 text-right text-gray-600 align-top">₹{Number(item.price || 0).toLocaleString('en-IN')}</td>
                  <td className="py-1 pl-1 text-right font-medium text-gray-800 align-top">₹{(Number(item.amount) || 0).toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end mt-2">
            <div className="w-2/5 space-y-1">
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
              <div className="flex justify-between text-xs font-bold text-gray-900 pt-1 border-t-2 border-gray-800">
                <span>Total</span>
                <span>₹{total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t-2 border-gray-800">
            <h3 className="text-[8px] font-semibold uppercase tracking-wide text-gray-500 mb-1">Payment Details</h3>
            <table className="w-full border-collapse">
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="py-0.5 pr-1 text-gray-600">Total Treatment Amount</td>
                  <td className="py-0.5 pl-1 text-right font-semibold text-gray-800">₹{paymentDetails.total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-0.5 pr-1 text-gray-600">Amount Paid</td>
                  <td className="py-0.5 pl-1 text-right font-semibold text-gray-800">₹{paymentDetails.amountPaid.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-0.5 pr-1 text-gray-600">Remaining Balance</td>
                  <td className="py-0.5 pl-1 text-right font-semibold text-gray-800">₹{paymentDetails.balance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-0.5 pr-1 text-gray-600">Payment Status</td>
                  <td className="py-0.5 pl-1 text-right font-semibold text-gray-800">{paymentDetails.status}</td>
                </tr>
                <tr>
                  <td className="py-0.5 pr-1 text-gray-600">Payment Method</td>
                  <td className="py-0.5 pl-1 text-right font-semibold text-gray-800">{paymentDetails.method}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {patientPrescription && (
            <div className="mt-3 pt-2 border-t-2 border-gray-800">
              <h3 className="text-[8px] font-semibold uppercase tracking-wide text-gray-500 mb-1">
                Prescription — {patientPrescription.id}
              </h3>
              {patientPrescription.items.length > 0 ? (
                <table className="w-full border-collapse table-fixed">
                  <thead>
                    <tr className="border-b border-gray-300 text-left text-[8px] font-semibold text-gray-500 uppercase tracking-wide">
                      <th className="py-0.5 pr-1 w-[28%]">Medicine</th>
                      <th className="py-0.5 px-1 w-[24%]">Dosage</th>
                      <th className="py-0.5 px-1 w-[24%]">Frequency</th>
                      <th className="py-0.5 pl-1 w-[24%]">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patientPrescription.items.map((it, i) => (
                      <tr key={i} className="border-b border-gray-100">
                        <td className="py-0.5 pr-1 text-gray-800 break-words">{it.name}</td>
                        <td className="py-0.5 px-1 text-gray-600 break-words">{it.dosage}</td>
                        <td className="py-0.5 px-1 text-gray-600 break-words">{it.frequency}</td>
                        <td className="py-0.5 pl-1 text-gray-600 break-words">{it.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-[9px] text-gray-400">No medicines listed on this prescription.</p>
              )}
            </div>
          )}

          <div className="mt-4 pt-2 border-t border-gray-200 text-center text-[8px] text-gray-400">
            Thank you for visiting {clinicProfile?.name}. Wishing you good health.
          </div>
        </div>
      </div>
    </div>
  )
}
