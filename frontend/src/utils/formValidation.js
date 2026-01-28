// Client-side form validation utilities

export const validateEmail = (email) => {
  if (!email) return "Email is required"
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) return "Please enter a valid email"
  return null
}

export const validatePassword = (password) => {
  if (!password) return "Password is required"
  if (password.length < 8) return "Password must be at least 8 characters"
  return null
}

export const validateName = (name) => {
  if (!name || !name.trim()) return "Name is required"
  if (name.trim().length < 2) return "Name must be at least 2 characters"
  return null
}

export const validatePhone = (phone) => {
  if (!phone) return null // phone is optional
  const phoneRegex = /^[6-9]\d{9}$/
  if (!phoneRegex.test(phone)) return "Enter a valid 10-digit phone number"
  return null
}

export const validatePrice = (price) => {
  if (!price && price !== 0) return "Price is required"
  if (isNaN(price) || Number(price) < 0) return "Price must be a positive number"
  return null
}
