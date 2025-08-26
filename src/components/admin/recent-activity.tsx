import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { prisma } from '@/lib/db'
import { Activity, UserPlus, BookOpen, CreditCard, Users } from 'lucide-react'

export async function RecentActivity() {
  // Get recent activities from different tables
  const [recentStudents, recentEnrollments, recentPayments] = await Promise.all([
    prisma.student.findMany({
      take: 3,
      orderBy: { user: { createdAt: 'desc' } },
      include: { user: true, department: true }
    }),
    prisma.enrollment.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      include: { student: true, course: true }
    }),
    prisma.feePayment.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      include: { student: true }
    })
  ])

  // Combine and sort activities
  const activities = [
    ...recentStudents.map(student => ({
      id: student.id,
      type: 'student_registered',
      title: 'New Student Registration',
      description: `${student.firstName} ${student.lastName} registered`,
      time: student.user.createdAt,
      icon: UserPlus,
      color: 'text-green-600'
    })),
    ...recentEnrollments.map(enrollment => ({
      id: enrollment.id,
      type: 'course_enrolled',
      title: 'Course Enrollment',
      description: `${enrollment.student.firstName} enrolled in ${enrollment.course.name}`,
      time: enrollment.createdAt,
      icon: BookOpen,
      color: 'text-blue-600'
    })),
    ...recentPayments.map(payment => ({
      id: payment.id,
      type: 'fee_payment',
      title: 'Fee Payment',
      description: `${payment.student.firstName} paid ₹${payment.amount}`,
      time: payment.createdAt,
      icon: CreditCard,
      color: 'text-purple-600'
    }))
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 10)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="h-5 w-5 mr-2" />
          Recent Activity
        </CardTitle>
        <CardDescription>Latest activities across the institution</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No recent activities
            </div>
          ) : (
            activities.map((activity) => {
              const Icon = activity.icon
              return (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`p-2 rounded-full bg-gray-100`}>
                    <Icon className={`h-4 w-4 ${activity.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{activity.title}</p>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.time).toLocaleString()}
                    </p>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}
