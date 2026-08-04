import { useEffect, useRef, useState } from 'react'
import { Camera, Keyboard, Check, AlertCircle, ArrowLeft, Usb } from 'lucide-react'
import Modal from '../common/Modal.jsx'
import Button from '../common/Button.jsx'
import { FormField, TextInput, Select } from '../common/FormField.jsx'
import { updateInventoryItem } from '../../api/inventory.js'

const BARCODE_FORMATS_MODULE = () => import('html5-qrcode')

/**
 * Barcode → stock workflow: scan (webcam, a USB-connected camera/phone, a USB barcode
 * scanner acting as a keyboard, or manual entry) → look the code up in the already-loaded
 * inventory list → known item gets a quantity prompt that adds to its stock, unknown codes
 * are handed back to the parent via onNotFound so it can open the Add Medicine form
 * pre-filled with the scanned code.
 */
export default function BarcodeScanFlow({ open, onClose, inventory, onStockUpdated, onNotFound }) {
  const [mode, setMode] = useState('camera')
  const [step, setStep] = useState('scan')
  const [scanCount, setScanCount] = useState(0)
  const [manualValue, setManualValue] = useState('')
  const [cameraError, setCameraError] = useState('')
  const [cameras, setCameras] = useState([])
  const [selectedCameraId, setSelectedCameraId] = useState(null)
  const [matchedItem, setMatchedItem] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [successInfo, setSuccessInfo] = useState(null)

  const scannerRef = useRef(null)
  const handledRef = useRef(false)
  const usbBufferRef = useRef('')
  const usbBufferTimeoutRef = useRef(null)

  useEffect(() => {
    if (open && mode === 'camera' && step === 'scan') {
      startCamera()
    } else {
      stopCamera()
    }
    return () => stopCamera()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mode, step, scanCount])

  // A USB barcode scanner behaves like a keyboard: it types the barcode's characters very
  // fast and finishes with Enter. This listens globally — regardless of whether the Camera
  // or Manual tab is active — so a scan is picked up the moment it happens. It steps aside
  // whenever the keystrokes are going into a real form field (the manual-entry input),
  // which already has its own identical Enter-to-submit handling.
  useEffect(() => {
    if (!open || step !== 'scan') return

    function handleGlobalKeyDown(e) {
      const tag = e.target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if (e.ctrlKey || e.altKey || e.metaKey) return

      if (e.key === 'Enter') {
        if (usbBufferRef.current.length > 0) {
          e.preventDefault()
          const code = usbBufferRef.current
          usbBufferRef.current = ''
          handleDetected(code)
        }
        return
      }

      if (e.key.length === 1) {
        usbBufferRef.current += e.key
        clearTimeout(usbBufferTimeoutRef.current)
        usbBufferTimeoutRef.current = setTimeout(() => {
          usbBufferRef.current = ''
        }, 300)
      }
    }

    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown)
      clearTimeout(usbBufferTimeoutRef.current)
      usbBufferRef.current = ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, step, scanCount])

  async function startCamera(overrideCameraId) {
    if (scannerRef.current) return
    setCameraError('')
    try {
      const { Html5Qrcode, Html5QrcodeSupportedFormats } = await BARCODE_FORMATS_MODULE()

      let cameraList = cameras
      let cameraId = overrideCameraId ?? selectedCameraId
      if (cameraList.length === 0) {
        try {
          cameraList = (await Html5Qrcode.getCameras()) || []
          setCameras(cameraList)
          if (cameraList.length > 0 && !cameraId) {
            const preferred =
              cameraList.find((d) => /back|rear|environment/i.test(d.label || '')) || cameraList[0]
            cameraId = preferred.id
            setSelectedCameraId(cameraId)
          }
        } catch {
          cameraList = []
        }
      }

      const scanner = new Html5Qrcode('barcode-scan-region')
      scannerRef.current = scanner
      const target = cameraId || { facingMode: 'environment' }
      await scanner.start(
        target,
        {
          fps: 10,
          qrbox: { width: 260, height: 140 },
          formatsToSupport: [
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.CODABAR,
            Html5QrcodeSupportedFormats.ITF,
          ],
        },
        (decodedText) => handleDetected(decodedText),
        () => {}
      )
    } catch {
      scannerRef.current = null
      setCameraError("Couldn't access the camera. Use a USB barcode scanner or type the code below instead.")
      setMode('manual')
    }
  }

  async function stopCamera() {
    const scanner = scannerRef.current
    scannerRef.current = null
    if (scanner) {
      try {
        await scanner.stop()
        scanner.clear()
      } catch {
        // already stopped
      }
    }
  }

  async function handleCameraChange(e) {
    const newId = e.target.value
    setSelectedCameraId(newId)
    await stopCamera()
    startCamera(newId)
  }

  function handleDetected(rawCode) {
    if (handledRef.current) return
    const code = String(rawCode).trim()
    if (!code) return
    handledRef.current = true
    stopCamera()

    const match = inventory.find((item) => item.barcode && item.barcode.trim() === code)
    if (match) {
      setMatchedItem(match)
      setQuantity(1)
      setError('')
      setStep('quantity')
    } else {
      handleClose()
      onNotFound(code)
    }
  }

  function handleManualKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleDetected(manualValue)
      setManualValue('')
    }
  }

  function handleScanAnother() {
    handledRef.current = false
    setMatchedItem(null)
    setManualValue('')
    setError('')
    setStep('scan')
    setScanCount((c) => c + 1)
  }

  function handleClose() {
    stopCamera()
    handledRef.current = false
    setStep('scan')
    setMode('camera')
    setMatchedItem(null)
    setManualValue('')
    setCameraError('')
    setError('')
    setSuccessInfo(null)
    setCameras([])
    setSelectedCameraId(null)
    onClose()
  }

  async function handleQuantitySubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const newStock = matchedItem.stock + Number(quantity)
      const updated = await updateInventoryItem(matchedItem.id, {
        name: matchedItem.name,
        category: matchedItem.category,
        price: matchedItem.price,
        stock: newStock,
        threshold: matchedItem.threshold,
        expiry: matchedItem.expiry,
        supplier: matchedItem.supplier,
        barcode: matchedItem.barcode,
      })
      onStockUpdated(updated)
      setSuccessInfo({ name: updated.name, added: Number(quantity), newStock: updated.stock })
      setStep('success')
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update stock.')
    } finally {
      setSaving(false)
    }
  }

  const titles = { scan: 'Scan Barcode', quantity: 'Add Stock', success: 'Stock Updated' }

  return (
    <Modal open={open} onClose={handleClose} title={titles[step]}>
      {step === 'scan' && (
        <div>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              type="button"
              onClick={() => setMode('camera')}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold border transition ${
                mode === 'camera'
                  ? 'bg-primary-500 text-white border-primary-500 shadow-soft'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'
              }`}
            >
              <Camera size={15} /> Camera
            </button>
            <button
              type="button"
              onClick={() => setMode('manual')}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold border transition ${
                mode === 'manual'
                  ? 'bg-primary-500 text-white border-primary-500 shadow-soft'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'
              }`}
            >
              <Keyboard size={15} /> Manual Entry
            </button>
          </div>

          <p className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
            <Usb size={13} className="shrink-0" />
            A USB barcode scanner works automatically from either tab — just scan.
          </p>

          {mode === 'camera' && (
            <div>
              {cameras.length > 1 && (
                <FormField label="Camera" className="mb-3">
                  <Select value={selectedCameraId || ''} onChange={handleCameraChange}>
                    {cameras.map((c) => (
                      <option key={c.id} value={c.id}>{c.label || c.id}</option>
                    ))}
                  </Select>
                </FormField>
              )}
              <div id="barcode-scan-region" className="rounded-xl overflow-hidden bg-gray-900 min-h-[220px]" />
              <p className="text-xs text-gray-400 mt-2 text-center">
                Point the camera at the medicine's barcode. Works with a built-in webcam or a
                USB-connected camera / phone.
              </p>
              {cameraError && (
                <div className="flex items-center gap-2 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2 mt-3">
                  <AlertCircle size={15} className="shrink-0" /> {cameraError}
                </div>
              )}
            </div>
          )}

          {mode === 'manual' && (
            <div>
              <FormField
                label="Scan or type the barcode"
                hint="A USB barcode scanner types the code automatically and submits it. Or type the code and press Enter."
              >
                <TextInput
                  key={scanCount}
                  value={manualValue}
                  onChange={(e) => setManualValue(e.target.value)}
                  onKeyDown={handleManualKeyDown}
                  placeholder="e.g. 8901030826829"
                  autoFocus
                />
              </FormField>
              <div className="flex justify-end mt-3">
                <Button
                  type="button"
                  onClick={() => {
                    handleDetected(manualValue)
                    setManualValue('')
                  }}
                  disabled={!manualValue.trim()}
                >
                  Submit
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {step === 'quantity' && matchedItem && (
        <form onSubmit={handleQuantitySubmit} className="space-y-4">
          <button
            type="button"
            onClick={handleScanAnother}
            className="flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-primary-600 transition"
          >
            <ArrowLeft size={13} /> Not the right item? Scan again
          </button>

          <div className="rounded-xl bg-primary-50/50 border border-primary-100 p-3">
            <p className="font-semibold text-gray-800">{matchedItem.name}</p>
            <p className="text-xs text-gray-400">{matchedItem.id} · {matchedItem.category}</p>
            <p className="text-sm text-gray-600 mt-1">Current stock: {matchedItem.stock} units</p>
          </div>

          <FormField label="Quantity to add" required>
            <TextInput
              type="number"
              min="1"
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              autoFocus
            />
          </FormField>

          {error && (
            <div className="flex items-center gap-2 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
              <AlertCircle size={15} className="shrink-0" /> {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={saving}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Updating…' : 'Add to Stock'}</Button>
          </div>
        </form>
      )}

      {step === 'success' && successInfo && (
        <div className="text-center py-4">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <Check size={28} />
          </div>
          <h4 className="font-bold text-gray-800 text-lg">Stock updated</h4>
          <p className="text-sm text-gray-500 mt-1">
            Added {successInfo.added} unit{successInfo.added === 1 ? '' : 's'} to{' '}
            <span className="font-semibold text-gray-700">{successInfo.name}</span>.
            <br />
            New stock: {successInfo.newStock} units.
          </p>
          <div className="flex justify-center gap-2 mt-6">
            <Button variant="outline" onClick={handleClose}>Done</Button>
            <Button onClick={handleScanAnother}>Scan Another</Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
