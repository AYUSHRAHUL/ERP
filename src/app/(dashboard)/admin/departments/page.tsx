import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { DepartmentsManager } from '@/components/admin/departments-manager'
import { redirect } from 'next/navigation'

export default async function AdminDepartmentsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Departments Management</h1>
          <p className="text-muted-foreground">
            Manage academic departments and their structure.
          </p>
        </div>

        <DepartmentsManager />
      </div>
    </DashboardLayout>
  )
}
