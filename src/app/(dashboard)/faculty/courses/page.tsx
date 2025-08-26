import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { FacultyCourses } from '@/components/faculty/faculty-courses'
import { redirect } from 'next/navigation'

export default async function FacultyCoursesPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== 'FACULTY') {
    redirect('/login')
  }

  return (
    <DashboardLayout role="FACULTY">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
          <p className="text-muted-foreground">
            Manage your assigned subjects and course materials.
          </p>
        </div>

        <FacultyCourses userId={session.user.id} />
      </div>
    </DashboardLayout>
  )
}
