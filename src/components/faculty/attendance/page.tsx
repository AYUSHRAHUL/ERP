import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { AttendanceManager } from '@/components/faculty/attendance-manager'
import { redirect } from 'next/navigation'

export default async function FacultyAttendancePage() {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== 'FACULTY') {
    redirect('/login')
  }

  return (
    <DashboardLayout role="FACULTY">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance Management</h1>
          <p className="text-muted-foreground">
            Mark and manage student attendance for your subjects.
          </p>
        </div>

        <AttendanceManager userId={session.user.id} />
      </div>
    </DashboardLayout>
  )
}
