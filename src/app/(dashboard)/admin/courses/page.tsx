import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { CoursesManager } from '@/components/admin/courses-manager'
import { redirect } from 'next/navigation'

export default async function AdminCoursesPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  return (
    <DashboardLayout role="ADMIN">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Courses Management</h1>
          <p className="text-muted-foreground">
            Create and manage courses, subjects, and curriculum.
          </p>
        </div>

        <CoursesManager />
      </div>
    </DashboardLayout>
  )
}
