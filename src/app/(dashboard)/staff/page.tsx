import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { StaffOverview } from '@/components/staff/staff-overview'
import { redirect } from 'next/navigation'

export default async function StaffDashboard() {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== 'STAFF') {
    redirect('/login')
  }

  return (
    <DashboardLayout role="STAFF">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your department operations and services.
          </p>
        </div>

        <StaffOverview userId={session.user.id} />
      </div>
    </DashboardLayout>
  )
}
