import { User, Phone, Stethoscope, FileText } from 'lucide-react'

// Single source of truth for every field on the patient registration form.
// RegisterPatient.jsx (create + edit) and PatientDetails.jsx (read-only view)
// both render from this list, so a field added here automatically appears,
// editable, in Edit Patient and, read-only, in View Patient Details.
export const patientFormSections = [
  {
    key: 'personal',
    label: 'Personal Details',
    icon: User,
    description: 'Basic identification information',
    fields: [
      { name: 'name', label: 'Full Name', type: 'text', required: true, placeholder: 'e.g. Riya Sharma' },
      { name: 'dob', label: 'Date of Birth', type: 'date', required: true },
      { name: 'gender', label: 'Gender', type: 'select', required: true, options: ['Female', 'Male', 'Other'] },
      {
        name: 'bloodGroup',
        label: 'Blood Group',
        type: 'select',
        emptyLabel: 'Unknown',
        options: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'],
      },
    ],
  },
  {
    key: 'contact',
    label: 'Contact Details',
    icon: Phone,
    description: 'How we can reach the patient',
    fields: [
      { name: 'phone', label: 'Phone Number', type: 'tel', required: true, placeholder: '+91 90000 00000' },
      { name: 'email', label: 'Email Address', type: 'email', placeholder: 'patient@example.com' },
      { name: 'address', label: 'Address', type: 'textarea', colSpan: 2, placeholder: 'Street, area, city, state, PIN code' },
      { name: 'emergencyContact', label: 'Emergency Contact', type: 'tel', placeholder: '+91 90000 00000' },
      { name: 'referredBy', label: 'Referred By', type: 'text', placeholder: 'e.g. Dr. Vikram Sen / Walk-in' },
    ],
  },
  {
    key: 'concern',
    label: 'Skin / Hair Concern',
    icon: Stethoscope,
    description: 'Primary reason for consultation',
    fields: [
      {
        name: 'concern',
        label: 'Concern Type',
        type: 'select',
        required: true,
        options: [
          'Acne & Scarring',
          'Hair Fall',
          'Pigmentation',
          'Psoriasis',
          'Eczema',
          'Anti-Aging',
          'Dandruff & Scalp Care',
          'Hair Transplant Consult',
          'Other',
        ],
      },
      { name: 'doctor', label: 'Assigned Doctor', type: 'text', required: true, placeholder: 'e.g. Dr. Anita Rao', default: 'Dr. Anita Rao' },
      { name: 'concernDescription', label: 'Concern Description', type: 'textarea', colSpan: 2, placeholder: 'Describe symptoms, duration, and severity...' },
    ],
  },
  {
    key: 'medical',
    label: 'Medical Notes',
    icon: FileText,
    description: 'Allergies, history & other observations',
    fields: [
      { name: 'allergies', label: 'Known Allergies', type: 'text', placeholder: 'e.g. None known / Penicillin' },
      { name: 'existingMedications', label: 'Existing Medications', type: 'text', placeholder: 'e.g. None / Isotretinoin 20mg' },
      { name: 'medicalNotes', label: 'Medical History', type: 'textarea', colSpan: 2, placeholder: 'Relevant past conditions, surgeries, family history...' },
    ],
  },
]

export const allPatientFieldNames = patientFormSections.flatMap((s) => s.fields.map((f) => f.name))
