import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { FacultySchedule } from '@/components/faculty/faculty-schedule'
import { redirect } from 'next/navigation'

export default async function FacultySchedulePage() {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== 'FACULTY') {
    redirect('/login')
  }

  return (
    <DashboardLayout role="STUDENT">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Schedule</h1>
          <p className="text-muted-foreground">
            View your teaching schedule and upcoming classes.
          </p>
        </div>

        <FacultySchedule userId={session.user.id} />
      </div>
    </DashboardLayout>
  )
}
