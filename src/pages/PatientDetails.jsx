<<<<<<< HEAD
import { useEffect, useState } from 'react'
=======
import { useState } from 'react'
>>>>>>> 600209e07c32b1f3f515ecd74a8d9c1b3620a293
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Droplet,
  AlertTriangle,
  Pencil,
  Receipt,
  Pill,
  ClipboardList,
  Save,
} from 'lucide-react'
import Card from '../components/common/Card.jsx'
import Badge from '../components/common/Badge.jsx'
import Button from '../components/common/Button.jsx'
import { FormField, TextInput, TextArea } from '../components/common/FormField.jsx'
<<<<<<< HEAD
import { getPatient, updatePatient } from '../api/patients.js'
=======
import { patients, patientDetailExtra } from '../data/mockData.js'
>>>>>>> 600209e07c32b1f3f515ecd74a8d9c1b3620a293

const tabs = [
  { key: 'history', label: 'Treatment History', icon: ClipboardList },
  { key: 'prescriptions', label: 'Prescriptions', icon: Pill },
  { key: 'invoices', label: 'Invoices', icon: Receipt },
]

export default function PatientDetails() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [editMode, setEditMode] = useState(searchParams.get('edit') === '1')
  const [activeTab, setActiveTab] = useState('history')
<<<<<<< HEAD
  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [form, setForm] = useState({ phone: '', email: '', address: '', allergies: '', medicalNotes: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getPatient(id)
      .then((p) => {
        setPatient(p)
        setForm({
          phone: p.phone || '',
          email: p.email || '',
          address: p.address || '',
          allergies: p.allergies || '',
          medicalNotes: p.medicalNotes || '',
        })
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  function updateForm(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleEditToggle() {
    if (editMode) {
      setSaving(true)
      try {
        const updated = await updatePatient(id, form)
        setPatient(updated)
        setEditMode(false)
      } finally {
        setSaving(false)
      }
    } else {
      setEditMode(true)
    }
  }

  if (loading) {
    return (
      <Card className="text-center py-12">
        <p className="text-gray-500">Loading patient…</p>
      </Card>
    )
  }

  if (notFound || !patient) {
=======

  const patient = patients.find((p) => p.id === id)
  const extra = patientDetailExtra[id] || {
    dob: '—', email: '—', address: '—', bloodGroup: '—', allergies: '—',
    medicalNotes: 'No additional notes recorded.',
    treatments: [], prescriptions: [], invoices: [],
  }

  if (!patient) {
>>>>>>> 600209e07c32b1f3f515ecd74a8d9c1b3620a293
    return (
      <Card className="text-center py-12">
        <p className="text-gray-500">Patient not found.</p>
        <Link to="/patients" className="text-primary-600 text-sm font-semibold hover:underline">
          Back to Patients
        </Link>
      </Card>
    )
  }

<<<<<<< HEAD
  const treatments = patient.treatments || []
  const prescriptions = patient.prescriptions || []
  const invoices = patient.invoices || []

=======
>>>>>>> 600209e07c32b1f3f515ecd74a8d9c1b3620a293
  return (
    <div>
      <button
        onClick={() => navigate('/patients')}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 mb-4 transition"
      >
        <ArrowLeft size={16} /> Back to Patients
      </button>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile card */}
        <Card className="lg:col-span-1 h-fit">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-lg shrink-0">
                {patient.name.split(' ').map((n) => n[0]).join('')}
              </div>
              <div>
                <h2 className="font-bold text-gray-800">{patient.name}</h2>
                <p className="text-xs text-gray-400">{patient.id}</p>
              </div>
            </div>
            <Button
              variant={editMode ? 'secondary' : 'outline'}
              size="sm"
              icon={editMode ? Save : Pencil}
<<<<<<< HEAD
              onClick={handleEditToggle}
              disabled={saving}
            >
              {saving ? 'Saving…' : editMode ? 'Save' : 'Edit'}
=======
              onClick={() => setEditMode((v) => !v)}
            >
              {editMode ? 'Save' : 'Edit'}
>>>>>>> 600209e07c32b1f3f515ecd74a8d9c1b3620a293
            </Button>
          </div>

          <div className="mb-4">
            <Badge>{patient.status}</Badge>
          </div>

          {editMode ? (
            <div className="space-y-3">
<<<<<<< HEAD
              <FormField label="Phone">
                <TextInput value={form.phone} onChange={(e) => updateForm('phone', e.target.value)} />
              </FormField>
              <FormField label="Email">
                <TextInput value={form.email} onChange={(e) => updateForm('email', e.target.value)} />
              </FormField>
              <FormField label="Address">
                <TextArea value={form.address} onChange={(e) => updateForm('address', e.target.value)} />
              </FormField>
              <FormField label="Allergies">
                <TextInput value={form.allergies} onChange={(e) => updateForm('allergies', e.target.value)} />
              </FormField>
              <FormField label="Medical Notes">
                <TextArea value={form.medicalNotes} onChange={(e) => updateForm('medicalNotes', e.target.value)} />
              </FormField>
=======
              <FormField label="Phone"><TextInput defaultValue={patient.phone} /></FormField>
              <FormField label="Email"><TextInput defaultValue={extra.email} /></FormField>
              <FormField label="Address"><TextArea defaultValue={extra.address} /></FormField>
              <FormField label="Allergies"><TextInput defaultValue={extra.allergies} /></FormField>
              <FormField label="Medical Notes"><TextArea defaultValue={extra.medicalNotes} /></FormField>
>>>>>>> 600209e07c32b1f3f515ecd74a8d9c1b3620a293
            </div>
          ) : (
            <div className="space-y-3 text-sm">
              <InfoRow icon={Phone} label="Phone" value={patient.phone} />
<<<<<<< HEAD
              <InfoRow icon={Mail} label="Email" value={patient.email || '—'} />
              <InfoRow icon={MapPin} label="Address" value={patient.address || '—'} />
              <InfoRow icon={Droplet} label="Blood Group" value={patient.bloodGroup || '—'} />
              <InfoRow icon={AlertTriangle} label="Allergies" value={patient.allergies || '—'} />
=======
              <InfoRow icon={Mail} label="Email" value={extra.email} />
              <InfoRow icon={MapPin} label="Address" value={extra.address} />
              <InfoRow icon={Droplet} label="Blood Group" value={extra.bloodGroup} />
              <InfoRow icon={AlertTriangle} label="Allergies" value={extra.allergies} />
>>>>>>> 600209e07c32b1f3f515ecd74a8d9c1b3620a293

              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Basic Info</p>
                <div className="grid grid-cols-2 gap-y-2 text-gray-600">
                  <span>Age / Gender</span>
                  <span className="font-medium text-gray-800">{patient.age} / {patient.gender}</span>
                  <span>DOB</span>
<<<<<<< HEAD
                  <span className="font-medium text-gray-800">{patient.dob || '—'}</span>
=======
                  <span className="font-medium text-gray-800">{extra.dob}</span>
>>>>>>> 600209e07c32b1f3f515ecd74a8d9c1b3620a293
                  <span>Concern</span>
                  <span className="font-medium text-gray-800">{patient.concern}</span>
                  <span>Doctor</span>
                  <span className="font-medium text-gray-800">{patient.doctor}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Medical Notes</p>
<<<<<<< HEAD
                <p className="text-gray-600 leading-relaxed">{patient.medicalNotes || 'No additional notes recorded.'}</p>
=======
                <p className="text-gray-600 leading-relaxed">{extra.medicalNotes}</p>
>>>>>>> 600209e07c32b1f3f515ecd74a8d9c1b3620a293
              </div>
            </div>
          )}
        </Card>

        {/* Tabs content */}
        <Card className="lg:col-span-2">
          <div className="flex items-center gap-1 mb-5 border-b border-gray-100 -mt-1">
            {tabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-semibold border-b-2 -mb-px transition ${
                  activeTab === key
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                <Icon size={15} /> {label}
              </button>
            ))}
          </div>

          {activeTab === 'history' && (
            <div className="space-y-4">
<<<<<<< HEAD
              {treatments.length === 0 && <EmptyState text="No treatment history recorded." />}
              {treatments.map((t, i) => (
=======
              {extra.treatments.length === 0 && <EmptyState text="No treatment history recorded." />}
              {extra.treatments.map((t, i) => (
>>>>>>> 600209e07c32b1f3f515ecd74a8d9c1b3620a293
                <div key={i} className="flex gap-4 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                  <div className="w-2 h-2 rounded-full bg-primary-500 mt-2 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.date} · {t.doctor}</p>
                    <p className="text-sm text-gray-600 mt-1">{t.notes}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'prescriptions' && (
            <div className="space-y-3">
<<<<<<< HEAD
              {prescriptions.length === 0 && <EmptyState text="No prescriptions recorded." />}
              {prescriptions.map((p, i) => (
=======
              {extra.prescriptions.length === 0 && <EmptyState text="No prescriptions recorded." />}
              {extra.prescriptions.map((p, i) => (
>>>>>>> 600209e07c32b1f3f515ecd74a8d9c1b3620a293
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-primary-50/50">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{p.medicine}</p>
                    <p className="text-xs text-gray-500">{p.dosage}</p>
                  </div>
                  <span className="text-xs text-gray-400">{p.date}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'invoices' && (
            <div className="space-y-2">
<<<<<<< HEAD
              {invoices.length === 0 && <EmptyState text="No invoices recorded." />}
              {invoices.map((inv) => (
=======
              {extra.invoices.length === 0 && <EmptyState text="No invoices recorded." />}
              {extra.invoices.map((inv) => (
>>>>>>> 600209e07c32b1f3f515ecd74a8d9c1b3620a293
                <div key={inv.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{inv.id}</p>
                    <p className="text-xs text-gray-400">{inv.date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-700">₹{inv.amount.toLocaleString('en-IN')}</span>
                    <Badge>{inv.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
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

function EmptyState({ text }) {
  return <p className="text-sm text-gray-400 text-center py-8">{text}</p>
}
