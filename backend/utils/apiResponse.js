// Standardized API response helpers

export const successResponse = (res, data, message = "Success", statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  })
}

export const errorResponse = (res, message = "Something went wrong", statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message
  })
}

export const validationError = (res, message = "Validation failed") => {
  return res.status(400).json({
    success: false,
    message
  })
}

export const notFoundError = (res, resource = "Resource") => {
  return res.status(404).json({
    success: false,
    message: `${resource} not found`
  })
}
