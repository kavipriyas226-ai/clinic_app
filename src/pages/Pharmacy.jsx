import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Trash2, ShoppingCart, Pill, AlertCircle } from 'lucide-react'
import Card from '../components/common/Card.jsx'
import PageHeader from '../components/common/PageHeader.jsx'
import SearchInput from '../components/common/SearchInput.jsx'
import Button from '../components/common/Button.jsx'
import Badge from '../components/common/Badge.jsx'
import { TextInput } from '../components/common/FormField.jsx'
import { getInventory } from '../api/inventory.js'
import { getPatients } from '../api/patients.js'
import { createPrescription } from '../api/prescriptions.js'

export default function Pharmacy() {
  const navigate = useNavigate()
  const location = useLocation()
  const incomingPatientId = location.state?.patientId
  const incomingMedicines = location.state?.medicines

  const [inventory, setInventory] = useState([])
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [patientSearchQuery, setPatientSearchQuery] = useState('')
  const [patientSearchOpen, setPatientSearchOpen] = useState(false)
  const [patientId, setPatientId] = useState(incomingPatientId || '')
  const [prescription, setPrescription] = useState([])
  const [bill, setBill] = useState([])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([getInventory(), getPatients()])
      .then(([inv, pts]) => {
        setInventory(inv)
        setPatients(pts)
        if (incomingPatientId && pts.some((p) => p.id === incomingPatientId)) {
          setPatientId(incomingPatientId)
        } else if (pts.length > 0) {
          setPatientId(pts[0].id)
        }
        if (incomingMedicines && incomingMedicines.length > 0) {
          setPrescription(
            incomingMedicines.map((m) => ({
              uid: crypto.randomUUID(),
              medicineId: m.id,
              name: m.name,
              dosage: '1 dose',
              frequency: 'Once daily',
              duration: '7 days',
            }))
          )
        }
      })
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const selectedPatient = patients.find((p) => p.id === patientId)

  const filtered = useMemo(
    () => inventory.filter((m) => m.name.toLowerCase().includes(query.toLowerCase())),
    [inventory, query]
  )

  const filteredPatients = useMemo(() => {
    const q = patientSearchQuery.trim().toLowerCase()
    if (!q) return patients
    return patients.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.phone || '').toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        (p.email || '').toLowerCase().includes(q)
    )
  }, [patients, patientSearchQuery])

  function openPatientSearch() {
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

  function addToPrescription(med) {
    setPrescription((prev) => [
      ...prev,
      { uid: crypto.randomUUID(), medicineId: med.id, name: med.name, dosage: '1 dose', frequency: 'Once daily', duration: '7 days' },
    ])
  }

  function updatePrescriptionRow(uid, patch) {
    setPrescription((prev) => prev.map((p) => (p.uid === uid ? { ...p, ...patch } : p)))
  }

  function removePrescriptionRow(uid) {
    setPrescription((prev) => prev.filter((p) => p.uid !== uid))
  }

  function addToBill(med) {
    setBill((prev) => {
      const existing = prev.find((b) => b.id === med.id)
      if (existing) {
        return prev.map((b) => (b.id === med.id ? { ...b, qty: b.qty + 1 } : b))
      }
      return [...prev, { id: med.id, name: med.name, qty: 1 }]
    })
  }

  function removeFromBill(id) {
    setBill((prev) => prev.filter((b) => b.id !== id))
  }

  async function addPrescriptionToBill() {
    setError('')
    setSaving(true)
    try {
      await createPrescription({
        patientId,
        items: prescription.map(({ medicineId, name, dosage, frequency, duration }) => ({
          medicineId,
          name,
          dosage,
          frequency,
          duration,
        })),
      })
      prescription.forEach((row) => {
        const med = inventory.find((m) => m.id === row.medicineId)
        if (med) addToBill(med)
      })
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save the prescription. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader title="Pharmacy" subtitle="Search medicines, build prescriptions, and add items to billing" />

      {error && (
        <div className="flex items-center gap-2 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2 mb-4">
          <AlertCircle size={15} className="shrink-0" />
          {error}
        </div>
      )}

      <div className="grid xl:grid-cols-3 gap-6">
        {/* Medicine search */}
        <Card className="xl:col-span-1">
          <h3 className="font-bold text-gray-800 mb-4">Medicine Search</h3>
          <SearchInput value={query} onChange={setQuery} placeholder="Search medicines..." className="mb-4" />
          <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
            {loading && <p className="text-sm text-gray-400 text-center py-8">Loading medicines…</p>}
            {!loading && filtered.map((med) => (
              <div key={med.id} className="p-3 rounded-xl border border-gray-100 hover:border-primary-200 transition">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{med.name}</p>
                    <p className="text-xs text-gray-400">{med.category} · {med.stock} in stock</p>
                  </div>
                  {med.stock <= med.threshold && <Badge color="red">Low</Badge>}
                </div>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" variant="secondary" icon={Pill} onClick={() => addToPrescription(med)} className="flex-1">
                    Prescribe
                  </Button>
                </div>
              </div>
            ))}
            {!loading && filtered.length === 0 && <p className="text-sm text-gray-400 text-center py-8">No medicines found.</p>}
          </div>
        </Card>

        {/* Prescription builder */}
        <Card className="xl:col-span-1">
          <h3 className="font-bold text-gray-800 mb-4">Prescription</h3>
          <div className="relative mb-4">
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
                  {filteredPatients.length === 0 && (
                    <p className="px-3 py-2 text-sm text-gray-400">No patients found.</p>
                  )}
                  {filteredPatients.map((p) => (
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
                  ))}
                </div>
              </>
            ) : (
              <button
                type="button"
                onClick={openPatientSearch}
                className="w-full text-left text-sm px-3 py-2 rounded-xl border border-gray-200 hover:border-primary-300 truncate transition"
              >
                {selectedPatient ? `${selectedPatient.name} — ${selectedPatient.id}` : 'Search and select a patient...'}
              </button>
            )}
          </div>

          <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
            {prescription.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-8">
                Search a medicine and click "Prescribe" to add it here.
              </p>
            )}
            {prescription.map((row) => (
              <div key={row.uid} className="p-3 rounded-xl bg-primary-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-800">{row.name}</p>
                  <button onClick={() => removePrescriptionRow(row.uid)} className="text-gray-400 hover:text-rose-600">
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <TextInput
                    value={row.dosage}
                    onChange={(e) => updatePrescriptionRow(row.uid, { dosage: e.target.value })}
                    placeholder="Dosage"
                  />
                  <TextInput
                    value={row.frequency}
                    onChange={(e) => updatePrescriptionRow(row.uid, { frequency: e.target.value })}
                    placeholder="Frequency"
                  />
                  <TextInput
                    value={row.duration}
                    onChange={(e) => updatePrescriptionRow(row.uid, { duration: e.target.value })}
                    placeholder="Duration"
                  />
                </div>
              </div>
            ))}
          </div>

          {prescription.length > 0 && (
            <Button className="w-full mt-4" variant="secondary" icon={ShoppingCart} onClick={addPrescriptionToBill} disabled={saving}>
              {saving ? 'Saving…' : 'Add to Bill'}
            </Button>
          )}
        </Card>

        {/* Bill preview */}
        <Card className="xl:col-span-1">
          <h3 className="font-bold text-gray-800 mb-4">Bill Items</h3>
          <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1">
            {bill.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-8">
                Add medicines to the bill to prepare an invoice.
              </p>
            )}
            {bill.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{item.name}</p>
                  <p className="text-xs text-gray-400">Qty: {item.qty}</p>
                </div>
                <button onClick={() => removeFromBill(item.id)} className="text-gray-400 hover:text-rose-600">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
          {bill.length > 0 && (
            <Button
              className="w-full mt-4"
              onClick={() => navigate('/billing', { state: { billItems: bill, patientId } })}
            >
              Proceed to Billing
            </Button>
          )}
        </Card>
      </div>
    </div>
  )
}
