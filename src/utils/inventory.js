/** Shared stock-status and expiry helpers used across the Inventory Dashboard, Medicines list, and their filters. */

export function getStockStatus(item) {
  if (item.stock <= 0) return 'Out of Stock'
  if (item.stock <= item.threshold) return 'Low Stock'
  return 'In Stock'
}

export function daysUntilExpiry(expiry) {
  return (new Date(expiry) - new Date()) / (1000 * 60 * 60 * 24)
}

export function isExpiringSoon(expiry) {
  return daysUntilExpiry(expiry) <= 60
}
