import type { MiddlewareHandler } from 'hono'

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

interface RateLimitOptions {
  windowMs: number
  maxRequests: number
  message?: string
  keyGenerator?: (c: any) => string
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
}

class MemoryStore {
  private store: RateLimitStore = {}

  get(key: string): { count: number; resetTime: number } | undefined {
    const record = this.store[key]
    if (!record) return undefined

    // Clean up expired entries
    if (Date.now() > record.resetTime) {
      delete this.store[key]
      return undefined
    }

    return record
  }

  set(key: string, value: { count: number; resetTime: number }): void {
    this.store[key] = value
  }

  increment(key: string, windowMs: number): { count: number; resetTime: number } {
    const now = Date.now()
    const existing = this.get(key)

    if (!existing) {
      const record = { count: 1, resetTime: now + windowMs }
      this.set(key, record)
      return record
    }

    existing.count++
    this.set(key, existing)
    return existing
  }

  // Clean up expired entries periodically
  cleanup(): void {
    const now = Date.now()
    for (const [key, record] of Object.entries(this.store)) {
      if (now > record.resetTime) {
        delete this.store[key]
      }
    }
  }
}

const store = new MemoryStore()

// Clean up expired entries every 5 minutes
setInterval(() => store.cleanup(), 5 * 60 * 1000)

function createRateLimiter(options: RateLimitOptions): MiddlewareHandler {
  const {
    windowMs,
    maxRequests,
    message = 'Too many requests, please try again later.',
    keyGenerator = (c) => {
      // Use IP address as default key
      const forwarded = c.req.header('x-forwarded-for')
      const ip = forwarded ? forwarded.split(',')[0].trim() :
                 c.req.header('x-real-ip') || 'unknown'
      return `rate_limit:${ip}`
    },
    skipSuccessfulRequests = false,
    skipFailedRequests = false
  } = options

  return async (c, next) => {
    const key = keyGenerator(c)
    const record = store.increment(key, windowMs)

    // Add rate limit headers
    const resetTime = Math.ceil(record.resetTime / 1000)
    const remaining = Math.max(0, maxRequests - record.count)

    c.header('X-RateLimit-Limit', maxRequests.toString())
    c.header('X-RateLimit-Remaining', remaining.toString())
    c.header('X-RateLimit-Reset', resetTime.toString())
    c.header('X-RateLimit-Window', windowMs.toString())

    // Check if limit exceeded
    if (record.count > maxRequests) {
      c.header('Retry-After', Math.ceil((record.resetTime - Date.now()) / 1000).toString())

      return c.json({
        error: 'Too Many Requests',
        message,
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil((record.resetTime - Date.now()) / 1000),
        limit: maxRequests,
        window: windowMs
      }, 429)
    }

    // Continue to next middleware
    await next()

    // Optionally skip counting based on response
    if (skipSuccessfulRequests && c.res.status >= 200 && c.res.status < 400) {
      record.count--
      store.set(key, record)
    }

    if (skipFailedRequests && c.res.status >= 400) {
      record.count--
      store.set(key, record)
    }
  }
}

// Default rate limiter (100 requests per 15 minutes)
export const rateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
  message: 'Too many requests from this IP, please try again later.'
})

// Strict rate limiter for auth endpoints (5 requests per 15 minutes)
export const strictRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true // Don't count successful logins against the limit
})

// Lenient rate limiter for read operations (1000 requests per hour)
export const readRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 1000,
  message: 'Too many requests, please slow down.'
})

// Upload rate limiter (10 uploads per hour)
export const uploadRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 10,
  message: 'Upload limit exceeded, please try again later.',
  keyGenerator: (c) => {
    // Use both IP and user ID for uploads if authenticated
    const forwarded = c.req.header('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0].trim() :
               c.req.header('x-real-ip') || 'unknown'
    const userId = c.get('userId') // Assuming auth middleware sets this
    return `upload_limit:${ip}:${userId || 'anonymous'}`
  }
})

export { createRateLimiter }
