import React from 'react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  text?: string
}

export function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-gray-300 border-t-primary',
          sizeClasses[size]
        )}
      />
      {text && (
        <p className="mt-2 text-sm text-gray-600">{text}</p>
      )}
    </div>
  )
}

// Skeleton loader for better perceived performance
export function SkeletonLoader({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse bg-gray-200 rounded', className)} />
  )
}

// Card skeleton
export function CardSkeleton() {
  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-3">
      <SkeletonLoader className="h-4 w-3/4" />
      <SkeletonLoader className="h-3 w-1/2" />
      <SkeletonLoader className="h-20 w-full" />
      <div className="flex space-x-2">
        <SkeletonLoader className="h-8 w-16" />
        <SkeletonLoader className="h-8 w-16" />
      </div>
    </div>
  )
}

// Table skeleton
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonLoader key={i} className="h-4" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, j) => (
            <SkeletonLoader key={j} className="h-3" />
          ))}
        </div>
      ))}
    </div>
  )
}
