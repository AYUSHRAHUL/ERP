import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { StudentsManager } from '@/components/admin/students-manager'
import { redirect } from 'next/navigation'

export default async function AdminStudentsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Students Management</h1>
          <p className="text-muted-foreground">
            Add, edit, and manage student records and enrollments.
          </p>
        </div>

        <StudentsManager />
      </div>
    </DashboardLayout>
  )
}
