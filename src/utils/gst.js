// Shared by the Auditor reports only — mirrors (without touching) the calculation already
// used for display in Billing.jsx: whatever the invoice's total gstAmount is (now the sum of
// each line's own GST%, not a single flat rate), it's split evenly into CGST + SGST. Invoice
// only stores a single combined gstAmount; there is no independent CGST/SGST source of truth
// to diverge from.
export function splitGst(gstAmount) {
  const amount = Number(gstAmount) || 0
  return { cgst: amount / 2, sgst: amount / 2 }
}
