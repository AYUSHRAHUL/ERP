import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { StudentCourses } from '@/components/student/student-courses'
import { redirect } from 'next/navigation'

export default async function StudentCoursesPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== 'STUDENT') {
    redirect('/login')
  }

  return (
    <DashboardLayout role="STUDENT">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
          <p className="text-muted-foreground">
            View your enrolled courses and subjects.
          </p>
        </div>

        <StudentCourses userId={session.user.id} />
      </div>
    </DashboardLayout>
  )
}
