'use client'

import React, { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

// Lazy load heavy dashboard components
const DashboardCharts = dynamic(() => import('./DashboardCharts'), {
  loading: () => (
    <Card>
      <CardHeader>
        <CardTitle>Loading Analytics...</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </CardContent>
    </Card>
  ),
  ssr: false
})

interface LazyDashboardChartsProps {
  data: any
}

export default function LazyDashboardCharts({ data }: LazyDashboardChartsProps) {
  return (
    <Suspense fallback={
      <Card>
        <CardHeader>
          <CardTitle>Loading Charts...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    }>
      <DashboardCharts data={data} />
    </Suspense>
  )
}
