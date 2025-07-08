import React, { useId } from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ 
    className, 
    label,
    error,
    helperText,
    id,
    ...props 
  }, ref) => {
    const generatedId = useId()
    const textareaId = id || generatedId
    
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-base font-medium text-gray-700 mb-[0.5rem]"
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          className={cn(
            "block w-full rounded-lg border border-gray-300 px-[1rem] py-[0.75rem] text-base placeholder-gray-400 shadow-sm transition-colors resize-vertical",
            "focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary",
            "disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500",
            error && "border-error focus:border-error focus:ring-error",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-error">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    )
  }
)

Textarea.displayName = "Textarea"

export { Textarea }
