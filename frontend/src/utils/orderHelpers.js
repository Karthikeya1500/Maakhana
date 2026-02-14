// Order status display helpers

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "#f59e0b", icon: "⏳", step: 1 },
  confirmed: { label: "Confirmed", color: "#3b82f6", icon: "✓", step: 2 },
  preparing: { label: "Preparing", color: "#8b5cf6", icon: "🍳", step: 3 },
  ready: { label: "Ready", color: "#10b981", icon: "📦", step: 4 },
  delivered: { label: "Delivered", color: "#22c55e", icon: "✅", step: 5 },
  cancelled: { label: "Cancelled", color: "#ef4444", icon: "✗", step: 0 }
}

export const getStatusConfig = (status) => {
  return STATUS_CONFIG[status] || STATUS_CONFIG.pending
}

export const getProgressPercent = (status) => {
  const config = getStatusConfig(status)
  if (config.step === 0) return 0
  return (config.step / 5) * 100
}

export const canCancelOrder = (status) => {
  return ["pending", "confirmed"].includes(status)
}

export const isOrderComplete = (status) => {
  return ["delivered", "cancelled"].includes(status)
}
