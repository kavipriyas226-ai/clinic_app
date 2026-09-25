// Shared by the Auditor reports only — mirrors (without touching) the calculation already
// used for display in Billing.jsx: GST is a flat 18%, split evenly into CGST 9% + SGST 9%.
// Invoice only stores a single combined gstAmount; there is no independent CGST/SGST source
// of truth to diverge from.
export function splitGst(gstAmount) {
  const amount = Number(gstAmount) || 0
  return { cgst: amount / 2, sgst: amount / 2 }
}
