// Formatting utility functions

export const formatPrice = (price) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price)
}

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  })
}

export const formatTime = (dateString) => {
  return new Date(dateString).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit"
  })
}

export const formatOrderId = (id) => {
  if (!id) return ""
  return "#" + id.slice(-8).toUpperCase()
}

export const truncateText = (text, maxLength = 80) => {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength) + "..."
}
