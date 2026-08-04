import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PackagePlus, ScanBarcode, Stethoscope, AlertTriangle, ArrowRight } from 'lucide-react'
import Card from '../components/common/Card.jsx'
import PageHeader from '../components/common/PageHeader.jsx'
import Button from '../components/common/Button.jsx'
import InventoryTabs from '../components/inventory/InventoryTabs.jsx'
import { getInventory } from '../api/inventory.js'
import { getTreatmentOptions } from '../api/treatments.js'

export default function Inventory() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [medicineCount, setMedicineCount] = useState(0)
  const [lowStockCount, setLowStockCount] = useState(0)
  const [treatmentCount, setTreatmentCount] = useState(0)

  useEffect(() => {
    Promise.all([getInventory(), getTreatmentOptions()])
      .then(([inventory, treatments]) => {
        setMedicineCount(inventory.length)
        setLowStockCount(inventory.filter((item) => item.stock <= item.threshold).length)
        setTreatmentCount(treatments.length)
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <PageHeader
        title="Inventory"
        subtitle="Manage medicines and treatments offered at your clinic"
        actions={
          <Button
            icon={ScanBarcode}
            onClick={() => navigate('/inventory/medicines', { state: { autoOpenScan: true } })}
          >
            Scan Barcode
          </Button>
        }
      />

      <InventoryTabs />

      <div className="grid sm:grid-cols-2 gap-6">
        <button onClick={() => navigate('/inventory/medicines')} className="text-left">
          <Card className="h-full transition hover:shadow-card hover:-translate-y-0.5">
            <div className="flex items-start justify-between">
              <div className="w-11 h-11 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                <PackagePlus size={20} />
              </div>
              <ArrowRight size={18} className="text-gray-300" />
            </div>
            <h3 className="font-bold text-gray-800 text-lg mt-4">Medicines</h3>
            <p className="text-sm text-gray-400 mt-1">Manage medicine stock, pricing, and suppliers</p>
            <div className="flex items-center gap-4 mt-4 text-sm">
              <span className="text-gray-500">{loading ? '—' : medicineCount} medicine{medicineCount === 1 ? '' : 's'}</span>
              {!loading && lowStockCount > 0 && (
                <span className="flex items-center gap-1 text-rose-600 font-medium">
                  <AlertTriangle size={13} /> {lowStockCount} low stock
                </span>
              )}
            </div>
          </Card>
        </button>

        <button onClick={() => navigate('/inventory/treatments')} className="text-left">
          <Card className="h-full transition hover:shadow-card hover:-translate-y-0.5">
            <div className="flex items-start justify-between">
              <div className="w-11 h-11 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                <Stethoscope size={20} />
              </div>
              <ArrowRight size={18} className="text-gray-300" />
            </div>
            <h3 className="font-bold text-gray-800 text-lg mt-4">Treatments</h3>
            <p className="text-sm text-gray-400 mt-1">Manage treatment options and pricing</p>
            <div className="flex items-center gap-4 mt-4 text-sm">
              <span className="text-gray-500">{loading ? '—' : treatmentCount} treatment{treatmentCount === 1 ? '' : 's'}</span>
            </div>
          </Card>
        </button>
      </div>
    </div>
  )
}
