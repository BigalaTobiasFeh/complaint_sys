'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

interface DashboardChartsProps {
  data: any
}

export default function DashboardCharts({ data }: DashboardChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Complaint Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">This Month</span>
              <span className="font-medium">{data?.thisMonth || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Last Month</span>
              <span className="font-medium">{data?.lastMonth || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Growth</span>
              <span className={`font-medium ${data?.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {data?.growth >= 0 ? '+' : ''}{data?.growth || 0}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Department Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data?.departments?.map((dept: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{dept.name}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${dept.performance}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{dept.performance}%</span>
                </div>
              </div>
            )) || (
              <div className="text-sm text-gray-500">No department data available</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
