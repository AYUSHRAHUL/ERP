import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { AdminStats } from '@/components/admin/admin-stats'
import { RecentActivity } from '@/components/admin/recent-activity'

export default function AdminDashboard() {
  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your institution's key metrics and activities.
          </p>
        </div>

        <Suspense fallback={<div>Loading stats...</div>}>
          <AdminStats />
        </Suspense>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Suspense fallback={<div>Loading activity...</div>}>
            <RecentActivity />
          </Suspense>
        </div>
      </div>
    </DashboardLayout>
  )
}
