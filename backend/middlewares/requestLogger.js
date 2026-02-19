// Simple request logger for development
// Logs method, path, status code and response time

const requestLogger = (req, res, next) => {
  if (process.env.NODE_ENV === "production") return next()

  const start = Date.now()
  const originalEnd = res.end

  res.end = function (...args) {
    const duration = Date.now() - start
    const status = res.statusCode
    const color = status >= 400 ? "\x1b[31m" : "\x1b[32m"
    console.log(`${color}${req.method}\x1b[0m ${req.path} → ${status} (${duration}ms)`)
    originalEnd.apply(res, args)
  }

  next()
}

export default requestLogger
