import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Save, AlertCircle } from 'lucide-react'
import Card from '../components/common/Card.jsx'
import PageHeader from '../components/common/PageHeader.jsx'
import Button from '../components/common/Button.jsx'
import { FormField, TextInput, TextArea, Select } from '../components/common/FormField.jsx'
import { getPatient, createPatient, updatePatient } from '../api/patients.js'
import { patientFormSections } from '../config/patientFormSections.js'

const sectionIcon = 'w-9 h-9 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0'

function FieldInput({ field, defaultValue }) {
  const value = defaultValue ?? field.default ?? ''
  if (field.type === 'select') {
    return (
      <Select name={field.name} required={field.required} defaultValue={value}>
        <option value="" disabled={field.required}>{field.emptyLabel || `Select ${field.label.toLowerCase()}`}</option>
        {field.options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </Select>
    )
  }
  if (field.type === 'textarea') {
    return <TextArea name={field.name} placeholder={field.placeholder} defaultValue={value} />
  }
  return (
    <TextInput
      name={field.name}
      type={field.type}
      placeholder={field.placeholder}
      required={field.required}
      defaultValue={value}
    />
  )
}

export default function RegisterPatient() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id

  const [loading, setLoading] = useState(isEdit)
  const [notFound, setNotFound] = useState(false)
  const [patient, setPatient] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isEdit) return
    getPatient(id)
      .then(setPatient)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id, isEdit])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    const form = new FormData(e.target)
    const payload = {}
    patientFormSections.forEach((section) => {
      section.fields.forEach((field) => {
        payload[field.name] = form.get(field.name) || ''
      })
    })

    try {
      if (isEdit) {
        await updatePatient(id, payload)
      } else {
        await createPatient(payload)
      }
      setSubmitted(true)
      setTimeout(() => navigate('/patients'), 700)
    } catch (err) {
      setError(err.response?.data?.message || `Could not ${isEdit ? 'update' : 'register'} patient. Please check the form and try again.`)
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Card className="text-center py-12">
        <p className="text-gray-500">Loading patient…</p>
      </Card>
    )
  }

  if (isEdit && (notFound || !patient)) {
    return (
      <Card className="text-center py-12">
        <p className="text-gray-500">Patient not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/patients')}>Back to Patients</Button>
      </Card>
    )
  }

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Edit Patient' : 'Register Patient'}
        subtitle={isEdit ? `Update ${patient.name}'s record` : 'Add a new patient to your clinic records'}
      />

      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        {patientFormSections.map((section) => {
          const Icon = section.icon
          return (
            <Card key={section.key}>
              <div className="flex items-center gap-3 mb-5">
                <div className={sectionIcon}><Icon size={18} /></div>
                <div>
                  <h3 className="font-bold text-gray-800">{section.label}</h3>
                  <p className="text-xs text-gray-400">{section.description}</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {section.fields.map((field) => (
                  <FormField
                    key={field.name}
                    label={field.label}
                    required={field.required}
                    className={field.colSpan === 2 ? 'sm:col-span-2' : undefined}
                  >
                    <FieldInput field={field} defaultValue={patient?.[field.name]} />
                  </FormField>
                ))}
              </div>
            </Card>
          )
        })}

        {error && (
          <div className="flex items-center gap-2 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
            <AlertCircle size={15} className="shrink-0" />
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => navigate('/patients')}>
            Cancel
          </Button>
          <Button type="submit" icon={Save} disabled={submitting}>
            {submitted ? 'Saved!' : submitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Save Patient'}
          </Button>
        </div>
      </form>
    </div>
  )
}
