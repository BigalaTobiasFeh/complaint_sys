// Performance monitoring utilities
export class PerformanceMonitor {
  private static measurements: Map<string, number> = new Map()

  // Start measuring performance
  static startMeasurement(name: string) {
    if (typeof window !== 'undefined' && window.performance) {
      this.measurements.set(name, performance.now())
    }
  }

  // End measurement and log result
  static endMeasurement(name: string, logToConsole = false) {
    if (typeof window !== 'undefined' && window.performance) {
      const startTime = this.measurements.get(name)
      if (startTime) {
        const duration = performance.now() - startTime
        this.measurements.delete(name)
        
        if (logToConsole && process.env.NODE_ENV === 'development') {
          console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`)
        }
        
        return duration
      }
    }
    return 0
  }

  // Measure async function execution
  static async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    this.startMeasurement(name)
    try {
      const result = await fn()
      this.endMeasurement(name, true)
      return result
    } catch (error) {
      this.endMeasurement(name, true)
      throw error
    }
  }

  // Report Core Web Vitals
  static reportWebVitals() {
    if (typeof window !== 'undefined') {
      // Report to analytics service in production
      if (process.env.NODE_ENV === 'production') {
        // This would integrate with your analytics service
        // For now, we'll just log to console in development
      }
    }
  }
}

// Database query optimization helper
export function optimizeQuery(query: any, options: {
  limit?: number
  select?: string
  useCache?: boolean
} = {}) {
  const { limit = 50, select, useCache = true } = options
  
  let optimizedQuery = query
  
  // Apply select optimization
  if (select) {
    optimizedQuery = optimizedQuery.select(select)
  }
  
  // Apply limit to prevent large data fetches
  if (limit) {
    optimizedQuery = optimizedQuery.limit(limit)
  }
  
  return optimizedQuery
}

// Debounce utility for search inputs
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Throttle utility for scroll events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Preload critical resources
export function preloadCriticalResources() {
  if (typeof window !== 'undefined') {
    // Preload critical fonts
    const fontLink = document.createElement('link')
    fontLink.rel = 'preload'
    fontLink.as = 'font'
    fontLink.type = 'font/woff2'
    fontLink.crossOrigin = 'anonymous'
    
    // Preload critical images
    const criticalImages = [
      // Add any critical images here
    ]
    
    criticalImages.forEach(src => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = src
      document.head.appendChild(link)
    })
  }
}
