import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Pencil, Receipt, Pill, ClipboardList, ChevronLeft, ChevronRight } from 'lucide-react'
import Card from '../components/common/Card.jsx'
import Badge from '../components/common/Badge.jsx'
import Button from '../components/common/Button.jsx'
import { getPatient } from '../api/patients.js'
import { patientFormSections } from '../config/patientFormSections.js'

const tabs = [
  { key: 'history', label: 'Treatment History', icon: ClipboardList },
  { key: 'prescriptions', label: 'Prescriptions', icon: Pill },
  { key: 'invoices', label: 'Invoices', icon: Receipt },
]

function formatFieldValue(field, value) {
  if (!value) return '—'
  if (field.type === 'date') {
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return value
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  }
  return value
}

export default function PatientDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('history')
  const [activeSection, setActiveSection] = useState(0)
  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    getPatient(id)
      .then(setPatient)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <Card className="text-center py-12">
        <p className="text-gray-500">Loading patient…</p>
      </Card>
    )
  }

  if (notFound || !patient) {
    return (
      <Card className="text-center py-12">
        <p className="text-gray-500">Patient not found.</p>
        <Link to="/patients" className="text-primary-600 text-sm font-semibold hover:underline">
          Back to Patients
        </Link>
      </Card>
    )
  }

  const treatments = patient.treatments || []
  const prescriptions = patient.prescriptions || []
  const invoices = patient.invoices || []
  const section = patientFormSections[activeSection]
  const SectionIcon = section.icon

  return (
    <div>
      <button
        onClick={() => navigate('/patients')}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 mb-4 transition"
      >
        <ArrowLeft size={16} /> Back to Patients
      </button>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Patient Details card — sectioned, tab-navigable view of every Register Patient field */}
        <Card className="lg:col-span-1 h-fit">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-14 h-14 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-lg shrink-0">
                {patient.name.split(' ').map((n) => n[0]).join('')}
              </div>
              <div className="min-w-0">
                <h2 className="font-bold text-gray-800 truncate">{patient.name}</h2>
                <p className="text-xs text-gray-400">{patient.id}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              icon={Pencil}
              onClick={() => navigate(`/patients/${id}/edit`)}
            >
              Edit
            </Button>
          </div>

          <div className="mb-4">
            <Badge>{patient.status}</Badge>
          </div>

          {/* Section tabs */}
          <div className="flex flex-wrap gap-1 mb-4 border-b border-gray-100 -mt-1">
            {patientFormSections.map((s, i) => (
              <button
                key={s.key}
                onClick={() => setActiveSection(i)}
                className={`px-2.5 py-2 text-xs font-semibold border-b-2 -mb-px transition whitespace-nowrap ${
                  activeSection === i
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Active section content */}
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
              <SectionIcon size={15} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-800">{section.label}</p>
              <p className="text-[11px] text-gray-400">{section.description}</p>
            </div>
          </div>

          <div className="space-y-3 text-sm mb-5">
            {section.fields.map((field) => (
              <div key={field.name}>
                <p className="text-xs text-gray-400">{field.label}</p>
                <p className="font-medium text-gray-800 whitespace-pre-line leading-relaxed">
                  {formatFieldValue(field, patient[field.name])}
                </p>
              </div>
            ))}
          </div>

          {/* Previous / Next section navigation */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <button
              onClick={() => setActiveSection((i) => Math.max(0, i - 1))}
              disabled={activeSection === 0}
              className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-primary-600 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-gray-500 transition"
            >
              <ChevronLeft size={14} /> Previous
            </button>
            <span className="text-[11px] text-gray-400">
              {activeSection + 1} of {patientFormSections.length}
            </span>
            <button
              onClick={() => setActiveSection((i) => Math.min(patientFormSections.length - 1, i + 1))}
              disabled={activeSection === patientFormSections.length - 1}
              className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-primary-600 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-gray-500 transition"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </Card>

        {/* Clinical activity tabs — treatment history, prescriptions, invoices */}
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
              {treatments.length === 0 && <EmptyState text="No treatment history recorded." />}
              {treatments.map((t, i) => (
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
              {prescriptions.length === 0 && <EmptyState text="No prescriptions recorded." />}
              {prescriptions.map((p, i) => (
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
              {invoices.length === 0 && <EmptyState text="No invoices recorded." />}
              {invoices.length > 0 && (
                <Link
                  to={`/payments/patient/${patient.id}`}
                  className="inline-block text-sm text-primary-600 font-semibold hover:underline mb-1"
                >
                  View full payment & installment history →
                </Link>
              )}
              {invoices.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{inv.id}</p>
                    <p className="text-xs text-gray-400">{inv.date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-700">₹{inv.amount.toLocaleString('en-IN')}</p>
                      {inv.balance > 0 && (
                        <p className="text-xs text-rose-500">₹{inv.balance.toLocaleString('en-IN')} due</p>
                      )}
                    </div>
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

function EmptyState({ text }) {
  return <p className="text-sm text-gray-400 text-center py-8">{text}</p>
}
