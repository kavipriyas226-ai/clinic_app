import { useEffect, useMemo, useState } from 'react'
import { Stethoscope, Filter, Eye, Pencil, Trash2, Check } from 'lucide-react'
import Card from '../components/common/Card.jsx'
import PageHeader from '../components/common/PageHeader.jsx'
import SearchInput from '../components/common/SearchInput.jsx'
import Table from '../components/common/Table.jsx'
import Button from '../components/common/Button.jsx'
import Modal from '../components/common/Modal.jsx'
import { FormField, TextInput, Select } from '../components/common/FormField.jsx'
import InventoryTabs from '../components/inventory/InventoryTabs.jsx'
import { getTreatmentOptions, createTreatmentOption, updateTreatmentOption, deleteTreatmentOption } from '../api/treatments.js'

const TREATMENT_CATEGORIES = ['Skin Treatments', 'Hair Treatments', 'Cosmetic Procedures']

export default function InventoryTreatments() {
  const [treatments, setTreatments] = useState([])
  const [treatmentsLoading, setTreatmentsLoading] = useState(true)
  const [treatmentQuery, setTreatmentQuery] = useState('')
  const [treatmentCategory, setTreatmentCategory] = useState('All')
  const [showAddTreatment, setShowAddTreatment] = useState(false)
  const [treatmentAdded, setTreatmentAdded] = useState('')
  const [treatmentViewTarget, setTreatmentViewTarget] = useState(null)
  const [treatmentEditTarget, setTreatmentEditTarget] = useState(null)
  const [treatmentDeleteTarget, setTreatmentDeleteTarget] = useState(null)

  useEffect(() => {
    getTreatmentOptions()
      .then(setTreatments)
      .finally(() => setTreatmentsLoading(false))
  }, [])

  const filteredTreatments = useMemo(() => {
    return treatments.filter((t) => {
      const matchesQuery = t.name.toLowerCase().includes(treatmentQuery.toLowerCase()) || t.id.toLowerCase().includes(treatmentQuery.toLowerCase())
      const matchesCategory = treatmentCategory === 'All' || t.category === treatmentCategory
      return matchesQuery && matchesCategory
    })
  }, [treatments, treatmentQuery, treatmentCategory])

  async function confirmDeleteTreatment() {
    await deleteTreatmentOption(treatmentDeleteTarget.id)
    setTreatments((prev) => prev.filter((t) => t.id !== treatmentDeleteTarget.id))
    setTreatmentDeleteTarget(null)
  }

  async function handleAddTreatment(e) {
    e.preventDefault()
    const form = new FormData(e.target)
    const payload = {
      name: form.get('name'),
      category: form.get('category'),
      price: Number(form.get('price')),
    }
    const created = await createTreatmentOption(payload)
    setTreatments((prev) => [created, ...prev])
    setShowAddTreatment(false)
    setTreatmentAdded(created.name)
    setTimeout(() => setTreatmentAdded(''), 3000)
  }

  async function handleEditTreatment(e) {
    e.preventDefault()
    const form = new FormData(e.target)
    const payload = {
      name: form.get('name'),
      category: form.get('category'),
      price: Number(form.get('price')),
    }
    const updated = await updateTreatmentOption(treatmentEditTarget.id, payload)
    setTreatments((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
    setTreatmentEditTarget(null)
  }

  return (
    <div>
      <PageHeader
        title="Treatments"
        subtitle={`${filteredTreatments.length} treatment${filteredTreatments.length !== 1 ? 's' : ''} available`}
        actions={<Button icon={Stethoscope} onClick={() => setShowAddTreatment(true)}>Add Treatment</Button>}
      />

      <InventoryTabs />

      {treatmentAdded && (
        <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2 mb-4">
          <Check size={15} className="shrink-0" />
          "{treatmentAdded}" added — now available when creating an invoice in Billing.
        </div>
      )}

      <Card>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <SearchInput value={treatmentQuery} onChange={setTreatmentQuery} placeholder="Search treatments..." className="flex-1" />
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400 shrink-0" />
            <Select value={treatmentCategory} onChange={(e) => setTreatmentCategory(e.target.value)} className="w-44">
              <option value="All">All</option>
              {TREATMENT_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </Select>
          </div>
        </div>

        <Table columns={['Treatment', 'Category', 'Price', 'Actions']}>
          {treatmentsLoading && (
            <tr><td colSpan={4} className="py-10 text-center text-sm text-gray-400">Loading treatments…</td></tr>
          )}
          {!treatmentsLoading && filteredTreatments.length === 0 && (
            <tr><td colSpan={4} className="py-10 text-center text-sm text-gray-400">No treatments found.</td></tr>
          )}
          {filteredTreatments.map((t) => (
            <tr key={t.id} className="hover:bg-primary-50/40 transition">
              <td className="py-3 px-3 pl-0">
                <p className="font-semibold text-gray-800">{t.name}</p>
                <p className="text-xs text-gray-400">{t.id}</p>
              </td>
              <td className="py-3 px-3 text-gray-600">{t.category}</td>
              <td className="py-3 px-3 text-gray-600">₹{t.price.toLocaleString('en-IN')}</td>
              <td className="py-3 px-3">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setTreatmentViewTarget(t)}
                    className="p-1.5 rounded-lg text-gray-400 hover:bg-primary-100 hover:text-primary-600 transition"
                    title="View"
                  >
                    <Eye size={15} />
                  </button>
                  <button
                    onClick={() => setTreatmentEditTarget(t)}
                    className="p-1.5 rounded-lg text-gray-400 hover:bg-primary-100 hover:text-primary-600 transition"
                    title="Edit"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => setTreatmentDeleteTarget(t)}
                    className="p-1.5 rounded-lg text-gray-400 hover:bg-rose-100 hover:text-rose-600 transition"
                    title="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      </Card>

      <Modal
        open={showAddTreatment}
        onClose={() => setShowAddTreatment(false)}
        title="Add Treatment"
      >
        <form onSubmit={handleAddTreatment} className="space-y-4">
          <FormField label="Treatment Name" required>
            <TextInput name="name" required placeholder="e.g. Acne & Acne Scar Treatment" />
          </FormField>
          <FormField label="Category" required>
            <Select name="category" required defaultValue="">
              <option value="" disabled>Select category</option>
              {TREATMENT_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </Select>
          </FormField>
          <FormField label="Price (₹)" required>
            <TextInput name="price" type="number" min="0" required placeholder="0" />
          </FormField>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowAddTreatment(false)}>Cancel</Button>
            <Button type="submit">Add Treatment</Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!treatmentViewTarget}
        onClose={() => setTreatmentViewTarget(null)}
        title="Treatment Details"
      >
        {treatmentViewTarget && (
          <div className="space-y-3 text-sm">
            <DetailRow label="Treatment Name" value={treatmentViewTarget.name} />
            <DetailRow label="Treatment ID" value={treatmentViewTarget.id} />
            <DetailRow label="Category" value={treatmentViewTarget.category} />
            <DetailRow label="Price" value={`₹${treatmentViewTarget.price.toLocaleString('en-IN')}`} />
          </div>
        )}
      </Modal>

      <Modal
        open={!!treatmentEditTarget}
        onClose={() => setTreatmentEditTarget(null)}
        title="Edit Treatment"
      >
        {treatmentEditTarget && (
          <form onSubmit={handleEditTreatment} className="space-y-4">
            <FormField label="Treatment Name" required>
              <TextInput name="name" required defaultValue={treatmentEditTarget.name} />
            </FormField>
            <FormField label="Category" required>
              <Select name="category" required defaultValue={treatmentEditTarget.category}>
                {TREATMENT_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </Select>
            </FormField>
            <FormField label="Price (₹)" required>
              <TextInput name="price" type="number" min="0" required defaultValue={treatmentEditTarget.price} />
            </FormField>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setTreatmentEditTarget(null)}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        )}
      </Modal>

      <Modal
        open={!!treatmentDeleteTarget}
        onClose={() => setTreatmentDeleteTarget(null)}
        title="Delete Treatment"
        footer={
          <>
            <Button variant="outline" onClick={() => setTreatmentDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" onClick={confirmDeleteTreatment}>Delete</Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to delete <span className="font-semibold">{treatmentDeleteTarget?.name}</span>?
          This action cannot be undone.
        </p>
      </Modal>
    </div>
  )
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5 border-b border-gray-50 last:border-0">
      <span className="text-gray-400">{label}</span>
      <span className="font-medium text-gray-800 text-right">{value}</span>
    </div>
  )
}
