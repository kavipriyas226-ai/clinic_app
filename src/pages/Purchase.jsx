import { useEffect, useMemo, useState } from 'react'
import { Plus, Trash2, Save, AlertCircle, CheckCircle2, History } from 'lucide-react'
import Card from '../components/common/Card.jsx'
import PageHeader from '../components/common/PageHeader.jsx'
import Button from '../components/common/Button.jsx'
import Table from '../components/common/Table.jsx'
import Badge from '../components/common/Badge.jsx'
import Modal from '../components/common/Modal.jsx'
import { FormField, TextInput, Select } from '../components/common/FormField.jsx'
import { getInventory } from '../api/inventory.js'
import { getPurchases, createPurchase, deletePurchase } from '../api/purchases.js'

// Matches the backend's fallback for a product that hasn't been given its own GST% in
// Product Master yet.
const DEFAULT_GST_PERCENT = 18
const money = (n) => `₹${(Number(n) || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`

export default function Purchase() {
  const [inventory, setInventory] = useState([])
  const [purchases, setPurchases] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const [supplierName, setSupplierName] = useState('')
  const [address, setAddress] = useState('')
  const [gstin, setGstin] = useState('')
  const [lineItems, setLineItems] = useState([])

  useEffect(() => {
    Promise.all([getInventory(), getPurchases()])
      .then(([inv, pur]) => {
        setInventory(inv)
        setPurchases(pur)
        if (inv.length > 0) setLineItems([blankLine(inv[0])])
      })
      .finally(() => setLoading(false))
  }, [])

  function blankLine(product) {
    return {
      uid: crypto.randomUUID(),
      refId: product.id,
      name: product.name,
      rate: product.price,
      qty: 1,
      gstPercent: product.gstPercent ?? DEFAULT_GST_PERCENT,
      hsnSacCode: product.hsnSacCode || null,
      taxableAmount: product.price,
    }
  }

  function addLine() {
    if (inventory.length === 0) return
    setLineItems((prev) => [...prev, blankLine(inventory[0])])
  }

  function removeLine(idx) {
    setLineItems((prev) => prev.filter((_, i) => i !== idx))
  }

  function updateLineProduct(idx, refId) {
    const product = inventory.find((i) => i.id === refId)
    if (!product) return
    setLineItems((prev) =>
      prev.map((item, i) =>
        i === idx
          ? {
              ...item,
              refId: product.id,
              name: product.name,
              rate: product.price,
              gstPercent: product.gstPercent ?? DEFAULT_GST_PERCENT,
              hsnSacCode: product.hsnSacCode || null,
              taxableAmount: product.price * item.qty,
            }
          : item
      )
    )
  }

  function updateLineQty(idx, qty) {
    setLineItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, qty, taxableAmount: item.rate * qty } : item))
    )
  }

  function updateLineRate(idx, rate) {
    setLineItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, rate, taxableAmount: rate * item.qty } : item))
    )
  }

  function updateLineTaxable(idx, taxableAmount) {
    setLineItems((prev) => prev.map((item, i) => (i === idx ? { ...item, taxableAmount } : item)))
  }

  const enrichedLineItems = useMemo(
    () =>
      lineItems.map((item) => {
        const taxable = Number(item.taxableAmount) || 0
        const pct = Number(item.gstPercent ?? DEFAULT_GST_PERCENT) || 0
        const gstAmount = (taxable * pct) / 100
        return { ...item, gstAmount, totalAmount: taxable + gstAmount }
      }),
    [lineItems]
  )

  const subtotal = enrichedLineItems.reduce((sum, i) => sum + (Number(i.taxableAmount) || 0), 0)
  const gstAmount = enrichedLineItems.reduce((sum, i) => sum + i.gstAmount, 0)
  const total = subtotal + gstAmount

  async function handleSave() {
    setError('')
    setSaved(null)
    if (!supplierName.trim()) {
      setError('Enter a supplier name before saving.')
      return
    }
    if (lineItems.length === 0) {
      setError('Add at least one product line before saving.')
      return
    }
    setSaving(true)
    try {
      const purchase = await createPurchase({
        supplierName,
        address: address || null,
        gstin: gstin || null,
        lineItems: lineItems.map((item) => ({
          refId: item.refId,
          name: item.name,
          rate: Number(item.rate) || 0,
          qty: Number(item.qty) || 1,
          taxableAmount: Number(item.taxableAmount) || 0,
        })),
      })
      setPurchases((prev) => [purchase, ...prev])
      setSaved(purchase)
      const [inv] = await Promise.all([getInventory()])
      setInventory(inv)
      setSupplierName('')
      setAddress('')
      setGstin('')
      setLineItems(inv.length > 0 ? [blankLine(inv[0])] : [])
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save the purchase. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete() {
    await deletePurchase(deleteTarget.id)
    setPurchases((prev) => prev.filter((p) => p.id !== deleteTarget.id))
    setDeleteTarget(null)
    const inv = await getInventory()
    setInventory(inv)
  }

  if (loading) {
    return (
      <Card className="text-center py-12">
        <p className="text-gray-500">Loading purchase data…</p>
      </Card>
    )
  }

  return (
    <div>
      <PageHeader title="Purchase" subtitle="Record a supplier purchase and update inventory stock" />

      {error && (
        <div className="flex items-center gap-2 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2 mb-4">
          <AlertCircle size={15} className="shrink-0" />
          {error}
        </div>
      )}

      {saved && (
        <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2 mb-4">
          <CheckCircle2 size={15} className="shrink-0" />
          Purchase {saved.id} saved — inventory stock has been updated.
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h3 className="font-bold text-gray-800 mb-4">Supplier / Party Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Supplier / Party Name" required className="col-span-2">
                <TextInput value={supplierName} onChange={(e) => setSupplierName(e.target.value)} placeholder="e.g. One Clinical Skincare Distributors" />
              </FormField>
              <FormField label="Address / Place">
                <TextInput value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Supplier address" />
              </FormField>
              <FormField label="GSTIN" hint="Optional — only if the supplier is GST-registered">
                <TextInput value={gstin} onChange={(e) => setGstin(e.target.value)} placeholder="e.g. 33ABCDE1234F1Z5" />
              </FormField>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">Products</h3>
              <Button size="sm" variant="secondary" icon={Plus} onClick={addLine} disabled={inventory.length === 0}>
                Add Product
              </Button>
            </div>

            {inventory.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No products in inventory yet — add one from the Inventory page first.</p>
            ) : (
              <div className="space-y-3">
                {enrichedLineItems.map((item, idx) => (
                  <div key={item.uid} className="p-3 rounded-xl border border-gray-100 space-y-2">
                    <div className="flex items-center gap-2">
                      <Select value={item.refId} onChange={(e) => updateLineProduct(idx, e.target.value)} className="flex-1">
                        {inventory.map((p) => (
                          <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                        ))}
                      </Select>
                      <button
                        onClick={() => removeLine(idx)}
                        className="p-1.5 rounded-lg text-gray-400 hover:bg-rose-100 hover:text-rose-600 shrink-0"
                        title="Remove"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-sm">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">HSN/SAC</p>
                        <p className="font-medium text-gray-700 py-2">{item.hsnSacCode || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">GST %</p>
                        <p className="font-medium text-gray-700 py-2">{item.gstPercent}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Qty</p>
                        <TextInput type="number" min="1" value={item.qty} onChange={(e) => updateLineQty(idx, Number(e.target.value) || 1)} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Rate</p>
                        <TextInput type="number" min="0" value={item.rate} onChange={(e) => updateLineRate(idx, Number(e.target.value) || 0)} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Taxable Amt</p>
                        <TextInput type="number" min="0" value={item.taxableAmount} onChange={(e) => updateLineTaxable(idx, Number(e.target.value) || 0)} />
                      </div>
                    </div>
                    <div className="flex justify-end gap-4 text-xs text-gray-500 pt-1">
                      <span>GST Amount: <span className="font-medium text-gray-700">{money(item.gstAmount)}</span></span>
                      <span>Total: <span className="font-semibold text-gray-800">{money(item.totalAmount)}</span></span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <Card className="h-fit">
          <h3 className="font-bold text-gray-800 mb-4">Purchase Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Taxable Amount</span>
              <span>{money(subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>GST Amount</span>
              <span>+ {money(gstAmount)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-gray-800 pt-2 border-t border-gray-100">
              <span>Total</span>
              <span>{money(total)}</span>
            </div>
          </div>
          <Button className="w-full mt-5" icon={Save} onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save Purchase'}
          </Button>
        </Card>
      </div>

      <Card className="mt-6">
        <div className="flex items-center gap-2 mb-4">
          <History size={18} className="text-primary-500" />
          <h3 className="font-bold text-gray-800">Purchase History</h3>
        </div>
        <Table columns={['Purchase #', 'Date', 'Supplier', 'Items', 'Taxable', 'GST', 'Total', 'Actions']}>
          {purchases.length === 0 && (
            <tr><td colSpan={8} className="py-10 text-center text-sm text-gray-400">No purchases recorded yet.</td></tr>
          )}
          {purchases.map((p) => (
            <tr key={p.id} className="hover:bg-primary-50/40 transition">
              <td className="py-3 px-3 pl-0 font-semibold text-gray-800">{p.id}</td>
              <td className="py-3 px-3 text-gray-600">{p.date}</td>
              <td className="py-3 px-3">
                <p className="font-medium text-gray-800">{p.supplierName}</p>
                {p.gstin && <p className="text-xs text-gray-400">GSTIN: {p.gstin}</p>}
              </td>
              <td className="py-3 px-3 text-gray-600"><Badge>{p.lineItems?.length || 0} item{(p.lineItems?.length || 0) !== 1 ? 's' : ''}</Badge></td>
              <td className="py-3 px-3 text-gray-600">{money(p.subtotal)}</td>
              <td className="py-3 px-3 text-gray-600">{money(p.gstAmount)}</td>
              <td className="py-3 px-3 font-semibold text-gray-800">{money(p.total)}</td>
              <td className="py-3 px-3">
                <button
                  onClick={() => setDeleteTarget(p)}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-rose-100 hover:text-rose-600 transition"
                  title="Delete"
                >
                  <Trash2 size={15} />
                </button>
              </td>
            </tr>
          ))}
        </Table>
      </Card>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Purchase"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" onClick={confirmDelete}>Delete</Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to delete purchase <span className="font-semibold">{deleteTarget?.id}</span>?
          The stock it added will be reversed. This action cannot be undone.
        </p>
      </Modal>
    </div>
  )
}
