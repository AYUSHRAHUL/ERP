import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { FacultyManager } from '@/components/admin/faculty-manager'
import { redirect } from 'next/navigation'

export default async function AdminFacultyPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Faculty Management</h1>
          <p className="text-muted-foreground">
            Manage faculty members, their assignments, and qualifications.
          </p>
        </div>

        <FacultyManager />
      </div>
    </DashboardLayout>
  )
}
