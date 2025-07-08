import { supabase } from './supabase'

export interface AppError {
  code: string
  message: string
  details?: any
  timestamp: Date
  userId?: string
  context?: string
}

export class ErrorHandler {
  // Error codes for different types of errors
  static readonly ERROR_CODES = {
    // Authentication errors
    AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
    AUTH_USER_NOT_FOUND: 'AUTH_USER_NOT_FOUND',
    AUTH_SESSION_EXPIRED: 'AUTH_SESSION_EXPIRED',
    AUTH_INSUFFICIENT_PERMISSIONS: 'AUTH_INSUFFICIENT_PERMISSIONS',
    
    // Validation errors
    VALIDATION_REQUIRED_FIELD: 'VALIDATION_REQUIRED_FIELD',
    VALIDATION_INVALID_FORMAT: 'VALIDATION_INVALID_FORMAT',
    VALIDATION_FILE_TOO_LARGE: 'VALIDATION_FILE_TOO_LARGE',
    VALIDATION_INVALID_FILE_TYPE: 'VALIDATION_INVALID_FILE_TYPE',
    
    // Database errors
    DB_CONNECTION_ERROR: 'DB_CONNECTION_ERROR',
    DB_CONSTRAINT_VIOLATION: 'DB_CONSTRAINT_VIOLATION',
    DB_RECORD_NOT_FOUND: 'DB_RECORD_NOT_FOUND',
    DB_DUPLICATE_ENTRY: 'DB_DUPLICATE_ENTRY',
    
    // Business logic errors
    COMPLAINT_INVALID_STATUS_TRANSITION: 'COMPLAINT_INVALID_STATUS_TRANSITION',
    COMPLAINT_DEADLINE_EXCEEDED: 'COMPLAINT_DEADLINE_EXCEEDED',
    COMPLAINT_ALREADY_RESOLVED: 'COMPLAINT_ALREADY_RESOLVED',
    
    // Network errors
    NETWORK_CONNECTION_ERROR: 'NETWORK_CONNECTION_ERROR',
    NETWORK_TIMEOUT: 'NETWORK_TIMEOUT',
    NETWORK_SERVER_ERROR: 'NETWORK_SERVER_ERROR',
    
    // File upload errors
    UPLOAD_FAILED: 'UPLOAD_FAILED',
    UPLOAD_QUOTA_EXCEEDED: 'UPLOAD_QUOTA_EXCEEDED',
    
    // General errors
    UNKNOWN_ERROR: 'UNKNOWN_ERROR',
    OPERATION_FAILED: 'OPERATION_FAILED'
  }

  // User-friendly error messages
  static readonly ERROR_MESSAGES = {
    [this.ERROR_CODES.AUTH_INVALID_CREDENTIALS]: 'Invalid email or password. Please try again.',
    [this.ERROR_CODES.AUTH_USER_NOT_FOUND]: 'User account not found. Please check your credentials.',
    [this.ERROR_CODES.AUTH_SESSION_EXPIRED]: 'Your session has expired. Please log in again.',
    [this.ERROR_CODES.AUTH_INSUFFICIENT_PERMISSIONS]: 'You do not have permission to perform this action.',
    
    [this.ERROR_CODES.VALIDATION_REQUIRED_FIELD]: 'This field is required.',
    [this.ERROR_CODES.VALIDATION_INVALID_FORMAT]: 'Please enter a valid format.',
    [this.ERROR_CODES.VALIDATION_FILE_TOO_LARGE]: 'File size is too large. Maximum size is 10MB.',
    [this.ERROR_CODES.VALIDATION_INVALID_FILE_TYPE]: 'Invalid file type. Please upload a supported file.',
    
    [this.ERROR_CODES.DB_CONNECTION_ERROR]: 'Database connection error. Please try again later.',
    [this.ERROR_CODES.DB_RECORD_NOT_FOUND]: 'The requested record was not found.',
    [this.ERROR_CODES.DB_DUPLICATE_ENTRY]: 'This record already exists.',
    
    [this.ERROR_CODES.COMPLAINT_INVALID_STATUS_TRANSITION]: 'Invalid status transition. Please check the workflow.',
    [this.ERROR_CODES.COMPLAINT_DEADLINE_EXCEEDED]: 'The deadline for this complaint has been exceeded.',
    [this.ERROR_CODES.COMPLAINT_ALREADY_RESOLVED]: 'This complaint has already been resolved.',
    
    [this.ERROR_CODES.NETWORK_CONNECTION_ERROR]: 'Network connection error. Please check your internet connection.',
    [this.ERROR_CODES.NETWORK_TIMEOUT]: 'Request timed out. Please try again.',
    [this.ERROR_CODES.NETWORK_SERVER_ERROR]: 'Server error. Please try again later.',
    
    [this.ERROR_CODES.UPLOAD_FAILED]: 'File upload failed. Please try again.',
    [this.ERROR_CODES.UPLOAD_QUOTA_EXCEEDED]: 'Upload quota exceeded. Please contact support.',
    
    [this.ERROR_CODES.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again.',
    [this.ERROR_CODES.OPERATION_FAILED]: 'Operation failed. Please try again.'
  }

  // Create a standardized error object
  static createError(
    code: string, 
    message?: string, 
    details?: any, 
    userId?: string, 
    context?: string
  ): AppError {
    return {
      code,
      message: message || this.ERROR_MESSAGES[code] || this.ERROR_MESSAGES[this.ERROR_CODES.UNKNOWN_ERROR],
      details,
      timestamp: new Date(),
      userId,
      context
    }
  }

  // Handle Supabase errors
  static handleSupabaseError(error: any, context?: string, userId?: string): AppError {
    console.error('Supabase error:', error)

    // Map Supabase error codes to our error codes
    if (error.code === 'PGRST116') {
      return this.createError(this.ERROR_CODES.DB_RECORD_NOT_FOUND, undefined, error, userId, context)
    }
    
    if (error.code === '23505') {
      return this.createError(this.ERROR_CODES.DB_DUPLICATE_ENTRY, undefined, error, userId, context)
    }
    
    if (error.code === '23503') {
      return this.createError(this.ERROR_CODES.DB_CONSTRAINT_VIOLATION, undefined, error, userId, context)
    }
    
    if (error.message?.includes('JWT')) {
      return this.createError(this.ERROR_CODES.AUTH_SESSION_EXPIRED, undefined, error, userId, context)
    }
    
    if (error.message?.includes('permission')) {
      return this.createError(this.ERROR_CODES.AUTH_INSUFFICIENT_PERMISSIONS, undefined, error, userId, context)
    }

    // Default to unknown error
    return this.createError(
      this.ERROR_CODES.UNKNOWN_ERROR, 
      error.message || 'An unexpected database error occurred',
      error,
      userId,
      context
    )
  }

  // Handle network errors
  static handleNetworkError(error: any, context?: string, userId?: string): AppError {
    console.error('Network error:', error)

    if (error.name === 'AbortError' || error.code === 'ECONNABORTED') {
      return this.createError(this.ERROR_CODES.NETWORK_TIMEOUT, undefined, error, userId, context)
    }
    
    if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
      return this.createError(this.ERROR_CODES.NETWORK_CONNECTION_ERROR, undefined, error, userId, context)
    }
    
    if (error.status >= 500) {
      return this.createError(this.ERROR_CODES.NETWORK_SERVER_ERROR, undefined, error, userId, context)
    }

    return this.createError(this.ERROR_CODES.NETWORK_CONNECTION_ERROR, undefined, error, userId, context)
  }

