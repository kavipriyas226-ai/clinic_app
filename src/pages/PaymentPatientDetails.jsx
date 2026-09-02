import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Phone,
  Mail,
  Stethoscope,
  Receipt,
  CalendarDays,
  Wallet,
  PlusCircle,
  Pencil,
  Trash2,
  Printer,
  Download,
  AlertCircle,
  CreditCard,
  Banknote,
  Smartphone,
} from 'lucide-react'
import Card from '../components/common/Card.jsx'
import Badge from '../components/common/Badge.jsx'
import Button from '../components/common/Button.jsx'
import Modal from '../components/common/Modal.jsx'
import { FormField, Select, TextInput } from '../components/common/FormField.jsx'
import { getPatient } from '../api/patients.js'
import { getInvoicesByPatient, addPayment, updatePayment, deletePayment } from '../api/invoices.js'
import { useClinicProfile } from '../context/ClinicProfileContext.jsx'
import logo from '../assets/logo.png'

const methodIcon = { UPI: Smartphone, Card: CreditCard, Cash: Banknote, '—': Banknote }
const today = () => new Date().toISOString().slice(0, 10)

function toCsvRow(cells) {
  return cells.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')
}

export default function PaymentPatientDetails() {
  const { patientId } = useParams()
  const navigate = useNavigate()
  const { profile: clinicProfile } = useClinicProfile()

  const [patient, setPatient] = useState(null)
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [installmentTarget, setInstallmentTarget] = useState(null)
  const [installmentForm, setInstallmentForm] = useState({ amount: 0, method: 'UPI', date: today(), note: '' })
  const [editPaymentTarget, setEditPaymentTarget] = useState(null)
  const [editPaymentForm, setEditPaymentForm] = useState({ amount: 0, method: 'UPI', date: today(), note: '' })
  const [deletePaymentTarget, setDeletePaymentTarget] = useState(null)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [receiptTarget, setReceiptTarget] = useState(null)
  const [printedAt, setPrintedAt] = useState(null)

  useEffect(() => {
    Promise.all([getPatient(patientId), getInvoicesByPatient(patientId)])
      .then(([p, inv]) => {
        setPatient(p)
        setInvoices(inv)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [patientId])

  function refreshInvoice(updated) {
    setInvoices((prev) => prev.map((inv) => (inv.id === updated.id ? updated : inv)))
  }

  const summary = useMemo(() => {
    const treatmentNames = new Set()
    let visitCount = 0
    const visitDates = []
    let totalCost = 0
    let totalPaid = 0
    let totalBalance = 0

    invoices.forEach((inv) => {
      inv.lineItems?.forEach((li) => treatmentNames.add(li.name))
      totalCost += inv.total
      totalPaid += inv.amountPaid
      totalBalance += inv.balance
      inv.payments?.forEach((p) => {
        visitCount += 1
        visitDates.push(p.date)
      })
    })

    visitDates.sort()
    const status = totalBalance <= 0 && totalPaid > 0 ? 'Fully Paid' : totalPaid > 0 ? 'Partially Paid' : 'Pending'

    return {
      treatmentNames: Array.from(treatmentNames),
      visitCount,
      visitDates,
      totalCost,
      totalPaid,
      totalBalance,
      status,
    }
  }, [invoices])

  function openInstallment(inv) {
    setFormError('')
    setInstallmentForm({ amount: inv.balance, method: 'UPI', date: today(), note: '' })
    setInstallmentTarget(inv)
  }

  async function submitInstallment(e) {
    e.preventDefault()
    setFormError('')
    if (!installmentForm.amount || installmentForm.amount <= 0) {
      setFormError('Enter an amount greater than 0.')
      return
    }
    if (installmentForm.amount > installmentTarget.balance) {
      setFormError(`Amount cannot exceed the remaining balance of ₹${installmentTarget.balance.toLocaleString('en-IN')}.`)
      return
    }
    setSaving(true)
    try {
      const updated = await addPayment(installmentTarget.id, installmentForm)
      refreshInvoice(updated)
      setInstallmentTarget(null)
    } catch (err) {
      setFormError(err.response?.data?.message || 'Could not record the payment.')
    } finally {
      setSaving(false)
    }
  }

  function openEditPayment(inv, payment) {
    setFormError('')
    setEditPaymentForm({ amount: payment.amount, method: payment.method, date: payment.date, note: payment.note || '' })
    setEditPaymentTarget({ invoice: inv, payment })
  }

  async function submitEditPayment(e) {
    e.preventDefault()
    setFormError('')
    if (!editPaymentForm.amount || editPaymentForm.amount <= 0) {
      setFormError('Enter an amount greater than 0.')
      return
    }
    setSaving(true)
    try {
      const updated = await updatePayment(editPaymentTarget.invoice.id, editPaymentTarget.payment.id, editPaymentForm)
      refreshInvoice(updated)
      setEditPaymentTarget(null)
    } catch (err) {
      setFormError(err.response?.data?.message || 'Could not update the payment.')
    } finally {
      setSaving(false)
    }
  }

  async function confirmDeletePayment() {
    const { invoice, payment } = deletePaymentTarget
    const updated = await deletePayment(invoice.id, payment.id)
    refreshInvoice(updated)
    setDeletePaymentTarget(null)
  }

  function handleGenerateReceipt(inv) {
    setReceiptTarget(inv)
    setPrintedAt(new Date())
    setTimeout(() => window.print(), 50)
  }

  function handleExport() {
    const lines = []
    lines.push(toCsvRow(['Patient', patient.name]))
    lines.push(toCsvRow(['Patient ID', patient.id]))
    lines.push(toCsvRow(['Phone', patient.phone || '']))
    lines.push(toCsvRow(['Total Treatments', invoices.length]))
    lines.push(toCsvRow(['Number of Visits', summary.visitCount]))
    lines.push(toCsvRow(['Total Treatment Cost', summary.totalCost]))
    lines.push(toCsvRow(['Total Amount Paid', summary.totalPaid]))
    lines.push(toCsvRow(['Remaining Balance', summary.totalBalance]))
    lines.push('')
    lines.push(toCsvRow(['Invoice ID', 'Date', 'Item', 'Type', 'Qty', 'Amount']))
    invoices.forEach((inv) => {
      inv.lineItems?.forEach((li) => {
        lines.push(toCsvRow([inv.id, inv.date, li.name, li.type, li.qty, li.amount]))
      })
    })
    lines.push('')
    lines.push(toCsvRow(['Invoice ID', 'Visit #', 'Payment Date', 'Amount Paid', 'Method', 'Note', 'Invoice Total', 'Invoice Balance', 'Invoice Status']))
    invoices.forEach((inv) => {
      inv.payments?.forEach((p, i) => {
        lines.push(toCsvRow([inv.id, i + 1, p.date, p.amount, p.method, p.note || '', inv.total, inv.balance, inv.status]))
      })
    })

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${patient.name.replace(/\s+/g, '-')}-payments-${today()}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <Card className="text-center py-12">
        <p className="text-gray-500">Loading patient payment details…</p>
      </Card>
    )
  }

  if (notFound || !patient) {
    return (
      <Card className="text-center py-12">
        <p className="text-gray-500">Patient not found.</p>
        <Link to="/payments" className="text-primary-600 text-sm font-semibold hover:underline">Back to Payments</Link>
      </Card>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 print:hidden">
        <button
          onClick={() => navigate('/payments')}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 transition"
        >
          <ArrowLeft size={16} /> Back to Payments
        </button>
        <Button variant="outline" icon={Download} onClick={handleExport}>Export Payment Details</Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 print:hidden">
        {/* Patient info */}
        <Card className="lg:col-span-1 h-fit">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-lg shrink-0">
              {patient.name.split(' ').map((n) => n[0]).join('')}
            </div>
            <div>
              <h2 className="font-bold text-gray-800">{patient.name}</h2>
              <p className="text-xs text-gray-400">{patient.id}</p>
            </div>
          </div>
          <div className="mb-4"><Badge>{summary.status}</Badge></div>
          <div className="space-y-3 text-sm">
            <InfoRow icon={Phone} label="Phone" value={patient.phone || '—'} />
            <InfoRow icon={Mail} label="Email" value={patient.email || '—'} />
            <InfoRow icon={Stethoscope} label="Doctor" value={patient.doctor || '—'} />
            <div className="pt-3 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Treatments Taken</p>
              {summary.treatmentNames.length === 0 && <p className="text-gray-400 text-sm">None yet</p>}
              <div className="flex flex-wrap gap-1.5">
                {summary.treatmentNames.map((name) => (
                  <span key={name} className="text-xs px-2 py-1 rounded-lg bg-primary-50 text-primary-700">{name}</span>
                ))}
              </div>
            </div>
            <div className="pt-3 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-2 flex items-center gap-1.5">
                <CalendarDays size={13} /> Visit Dates
              </p>
              {summary.visitDates.length === 0 && <p className="text-gray-400 text-sm">No visits recorded</p>}
              <div className="flex flex-wrap gap-1.5">
                {summary.visitDates.map((d, i) => (
                  <span key={i} className="text-xs px-2 py-1 rounded-lg bg-gray-100 text-gray-600">{d}</span>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Summary + invoices */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryStat label="Total Treatments" value={invoices.length} />
            <SummaryStat label="Visits" value={summary.visitCount} />
            <SummaryStat label="Total Cost" value={`₹${summary.totalCost.toLocaleString('en-IN')}`} />
            <SummaryStat label="Paid" value={`₹${summary.totalPaid.toLocaleString('en-IN')}`} accent="text-emerald-700" />
          </div>
          <Card className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet size={18} className="text-primary-500" />
              <span className="font-semibold text-gray-800">Remaining Balance</span>
            </div>
            <span className="text-xl font-bold text-rose-600">₹{summary.totalBalance.toLocaleString('en-IN')}</span>
          </Card>

          {invoices.length === 0 && (
            <Card className="text-center py-10">
              <p className="text-gray-400 text-sm">No treatments billed to this patient yet.</p>
            </Card>
          )}

          {invoices.map((inv) => (
            <Card key={inv.id}>
              <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <Receipt size={16} className="text-primary-500" />
                    <h4 className="font-bold text-gray-800">{inv.id}</h4>
                    <Badge>{inv.status}</Badge>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{inv.date}</p>
                </div>
                <div className="flex items-center gap-2">
                  {inv.balance > 0 && (
                    <Button size="sm" variant="secondary" icon={PlusCircle} onClick={() => openInstallment(inv)}>
                      Record Installment
                    </Button>
                  )}
                  <Button size="sm" variant="outline" icon={Printer} onClick={() => handleGenerateReceipt(inv)}>
                    Receipt
                  </Button>
                </div>
              </div>

              <div className="text-sm mb-3">
                {inv.lineItems?.map((li, i) => (
                  <div key={i} className="flex justify-between py-1 text-gray-600">
                    <span className="truncate pr-2">{li.name} x{li.qty}</span>
                    <span className="shrink-0">₹{li.amount.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2 text-sm mb-3 p-3 rounded-xl bg-gray-50">
                <div><p className="text-xs text-gray-400">Total</p><p className="font-semibold text-gray-800">₹{inv.total.toLocaleString('en-IN')}</p></div>
                <div><p className="text-xs text-gray-400">Paid</p><p className="font-semibold text-emerald-700">₹{inv.amountPaid.toLocaleString('en-IN')}</p></div>
                <div><p className="text-xs text-gray-400">Balance</p><p className="font-semibold text-rose-600">₹{inv.balance.toLocaleString('en-IN')}</p></div>
              </div>

              {inv.payments?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Installment History</p>
                  <div className="space-y-2">
                    {inv.payments.map((p, i) => {
                      const Icon = methodIcon[p.method] || Banknote
                      return (
                        <div key={p.id} className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">Visit {i + 1}{p.note ? ` — ${p.note}` : ''}</p>
                            <p className="text-xs text-gray-400 flex items-center gap-1"><Icon size={12} /> {p.method} · {p.date}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="font-semibold text-gray-700">₹{p.amount.toLocaleString('en-IN')}</span>
                            <button
                              onClick={() => openEditPayment(inv, p)}
                              className="p-1.5 rounded-lg text-gray-400 hover:bg-primary-100 hover:text-primary-600 transition"
                              title="Edit Payment"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => setDeletePaymentTarget({ invoice: inv, payment: p })}
                              className="p-1.5 rounded-lg text-gray-400 hover:bg-rose-100 hover:text-rose-600 transition"
                              title="Delete Payment"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Record Installment modal */}
      <Modal open={!!installmentTarget} onClose={() => setInstallmentTarget(null)} title="Record Installment">
        {installmentTarget && (
          <form onSubmit={submitInstallment} className="space-y-4">
            <p className="text-xs text-gray-400 -mt-1">
              Remaining balance: <span className="font-semibold text-rose-600">₹{installmentTarget.balance.toLocaleString('en-IN')}</span>
            </p>
            {formError && (
              <div className="flex items-center gap-2 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
                <AlertCircle size={15} className="shrink-0" /> {formError}
              </div>
            )}
            <FormField label="Amount Paid" required>
              <TextInput type="number" min="0" step="0.01" value={installmentForm.amount}
                onChange={(e) => setInstallmentForm((f) => ({ ...f, amount: Number(e.target.value) || 0 }))} />
            </FormField>
            <FormField label="Payment Method" required>
              <Select value={installmentForm.method} onChange={(e) => setInstallmentForm((f) => ({ ...f, method: e.target.value }))}>
                <option>UPI</option><option>Card</option><option>Cash</option>
              </Select>
            </FormField>
            <FormField label="Date" required>
              <TextInput type="date" value={installmentForm.date} onChange={(e) => setInstallmentForm((f) => ({ ...f, date: e.target.value }))} />
            </FormField>
            <FormField label="Note" hint="e.g. 2nd Visit">
              <TextInput value={installmentForm.note} onChange={(e) => setInstallmentForm((f) => ({ ...f, note: e.target.value }))} />
            </FormField>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setInstallmentTarget(null)}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Record Payment'}</Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Edit Payment modal */}
      <Modal open={!!editPaymentTarget} onClose={() => setEditPaymentTarget(null)} title="Edit Payment">
        {editPaymentTarget && (
          <form onSubmit={submitEditPayment} className="space-y-4">
            {formError && (
              <div className="flex items-center gap-2 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
                <AlertCircle size={15} className="shrink-0" /> {formError}
              </div>
            )}
            <FormField label="Amount Paid" required>
              <TextInput type="number" min="0" step="0.01" value={editPaymentForm.amount}
                onChange={(e) => setEditPaymentForm((f) => ({ ...f, amount: Number(e.target.value) || 0 }))} />
            </FormField>
            <FormField label="Payment Method" required>
              <Select value={editPaymentForm.method} onChange={(e) => setEditPaymentForm((f) => ({ ...f, method: e.target.value }))}>
                <option>UPI</option><option>Card</option><option>Cash</option>
              </Select>
            </FormField>
            <FormField label="Date" required>
              <TextInput type="date" value={editPaymentForm.date} onChange={(e) => setEditPaymentForm((f) => ({ ...f, date: e.target.value }))} />
            </FormField>
            <FormField label="Note">
              <TextInput value={editPaymentForm.note} onChange={(e) => setEditPaymentForm((f) => ({ ...f, note: e.target.value }))} />
            </FormField>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setEditPaymentTarget(null)}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete payment confirm */}
      <Modal
        open={!!deletePaymentTarget}
        onClose={() => setDeletePaymentTarget(null)}
        title="Delete Payment"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeletePaymentTarget(null)}>Cancel</Button>
            <Button variant="danger" onClick={confirmDeletePayment}>Delete</Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to delete this installment payment of{' '}
          <span className="font-semibold">₹{deletePaymentTarget?.payment.amount.toLocaleString('en-IN')}</span>?
          The invoice balance will be recalculated automatically.
        </p>
      </Modal>

      {/* Printable receipt */}
      {receiptTarget && (
        <div className="hidden print:block print:text-gray-900">
          <style>{`
            @page {
              size: A4;
              margin: 14mm;
            }
          `}</style>
          <div className="flex items-start justify-between gap-6 pb-4 border-b-2 border-gray-800">
            <div className="flex items-start gap-3 min-w-0">
              <img src={clinicProfile?.logoDataUrl || logo} alt={clinicProfile?.name || 'Clinic logo'} className="w-14 h-14 object-contain shrink-0" />
              <div className="min-w-0">
                <h1 className="text-xl font-bold leading-tight">{clinicProfile?.name}</h1>
                {clinicProfile?.tagline && <p className="text-xs text-gray-500 mt-0.5">{clinicProfile.tagline}</p>}
                <p className="text-xs text-gray-600 mt-1.5 whitespace-pre-line leading-relaxed">{clinicProfile?.address}</p>
                <p className="text-xs text-gray-600 mt-0.5">{[clinicProfile?.phone, clinicProfile?.email].filter(Boolean).join('  ·  ')}</p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <h2 className="text-lg font-bold uppercase tracking-wide">Payment Receipt</h2>
              <p className="text-xs text-gray-500 mt-1">Invoice No: <span className="font-semibold text-gray-700">{receiptTarget.id}</span></p>
              <p className="text-xs text-gray-500 mt-1">Date: {(printedAt || new Date()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
            </div>
          </div>

          <div className="py-4">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Billed To</p>
            <p className="text-sm font-semibold text-gray-800">{patient.name}</p>
            <p className="text-xs text-gray-600">Patient ID: {patient.id}</p>
            {patient.phone && <p className="text-xs text-gray-600">{patient.phone}</p>}
          </div>

          <table className="w-full text-sm border-collapse mb-4">
            <thead>
              <tr className="border-b-2 border-gray-800 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                <th className="py-2 pr-2">Item</th>
                <th className="py-2 pr-2 text-right w-16">Qty</th>
                <th className="py-2 pl-2 text-right w-28">Amount</th>
              </tr>
            </thead>
            <tbody>
              {receiptTarget.lineItems?.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-200">
                  <td className="py-2 pr-2 text-gray-800">{item.name}</td>
                  <td className="py-2 pr-2 text-right text-gray-600">{item.qty}</td>
                  <td className="py-2 pl-2 text-right font-medium text-gray-800">₹{item.amount.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mb-4">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Installment History</p>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-300 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                  <th className="py-1.5 pr-2">Visit</th>
                  <th className="py-1.5 px-2">Date</th>
                  <th className="py-1.5 px-2">Method</th>
                  <th className="py-1.5 pl-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {receiptTarget.payments?.map((p, i) => (
                  <tr key={p.id} className="border-b border-gray-100">
                    <td className="py-1.5 pr-2 text-gray-800">{i + 1}</td>
                    <td className="py-1.5 px-2 text-gray-600">{p.date}</td>
                    <td className="py-1.5 px-2 text-gray-600">{p.method}</td>
                    <td className="py-1.5 pl-2 text-right font-medium text-gray-800">₹{p.amount.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <div className="w-64 space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600"><span>Total</span><span>₹{receiptTarget.total.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between text-gray-600"><span>Amount Paid</span><span>₹{receiptTarget.amountPaid.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t-2 border-gray-800">
                <span>Balance Due</span><span>₹{receiptTarget.balance.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-4 border-t border-gray-200 text-center text-[11px] text-gray-400">
            Thank you for visiting {clinicProfile?.name}. Wishing you good health.
          </div>
        </div>
      )}
    </div>
  )
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon size={15} className="text-primary-400 mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="font-medium text-gray-700">{value}</p>
      </div>
    </div>
  )
}

function SummaryStat({ label, value, accent = 'text-gray-800' }) {
  return (
    <Card className="!p-3.5">
      <p className="text-xs text-gray-500 font-medium truncate">{label}</p>
      <p className={`text-lg font-bold mt-0.5 truncate ${accent}`}>{value}</p>
    </Card>
  )
}
