// Image upload helper functions

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"]
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

export const validateImage = (file) => {
  if (!file) return { valid: false, error: "No file provided" }
  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    return { valid: false, error: "Only JPG, PNG, and WebP images are allowed" }
  }
  if (file.size > MAX_SIZE) {
    return { valid: false, error: "File size must be under 5MB" }
  }
  return { valid: true, error: null }
}

export const getPublicIdFromUrl = (url) => {
  if (!url) return null
  const parts = url.split("/")
  const filename = parts[parts.length - 1]
  return filename.split(".")[0]
}
