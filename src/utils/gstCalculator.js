// Single source of truth for invoice GST math on the frontend. Billing.jsx's on-screen
// Invoice Summary and its printed invoice both call this same function with the same
// state, so they can never show different numbers from each other. Mirrors the backend's
// GstCalculator.java exactly (same per-line discount allocation, same per-line GST at
// that line's own rate, same CGST+SGST vs IGST split, same rounding) so what you see
// while building the invoice always matches what gets saved.

export function round2(value) {
  return Math.round((Number(value) || 0) * 100) / 100
}

/**
 * @param {Array<{amount:number, gstRate?:number}>} lineItems
 * @param {boolean} discountEnabled
 * @param {number} discountPercent
 * @param {boolean} gstEnabled
 * @param {'Intra-State'|'Inter-State'} supplyType
 */
export function calculateGst(lineItems, discountEnabled, discountPercent, gstEnabled, supplyType) {
  const interState = supplyType === 'Inter-State'

  let subtotal = 0
  let discountAmount = 0
  let cgstAmount = 0
  let sgstAmount = 0
  let igstAmount = 0

  const computedLineItems = (lineItems || []).map((item) => {
    const lineAmount = Number(item.amount) || 0
    const lineDiscount = discountEnabled ? round2((lineAmount * discountPercent) / 100) : 0
    const taxableAmount = round2(lineAmount - lineDiscount)
    const rate = gstEnabled ? Number(item.gstRate) || 0 : 0
    const gstAmt = round2((taxableAmount * rate) / 100)

    let cgst = 0
    let sgst = 0
    let igst = 0
    if (gstEnabled && rate > 0) {
      if (interState) {
        igst = gstAmt
      } else {
        cgst = round2(gstAmt / 2)
        sgst = round2(gstAmt - cgst) // derive, not round independently, so cgst+sgst === gstAmt
      }
    }

    subtotal += lineAmount
    discountAmount += lineDiscount
    cgstAmount += cgst
    sgstAmount += sgst
    igstAmount += igst

    return { ...item, gstRate: rate, taxableAmount, cgstAmount: cgst, sgstAmount: sgst, igstAmount: igst, gstAmount: gstAmt }
  })

  subtotal = round2(subtotal)
  discountAmount = round2(discountAmount)
  cgstAmount = round2(cgstAmount)
  sgstAmount = round2(sgstAmount)
  igstAmount = round2(igstAmount)
  const totalGst = round2(cgstAmount + sgstAmount + igstAmount)
  const taxableTotal = round2(subtotal - discountAmount)
  const total = round2(taxableTotal + totalGst)

  // Rate-wise breakdown for the invoice summary: one row per distinct GST rate actually
  // in use (only among GST-enabled, rate>0 lines), so an invoice mixing e.g. 5%/12%/18%
  // items shows each rate's own CGST/SGST or IGST instead of one misleading blended line.
  const rateMap = new Map()
  if (gstEnabled) {
    computedLineItems.forEach((item) => {
      if (item.gstRate <= 0) return
      const key = item.gstRate
      const existing = rateMap.get(key) || { rate: key, taxableAmount: 0, cgstAmount: 0, sgstAmount: 0, igstAmount: 0, gstAmount: 0 }
      existing.taxableAmount = round2(existing.taxableAmount + item.taxableAmount)
      existing.cgstAmount = round2(existing.cgstAmount + item.cgstAmount)
      existing.sgstAmount = round2(existing.sgstAmount + item.sgstAmount)
      existing.igstAmount = round2(existing.igstAmount + item.igstAmount)
      existing.gstAmount = round2(existing.gstAmount + item.gstAmount)
      rateMap.set(key, existing)
    })
  }
  const rateBreakdown = Array.from(rateMap.values()).sort((a, b) => a.rate - b.rate)

  return {
    lineItems: computedLineItems,
    subtotal,
    discountAmount,
    taxableTotal,
    cgstAmount,
    sgstAmount,
    igstAmount,
    totalGst,
    total,
    interState,
    rateBreakdown,
  }
}

export const GST_RATE_OPTIONS = [0, 5, 12, 18, 28]
