import { Suspense } from 'react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { FacultyOverview } from '@/components/faculty/faculty-overview'
import { FacultyStats } from '@/components/faculty/faculty-stats'
import { TodayClasses } from '@/components/faculty/today-classes'
import { redirect } from 'next/navigation'

export default async function FacultyDashboard() {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== 'FACULTY') {
    redirect('/login')
  }

  return (
    <DashboardLayout role="FACULTY">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Faculty Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your courses, attendance, and student assessments.
          </p>
        </div>

        <Suspense fallback={<div>Loading overview...</div>}>
          <FacultyOverview userId={session.user.id} />
        </Suspense>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Suspense fallback={<div>Loading stats...</div>}>
              <FacultyStats userId={session.user.id} />
            </Suspense>
          </div>
          
          <div>
            <Suspense fallback={<div>Loading schedule...</div>}>
              <TodayClasses userId={session.user.id} />
            </Suspense>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
