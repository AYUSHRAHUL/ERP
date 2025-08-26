import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { StudentAttendance } from '@/components/student/student-attendance'
import { redirect } from 'next/navigation'

export default async function StudentAttendancePage() {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== 'STUDENT') {
    redirect('/login')
  }

  return (
    <DashboardLayout role="STUDENT">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Attendance</h1>
          <p className="text-muted-foreground">
            Track your attendance across all subjects and semesters.
          </p>
        </div>

        <StudentAttendance userId={session.user.id} />
      </div>
    </DashboardLayout>
  )
}
