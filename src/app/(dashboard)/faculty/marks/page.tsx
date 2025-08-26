import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { MarksManager } from '@/components/faculty/marks-manager'
import { redirect } from 'next/navigation'

export default async function FacultyMarksPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== 'FACULTY') {
    redirect('/login')
  }

  return (
    <DashboardLayout role="FACULTY">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Marks Management</h1>
          <p className="text-muted-foreground">
            Enter and manage student marks for examinations and assessments.
          </p>
        </div>

        <MarksManager userId={session.user.id} />
      </div>
    </DashboardLayout>
  )
}
