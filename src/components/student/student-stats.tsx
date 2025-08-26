import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { prisma } from '@/lib/db'
import { Calendar, BookOpen, TrendingUp, Clock } from 'lucide-react'

interface StudentStatsProps {
  userId: string
}

export async function StudentStats({ userId }: StudentStatsProps) {
  const student = await prisma.student.findUnique({
    where: { userId },
    include: {
      enrollments: {
        include: {
          course: {
            include: { subjects: true }
          }
        }
      },
      attendance: {
        include: { subject: true }
      },
      marks: {
        include: { subject: true }
      }
    }
  })

  if (!student) return null

  // Calculate attendance percentage
  const totalClasses = student.attendance.length
  const presentClasses = student.attendance.filter(a => a.status === 'PRESENT').length
  const attendancePercentage = totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 0

  // Calculate average marks
  const totalMarks = student.marks.reduce((sum, mark) => sum + mark.obtainedMarks, 0)
  const maxMarks = student.marks.reduce((sum, mark) => sum + mark.maxMarks, 0)
  const averagePercentage = maxMarks > 0 ? (totalMarks / maxMarks) * 100 : 0

  // Get total subjects
  const totalSubjects = student.enrollments.reduce((sum, enrollment) => 
    sum + enrollment.course.subjects.length, 0
  )

  const stats = [
    {
      title: 'Overall Attendance',
      value: `${attendancePercentage.toFixed(1)}%`,
      description: `${presentClasses}/${totalClasses} classes attended`,
      icon: Calendar,
      progress: attendancePercentage,
      color: attendancePercentage >= 75 ? 'text-green-600' : 'text-red-600'
    },
    {
      title: 'Academic Performance',
      value: `${averagePercentage.toFixed(1)}%`,
      description: 'Average marks across subjects',
      icon: TrendingUp,
      progress: averagePercentage,
      color: averagePercentage >= 60 ? 'text-green-600' : 'text-yellow-600'
    },
    {
      title: 'Enrolled Subjects',
      value: totalSubjects.toString(),
      description: `Across ${student.enrollments.length} courses`,
      icon: BookOpen,
      color: 'text-blue-600'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
              {stat.progress !== undefined && (
                <Progress value={stat.progress} className="h-2" />
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
