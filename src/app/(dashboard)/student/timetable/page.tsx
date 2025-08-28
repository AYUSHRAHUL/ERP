import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { StudentTimetable } from '@/components/student/student-timetable'
import { redirect } from 'next/navigation'

export default async function StudentTimetablePage() {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== 'STUDENT') {
    redirect('/login')
  }

  return (
    <DashboardLayout role="STUDENT">
      <StudentTimetable userId={session.user.id} />
    </DashboardLayout>
  )
}
