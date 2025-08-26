import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { StaffManagement } from '@/components/staff/staff-management'
import { redirect } from 'next/navigation'

export default async function StaffManagementPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== 'STAFF') {
    redirect('/login')
  }

  return (
    <DashboardLayout role="STAFF">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Department Management</h1>
          <p className="text-muted-foreground">
            Manage your specific department operations and services.
          </p>
        </div>

        <StaffManagement userId={session.user.id} />
      </div>
    </DashboardLayout>
  )
}
