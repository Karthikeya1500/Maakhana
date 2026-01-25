// Input validation helpers

export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const isStrongPassword = (password) => {
  return password && password.length >= 8
}

export const isValidRole = (role) => {
  return ["Customer", "HomeCook"].includes(role)
}

export const isValidPhone = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/
  return phoneRegex.test(phone)
}

export const sanitizeInput = (str) => {
  if (typeof str !== "string") return str
  return str.trim().replace(/[<>]/g, "")
}

export const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id)
}
