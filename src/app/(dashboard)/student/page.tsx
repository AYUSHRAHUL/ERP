import { Suspense } from 'react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { StudentOverview } from '@/components/student/student-overview'
import { StudentStats } from '@/components/student/student-stats'
import { UpcomingClasses } from '@/components/student/upcoming-classes'
import { RecentMarks } from '@/components/student/recent-marks'
import { redirect } from 'next/navigation'

export default async function StudentDashboard() {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== 'STUDENT') {
    redirect('/login')
  }

  return (
    <DashboardLayout role="STUDENT">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's your academic overview.
          </p>
        </div>

        <Suspense fallback={<div>Loading overview...</div>}>
          <StudentOverview userId={session.user.id} />
        </Suspense>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Suspense fallback={<div>Loading stats...</div>}>
              <StudentStats userId={session.user.id} />
            </Suspense>
            
            <Suspense fallback={<div>Loading marks...</div>}>
              <RecentMarks userId={session.user.id} />
            </Suspense>
          </div>
          
          <div>
            <Suspense fallback={<div>Loading schedule...</div>}>
              <UpcomingClasses userId={session.user.id} />
            </Suspense>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
