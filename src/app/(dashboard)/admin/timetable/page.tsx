import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { TimetableManager } from '@/components/admin/timetable-manager'
import { redirect } from 'next/navigation'

export default async function AdminTimetablePage() {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  return (
    <DashboardLayout role="ADMIN">
      <TimetableManager />
    </DashboardLayout>
  )
}
