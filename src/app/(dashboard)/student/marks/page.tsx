import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { StudentMarks } from '@/components/student/student-marks'
import { redirect } from 'next/navigation'

export default async function StudentMarksPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== 'STUDENT') {
    redirect('/login')
  }

  return (
    <DashboardLayout role="STUDENT">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Marks</h1>
          <p className="text-muted-foreground">
            View your examination results and academic performance.
          </p>
        </div>

        <StudentMarks userId={session.user.id} />
      </div>
    </DashboardLayout>
  )
}
