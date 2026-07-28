import { useMemo, useState } from 'react'
import { PackagePlus, Filter, AlertTriangle } from 'lucide-react'
import Card from '../components/common/Card.jsx'
import PageHeader from '../components/common/PageHeader.jsx'
import SearchInput from '../components/common/SearchInput.jsx'
import Table from '../components/common/Table.jsx'
import Badge from '../components/common/Badge.jsx'
import Button from '../components/common/Button.jsx'
import Modal from '../components/common/Modal.jsx'
import { FormField, TextInput, Select } from '../components/common/FormField.jsx'
import { inventory as mockInventory } from '../data/mockData.js'

export default function Inventory() {
  const [inventory, setInventory] = useState(mockInventory)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [showAdd, setShowAdd] = useState(false)

  const categories = ['All', ...new Set(mockInventory.map((i) => i.category))]

  const filtered = useMemo(() => {
    return inventory.filter((i) => {
      const matchesQuery = i.name.toLowerCase().includes(query.toLowerCase()) || i.id.toLowerCase().includes(query.toLowerCase())
      const matchesCategory = category === 'All' || i.category === category
      return matchesQuery && matchesCategory
    })
  }, [inventory, query, category])

  function isExpiringSoon(expiry) {
    const diff = (new Date(expiry) - new Date('2026-07-28')) / (1000 * 60 * 60 * 24)
    return diff <= 60
  }

  function handleAdd(e) {
    e.preventDefault()
    const form = new FormData(e.target)
    const newItem = {
      id: `MED-${Math.floor(Math.random() * 900 + 100)}`,
      name: form.get('name'),
      category: form.get('category'),
      stock: Number(form.get('stock')),
      threshold: Number(form.get('threshold')),
      expiry: form.get('expiry'),
      supplier: form.get('supplier'),
    }
    setInventory((prev) => [newItem, ...prev])
    setShowAdd(false)
  }

  return (
    <div>
      <PageHeader
        title="Inventory"
        subtitle={`${filtered.length} item${filtered.length !== 1 ? 's' : ''} in stock`}
        actions={<Button icon={PackagePlus} onClick={() => setShowAdd(true)}>Add Medicine</Button>}
      />

      <Card>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <SearchInput value={query} onChange={setQuery} placeholder="Search medicines..." className="flex-1" />
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400 shrink-0" />
            <Select value={category} onChange={(e) => setCategory(e.target.value)} className="w-44">
              {categories.map((c) => <option key={c}>{c}</option>)}
            </Select>
          </div>
        </div>

        <Table columns={['Medicine', 'Category', 'Stock', 'Expiry', 'Supplier', 'Status']}>
          {filtered.length === 0 && (
            <tr><td colSpan={6} className="py-10 text-center text-sm text-gray-400">No medicines found.</td></tr>
          )}
          {filtered.map((item) => {
            const low = item.stock <= item.threshold
            const expiring = isExpiringSoon(item.expiry)
            return (
              <tr key={item.id} className="hover:bg-primary-50/40 transition">
                <td className="py-3 px-3 pl-0">
                  <p className="font-semibold text-gray-800">{item.name}</p>
                  <p className="text-xs text-gray-400">{item.id}</p>
                </td>
                <td className="py-3 px-3 text-gray-600">{item.category}</td>
                <td className="py-3 px-3 text-gray-600">{item.stock} units</td>
                <td className="py-3 px-3 text-gray-600">
                  <span className="flex items-center gap-1.5">
                    {expiring && <AlertTriangle size={13} className="text-amber-500" />}
                    {item.expiry}
                  </span>
                </td>
                <td className="py-3 px-3 text-gray-600">{item.supplier}</td>
                <td className="py-3 px-3">
                  {low ? <Badge color="red">Low Stock</Badge> : <Badge color="green">In Stock</Badge>}
                </td>
              </tr>
            )
          })}
        </Table>
      </Card>

      <Modal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        title="Add Medicine"
      >
        <form onSubmit={handleAdd} className="space-y-4">
          <FormField label="Medicine Name" required>
            <TextInput name="name" required placeholder="e.g. Adapalene 0.1% Gel" />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Category" required>
              <Select name="category" required defaultValue="">
                <option value="" disabled>Select category</option>
                <option>Topical</option>
                <option>Hair Care</option>
                <option>Skin Care</option>
                <option>Supplement</option>
              </Select>
            </FormField>
            <FormField label="Stock Quantity" required>
              <TextInput name="stock" type="number" min="0" required placeholder="0" />
            </FormField>
            <FormField label="Low Stock Threshold" required>
              <TextInput name="threshold" type="number" min="0" required placeholder="0" />
            </FormField>
            <FormField label="Expiry Date" required>
              <TextInput name="expiry" type="date" required />
            </FormField>
          </div>
          <FormField label="Supplier" required>
            <TextInput name="supplier" required placeholder="e.g. Zenith Pharma Distributors" />
          </FormField>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button type="submit">Add Medicine</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
