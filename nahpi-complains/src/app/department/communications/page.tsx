'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CommunicationsRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the new Department Students page
    router.replace('/department/students')
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to Department Students...</p>
      </div>
    </div>
  )
}
