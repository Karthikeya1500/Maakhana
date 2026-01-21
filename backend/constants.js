// Application-wide constants

export const ROLES = {
  CUSTOMER: "Customer",
  HOMECOOK: "HomeCook"
}

export const ORDER_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PREPARING: "preparing",
  READY: "ready",
  DELIVERED: "delivered",
  CANCELLED: "cancelled"
}

export const FOOD_CATEGORIES = [
  "Snacks",
  "Main Course",
  "Desserts",
  "Breakfast",
  "Sides & Pickles",
  "South Indian",
  "North Indian",
  "Chinese",
  "Fast Food",
  "Beverages",
  "Others"
]

export const SPICE_LEVELS = {
  MILD: 1,
  MEDIUM: 2,
  HOT: 3
}

export const TOKEN_EXPIRY = "9d"
export const OTP_EXPIRY_MINUTES = 5
export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
export const SALT_ROUNDS = 10
