import type { ErrorHandler } from 'hono'
import type { StatusCode } from 'hono/utils/http-status'

export interface ApiError extends Error {
  status?: StatusCode
  code?: string
  details?: any
}

export const errorHandler: ErrorHandler = (err, c) => {
  console.error('API Error:', err)

  // Handle known API errors
  if (err instanceof Error) {
    const apiError = err as ApiError

    // Database errors
    if (err.message.includes('UNIQUE constraint failed')) {
      return c.json({
        error: 'Conflict',
        message: 'Resource already exists',
        code: 'DUPLICATE_RESOURCE',
        path: c.req.path,
        method: c.req.method
      }, 409)
    }

    // Validation errors
    if (err.message.includes('validation') || err.message.includes('Invalid')) {
      return c.json({
        error: 'Bad Request',
        message: err.message,
        code: 'VALIDATION_ERROR',
        path: c.req.path,
        method: c.req.method
      }, 400)
    }

    // Authentication errors
    if (err.message.includes('Unauthorized') || err.message.includes('token')) {
      return c.json({
        error: 'Unauthorized',
        message: 'Authentication required',
        code: 'AUTH_ERROR',
        path: c.req.path,
        method: c.req.method
      }, 401)
    }

    // Permission errors
    if (err.message.includes('Forbidden') || err.message.includes('permission')) {
      return c.json({
        error: 'Forbidden',
        message: 'Insufficient permissions',
        code: 'PERMISSION_ERROR',
        path: c.req.path,
        method: c.req.method
      }, 403)
    }

    // Not found errors
    if (err.message.includes('not found') || err.message.includes('Not found')) {
      return c.json({
        error: 'Not Found',
        message: err.message,
        code: 'NOT_FOUND',
        path: c.req.path,
        method: c.req.method
      }, 404)
    }

    // Custom status code
    if (apiError.status) {
      return c.json({
        error: 'Error',
        message: err.message,
        code: apiError.code || 'CUSTOM_ERROR',
        details: apiError.details,
        path: c.req.path,
        method: c.req.method
      }, apiError.status)
    }
  }

  // Default to 500 Internal Server Error
  return c.json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development'
      ? err.message
      : 'Something went wrong',
    code: 'INTERNAL_ERROR',
    path: c.req.path,
    method: c.req.method,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack
    })
  }, 500)
}

// Helper function to create API errors
export function createApiError(
  message: string,
  status: StatusCode = 500,
  code?: string,
  details?: any
): ApiError {
  const error = new Error(message) as ApiError
  error.status = status
  error.code = code
  error.details = details
  return error
}

// Common error creators
export const errors = {
  notFound: (resource: string = 'Resource') =>
    createApiError(`${resource} not found`, 404, 'NOT_FOUND'),

  unauthorized: (message: string = 'Authentication required') =>
    createApiError(message, 401, 'UNAUTHORIZED'),

  forbidden: (message: string = 'Insufficient permissions') =>
    createApiError(message, 403, 'FORBIDDEN'),

  badRequest: (message: string, details?: any) =>
    createApiError(message, 400, 'BAD_REQUEST', details),

  conflict: (message: string = 'Resource already exists') =>
    createApiError(message, 409, 'CONFLICT'),

  validation: (message: string, details?: any) =>
    createApiError(message, 422, 'VALIDATION_ERROR', details),

  internal: (message: string = 'Internal server error') =>
    createApiError(message, 500, 'INTERNAL_ERROR'),

  tooManyRequests: (message: string = 'Too many requests') =>
    createApiError(message, 429, 'RATE_LIMIT')
}