  // Handle validation errors
  static handleValidationError(field: string, value: any, rule: string): AppError {
    let code = this.ERROR_CODES.VALIDATION_INVALID_FORMAT
    let message = `Invalid ${field}`

    switch (rule) {
      case 'required':
        code = this.ERROR_CODES.VALIDATION_REQUIRED_FIELD
        message = `${field} is required`
        break
      case 'email':
        message = 'Please enter a valid email address'
        break
      case 'phone':
        message = 'Please enter a valid phone number'
        break
      case 'matricule':
        message = 'Please enter a valid matricule number'
        break
      case 'fileSize':
        code = this.ERROR_CODES.VALIDATION_FILE_TOO_LARGE
        message = 'File size exceeds the maximum limit'
        break
      case 'fileType':
        code = this.ERROR_CODES.VALIDATION_INVALID_FILE_TYPE
        message = 'Invalid file type'
        break
    }

    return this.createError(code, message, { field, value, rule })
  }

  // Log error to console and optionally to a logging service
  static logError(error: AppError): void {
    console.error('Application Error:', {
      code: error.code,
      message: error.message,
      details: error.details,
      timestamp: error.timestamp,
      userId: error.userId,
      context: error.context
    })

    // In production, you might want to send errors to a logging service
    if (process.env.NODE_ENV === 'production') {
      this.sendToLoggingService(error)
    }
  }

  // Send error to external logging service (placeholder)
  private static async sendToLoggingService(error: AppError): Promise<void> {
    try {
      // Example: Send to Sentry, LogRocket, or custom logging endpoint
      // await fetch('/api/log-error', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(error)
      // })
    } catch (loggingError) {
      console.error('Failed to send error to logging service:', loggingError)
    }
  }

  // Get user-friendly error message
  static getUserMessage(error: AppError): string {
    return error.message
  }

  // Check if error should be retried
  static isRetryableError(error: AppError): boolean {
    const retryableCodes = [
      this.ERROR_CODES.NETWORK_CONNECTION_ERROR,
      this.ERROR_CODES.NETWORK_TIMEOUT,
      this.ERROR_CODES.NETWORK_SERVER_ERROR,
      this.ERROR_CODES.DB_CONNECTION_ERROR
    ]
    
    return retryableCodes.includes(error.code)
  }

  // Retry operation with exponential backoff
  static async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: any

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error
        
        if (attempt === maxRetries) {
          throw error
        }

        // Check if error is retryable
        const appError = error instanceof Error 
          ? this.handleNetworkError(error)
          : error as AppError

        if (!this.isRetryableError(appError)) {
          throw error
        }

        // Wait before retrying with exponential backoff
        const delay = baseDelay * Math.pow(2, attempt)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    throw lastError
  }

  // Wrap async operations with error handling
  static async safeExecute<T>(
    operation: () => Promise<T>,
    context?: string,
    userId?: string
  ): Promise<{ success: boolean; data?: T; error?: AppError }> {
    try {
      const data = await operation()
      return { success: true, data }
    } catch (error: any) {
      let appError: AppError

      if (error.code && error.message) {
        // Supabase error
        appError = this.handleSupabaseError(error, context, userId)
      } else if (error instanceof TypeError || error.name === 'NetworkError') {
        // Network error
        appError = this.handleNetworkError(error, context, userId)
      } else {
        // Generic error
        appError = this.createError(
          this.ERROR_CODES.UNKNOWN_ERROR,
          error.message || 'An unexpected error occurred',
          error,
          userId,
          context
        )
      }

      this.logError(appError)
      return { success: false, error: appError }
    }
  }
}
