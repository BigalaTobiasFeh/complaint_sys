import React, { useId, useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from './Button'

export interface FileUploadProps {
  label?: string
  error?: string
  helperText?: string
  accept?: string
  multiple?: boolean
  maxSize?: number // in MB
  maxFiles?: number
  onFilesChange?: (files: File[]) => void
  className?: string
}

const FileUpload = React.forwardRef<HTMLInputElement, FileUploadProps>(
  ({ 
    className,
    label,
    error,
    helperText,
    accept = ".pdf,.doc,.docx,.jpg,.jpeg,.png",
    multiple = true,
    maxSize = 10, // 10MB default
    maxFiles = 5,
    onFilesChange,
    ...props 
  }, ref) => {
    const generatedId = useId()
    const [files, setFiles] = useState<File[]>([])
    const [dragActive, setDragActive] = useState(false)

    const handleFiles = (newFiles: FileList | null) => {
      if (!newFiles) return

      const fileArray = Array.from(newFiles)
      const validFiles: File[] = []
      const errors: string[] = []

      fileArray.forEach(file => {
        // Check file size
        if (file.size > maxSize * 1024 * 1024) {
          errors.push(`${file.name} is too large (max ${maxSize}MB)`)
          return
        }

        // Check file count
        if (files.length + validFiles.length >= maxFiles) {
          errors.push(`Maximum ${maxFiles} files allowed`)
          return
        }

        validFiles.push(file)
      })

      if (errors.length > 0) {
        alert(errors.join('\n'))
        return
      }

      const updatedFiles = multiple ? [...files, ...validFiles] : validFiles
      setFiles(updatedFiles)
      onFilesChange?.(updatedFiles)
    }

    const removeFile = (index: number) => {
      const updatedFiles = files.filter((_, i) => i !== index)
      setFiles(updatedFiles)
      onFilesChange?.(updatedFiles)
    }

    const handleDrag = (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (e.type === "dragenter" || e.type === "dragover") {
        setDragActive(true)
      } else if (e.type === "dragleave") {
        setDragActive(false)
      }
    }

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)
      handleFiles(e.dataTransfer.files)
    }

    const formatFileSize = (bytes: number) => {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    return (
      <div className={cn("w-full", className)}>
        {label && (
          <label className="block text-base font-medium text-gray-700 mb-[0.5rem]">
            {label}
          </label>
        )}
        
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
            dragActive ? "border-primary bg-blue-50" : "border-gray-300",
            error && "border-error"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={ref}
            id={generatedId}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
            {...props}
          />
          
          <div className="space-y-2">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div>
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById(generatedId)?.click()}
              >
                Choose files
              </Button>
              <p className="text-sm text-gray-500 mt-2">
                or drag and drop files here
              </p>
            </div>
            <p className="text-xs text-gray-400">
              {accept.split(',').join(', ')} up to {maxSize}MB each (max {maxFiles} files)
            </p>
          </div>
        </div>

        {/* File list */}
        {files.length > 0 && (
          <div className="mt-4 space-y-2">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              </div>
            ))}
          </div>
        )}

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

FileUpload.displayName = "FileUpload"

export { FileUpload }
