import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { PackagePlus, Filter, AlertTriangle, Eye, Pencil, Trash2 } from 'lucide-react'
import Card from '../components/common/Card.jsx'
import PageHeader from '../components/common/PageHeader.jsx'
import SearchInput from '../components/common/SearchInput.jsx'
import Table from '../components/common/Table.jsx'
import Badge from '../components/common/Badge.jsx'
import Button from '../components/common/Button.jsx'
import Modal from '../components/common/Modal.jsx'
import { FormField, TextInput, Select } from '../components/common/FormField.jsx'
import InventoryTabs from '../components/inventory/InventoryTabs.jsx'
import { getInventory, createInventoryItem, updateInventoryItem, deleteInventoryItem } from '../api/inventory.js'

export default function InventoryMedicines() {
  const location = useLocation()
  const navigate = useNavigate()
  const editItemId = location.state?.editItemId

  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [stockStatus, setStockStatus] = useState('All')
  const [showAdd, setShowAdd] = useState(false)
  const [viewTarget, setViewTarget] = useState(null)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const autoEditHandled = useRef(false)

  useEffect(() => {
    getInventory()
      .then(setInventory)
      .finally(() => setLoading(false))
  }, [])

  // Arrived here from a low-stock notification click — open that medicine's Edit modal
  // directly, exactly once. Without the "handled" guard, saving/closing the modal would
  // re-trigger this on the next inventory refresh (location.state persists across
  // re-renders) and immediately reopen it.
  useEffect(() => {
    if (!editItemId || inventory.length === 0 || autoEditHandled.current) return
    const target = inventory.find((i) => i.id === editItemId)
    if (target) {
      setEditTarget(target)
      autoEditHandled.current = true
      // Strip editItemId from history state so a later refresh of this page doesn't
      // reopen the same item's editor again.
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [editItemId, inventory, location.pathname, navigate])

  const categories = ['All', ...new Set(inventory.map((i) => i.category))]

  const filtered = useMemo(() => {
    return inventory.filter((i) => {
      const matchesQuery = i.name.toLowerCase().includes(query.toLowerCase()) || i.id.toLowerCase().includes(query.toLowerCase())
      const matchesCategory = category === 'All' || i.category === category
      const low = i.stock <= i.threshold
      const matchesStockStatus =
        stockStatus === 'All' || (stockStatus === 'Low Stock' ? low : !low)
      return matchesQuery && matchesCategory && matchesStockStatus
    })
  }, [inventory, query, category, stockStatus])

  function isExpiringSoon(expiry) {
    const diff = (new Date(expiry) - new Date('2026-07-28')) / (1000 * 60 * 60 * 24)
    return diff <= 60
  }

  async function handleAdd(e) {
    e.preventDefault()
    const form = new FormData(e.target)
    const payload = {
      name: form.get('name'),
      category: form.get('category'),
      price: Number(form.get('price')),
      stock: Number(form.get('stock')),
      threshold: Number(form.get('threshold')),
      expiry: form.get('expiry'),
      supplier: form.get('supplier'),
    }
    const created = await createInventoryItem(payload)
    setInventory((prev) => [created, ...prev])
    setShowAdd(false)
  }

  async function handleEdit(e) {
    e.preventDefault()
    const form = new FormData(e.target)
    const payload = {
      name: form.get('name'),
      category: form.get('category'),
      price: Number(form.get('price')),
      stock: Number(form.get('stock')),
      threshold: Number(form.get('threshold')),
      expiry: form.get('expiry'),
      supplier: form.get('supplier'),
    }
    const updated = await updateInventoryItem(editTarget.id, payload)
    setInventory((prev) => prev.map((i) => (i.id === updated.id ? updated : i)))
    setEditTarget(null)
  }

  async function confirmDelete() {
    await deleteInventoryItem(deleteTarget.id)
    setInventory((prev) => prev.filter((i) => i.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  return (
    <div>
      <PageHeader
        title="Medicines"
        subtitle={`${filtered.length} item${filtered.length !== 1 ? 's' : ''} in stock`}
        actions={<Button icon={PackagePlus} onClick={() => setShowAdd(true)}>Add Medicine</Button>}
      />

      <InventoryTabs />

      <Card>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <SearchInput value={query} onChange={setQuery} placeholder="Search medicines..." className="flex-1" />
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400 shrink-0" />
            <Select value={category} onChange={(e) => setCategory(e.target.value)} className="w-44">
              {categories.map((c) => <option key={c}>{c}</option>)}
            </Select>
            <Select value={stockStatus} onChange={(e) => setStockStatus(e.target.value)} className="w-40">
              <option value="All">All</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
            </Select>
          </div>
        </div>

        <Table columns={['Medicine', 'Category', 'Price', 'Stock', 'Expiry', 'Supplier', 'Status', 'Actions']}>
          {loading && (
            <tr><td colSpan={8} className="py-10 text-center text-sm text-gray-400">Loading inventory…</td></tr>
          )}
          {!loading && filtered.length === 0 && (
            <tr><td colSpan={8} className="py-10 text-center text-sm text-gray-400">No medicines found.</td></tr>
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
                <td className="py-3 px-3 text-gray-600">₹{item.price.toLocaleString('en-IN')}</td>
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
                <td className="py-3 px-3">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setViewTarget(item)}
                      className="p-1.5 rounded-lg text-gray-400 hover:bg-primary-100 hover:text-primary-600 transition"
                      title="View"
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      onClick={() => setEditTarget(item)}
                      className="p-1.5 rounded-lg text-gray-400 hover:bg-primary-100 hover:text-primary-600 transition"
                      title="Edit"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(item)}
                      className="p-1.5 rounded-lg text-gray-400 hover:bg-rose-100 hover:text-rose-600 transition"
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
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
            <FormField label="Price (₹)" required>
              <TextInput name="price" type="number" min="0" required placeholder="0" />
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
            <TextInput name="supplier" required placeholder="e.g. One Clinical Skincare Distributors" />
          </FormField>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button type="submit">Add Medicine</Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!viewTarget}
        onClose={() => setViewTarget(null)}
        title="Medicine Details"
      >
        {viewTarget && (
          <div className="space-y-3 text-sm">
            <DetailRow label="Medicine Name" value={viewTarget.name} />
            <DetailRow label="Medicine ID" value={viewTarget.id} />
            <DetailRow label="Category" value={viewTarget.category} />
            <DetailRow label="Price" value={`₹${viewTarget.price.toLocaleString('en-IN')}`} />
            <DetailRow label="Stock" value={`${viewTarget.stock} units (threshold ${viewTarget.threshold})`} />
            <DetailRow label="Expiry Date" value={viewTarget.expiry} />
            <DetailRow label="Supplier" value={viewTarget.supplier} />
            <DetailRow
              label="Status"
              value={viewTarget.stock <= viewTarget.threshold ? 'Low Stock' : 'In Stock'}
            />
          </div>
        )}
      </Modal>

      <Modal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        title="Edit Medicine"
      >
        {editTarget && (
          <form onSubmit={handleEdit} className="space-y-4">
            <FormField label="Medicine Name" required>
              <TextInput name="name" required defaultValue={editTarget.name} />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Category" required>
                <Select name="category" required defaultValue={editTarget.category}>
                  <option>Topical</option>
                  <option>Hair Care</option>
                  <option>Skin Care</option>
                  <option>Supplement</option>
                </Select>
              </FormField>
              <FormField label="Price (₹)" required>
                <TextInput name="price" type="number" min="0" required defaultValue={editTarget.price} />
              </FormField>
              <FormField label="Stock Quantity" required>
                <TextInput name="stock" type="number" min="0" required defaultValue={editTarget.stock} />
              </FormField>
              <FormField label="Low Stock Threshold" required>
                <TextInput name="threshold" type="number" min="0" required defaultValue={editTarget.threshold} />
              </FormField>
              <FormField label="Expiry Date" required>
                <TextInput name="expiry" type="date" required defaultValue={editTarget.expiry} />
              </FormField>
            </div>
            <FormField label="Supplier" required>
              <TextInput name="supplier" required defaultValue={editTarget.supplier} />
            </FormField>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setEditTarget(null)}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        )}
      </Modal>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Medicine"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" onClick={confirmDelete}>Delete</Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to delete <span className="font-semibold">{deleteTarget?.name}</span>?
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
