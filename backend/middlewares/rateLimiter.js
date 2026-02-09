// Simple in-memory rate limiter for auth routes
// Prevents brute force attacks on login/OTP endpoints

const attempts = new Map()

const rateLimiter = (maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  return (req, res, next) => {
    const key = req.ip + req.path
    const now = Date.now()
    const record = attempts.get(key)

    if (record) {
      // Clean up expired entries
      if (now - record.firstAttempt > windowMs) {
        attempts.set(key, { count: 1, firstAttempt: now })
        return next()
      }

      if (record.count >= maxAttempts) {
        const retryAfter = Math.ceil((record.firstAttempt + windowMs - now) / 1000)
        return res.status(429).json({
          message: `Too many attempts. Try again in ${Math.ceil(retryAfter / 60)} minutes.`
        })
      }

      record.count++
    } else {
      attempts.set(key, { count: 1, firstAttempt: now })
    }

    next()
  }
}

export default rateLimiter
