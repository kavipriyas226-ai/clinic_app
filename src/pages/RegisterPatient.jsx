import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Phone, Stethoscope, FileText, Save } from 'lucide-react'
import Card from '../components/common/Card.jsx'
import PageHeader from '../components/common/PageHeader.jsx'
import Button from '../components/common/Button.jsx'
import { FormField, TextInput, TextArea, Select } from '../components/common/FormField.jsx'

const sectionIcon = 'w-9 h-9 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0'

export default function RegisterPatient() {
  const navigate = useNavigate()
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => navigate('/patients'), 900)
  }

  return (
    <div>
      <PageHeader title="Register Patient" subtitle="Add a new patient to your clinic records" />

      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        {/* Personal details */}
        <Card>
          <div className="flex items-center gap-3 mb-5">
            <div className={sectionIcon}><User size={18} /></div>
            <div>
              <h3 className="font-bold text-gray-800">Personal Details</h3>
              <p className="text-xs text-gray-400">Basic identification information</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField label="Full Name" required>
              <TextInput placeholder="e.g. Riya Sharma" required />
            </FormField>
            <FormField label="Date of Birth" required>
              <TextInput type="date" required />
            </FormField>
            <FormField label="Gender" required>
              <Select required defaultValue="">
                <option value="" disabled>Select gender</option>
                <option>Female</option>
                <option>Male</option>
                <option>Other</option>
              </Select>
            </FormField>
            <FormField label="Blood Group">
              <Select defaultValue="">
                <option value="">Unknown</option>
                <option>A+</option><option>A-</option>
                <option>B+</option><option>B-</option>
                <option>O+</option><option>O-</option>
                <option>AB+</option><option>AB-</option>
              </Select>
            </FormField>
          </div>
        </Card>

        {/* Contact details */}
        <Card>
          <div className="flex items-center gap-3 mb-5">
            <div className={sectionIcon}><Phone size={18} /></div>
            <div>
              <h3 className="font-bold text-gray-800">Contact Details</h3>
              <p className="text-xs text-gray-400">How we can reach the patient</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField label="Phone Number" required>
              <TextInput type="tel" placeholder="+91 90000 00000" required />
            </FormField>
            <FormField label="Email Address">
              <TextInput type="email" placeholder="patient@example.com" />
            </FormField>
            <FormField label="Address" className="sm:col-span-2">
              <TextArea placeholder="Street, area, city, state, PIN code" />
            </FormField>
            <FormField label="Emergency Contact">
              <TextInput type="tel" placeholder="+91 90000 00000" />
            </FormField>
            <FormField label="Referred By">
              <TextInput placeholder="e.g. Dr. Vikram Sen / Walk-in" />
            </FormField>
          </div>
        </Card>

        {/* Skin / Hair concern */}
        <Card>
          <div className="flex items-center gap-3 mb-5">
            <div className={sectionIcon}><Stethoscope size={18} /></div>
            <div>
              <h3 className="font-bold text-gray-800">Skin / Hair Concern</h3>
              <p className="text-xs text-gray-400">Primary reason for consultation</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField label="Concern Type" required>
              <Select required defaultValue="">
                <option value="" disabled>Select concern</option>
                <option>Acne & Scarring</option>
                <option>Hair Fall</option>
                <option>Pigmentation</option>
                <option>Psoriasis</option>
                <option>Eczema</option>
                <option>Anti-Aging</option>
                <option>Dandruff & Scalp Care</option>
                <option>Hair Transplant Consult</option>
                <option>Other</option>
              </Select>
            </FormField>
            <FormField label="Assigned Doctor" required>
              <Select required defaultValue="">
                <option value="" disabled>Select doctor</option>
                <option>Dr. Anita Rao</option>
                <option>Dr. Vikram Sen</option>
                <option>Dr. Neha Kapoor</option>
              </Select>
            </FormField>
            <FormField label="Concern Description" className="sm:col-span-2">
              <TextArea placeholder="Describe symptoms, duration, and severity..." />
            </FormField>
          </div>
        </Card>

        {/* Medical notes */}
        <Card>
          <div className="flex items-center gap-3 mb-5">
            <div className={sectionIcon}><FileText size={18} /></div>
            <div>
              <h3 className="font-bold text-gray-800">Medical Notes</h3>
              <p className="text-xs text-gray-400">Allergies, history & other observations</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField label="Known Allergies">
              <TextInput placeholder="e.g. None known / Penicillin" />
            </FormField>
            <FormField label="Existing Medications">
              <TextInput placeholder="e.g. None / Isotretinoin 20mg" />
            </FormField>
            <FormField label="Medical History" className="sm:col-span-2">
              <TextArea placeholder="Relevant past conditions, surgeries, family history..." />
            </FormField>
          </div>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => navigate('/patients')}>
            Cancel
          </Button>
          <Button type="submit" icon={Save}>
            {submitted ? 'Saved!' : 'Save Patient'}
          </Button>
        </div>
      </form>
    </div>
  )
}
