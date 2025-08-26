import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { prisma } from '@/lib/db'
import { Users, BookOpen, Calendar, TrendingUp } from 'lucide-react'

interface FacultyStatsProps {
  userId: string
}

export async function FacultyStats({ userId }: FacultyStatsProps) {
  const faculty = await prisma.faculty.findUnique({
    where: { userId },
    include: {
      allocations: {
        include: {
          subject: {
            include: {
              course: true
            }
          }
        }
      }
    }
  })

  if (!faculty) return null

  // Get stats
  const totalSubjects = faculty.allocations.length
  
  const studentsCount = await prisma.student.count({
    where: {
      enrollments: {
        some: {
          course: {
            subjects: {
              some: {
                allocations: {
                  some: {
                    facultyId: faculty.id
                  }
                }
              }
            }
          }
        }
      }
    }
  })

  const attendanceRecords = await prisma.attendance.count({
    where: { facultyId: faculty.id }
  })

  const marksEntered = await prisma.mark.count({
    where: { facultyId: faculty.id }
  })

  const stats = [
    {
      title: 'Assigned Subjects',
      value: totalSubjects,
      description: 'Current semester subjects',
      icon: BookOpen,
      color: 'text-blue-600'
    },
    {
      title: 'Total Students',
      value: studentsCount,
      description: 'Across all subjects',
      icon: Users,
      color: 'text-green-600'
    },
    {
      title: 'Attendance Records',
      value: attendanceRecords,
      description: 'Total attendance marked',
      icon: Calendar,
      color: 'text-purple-600'
    },
    {
      title: 'Marks Entered',
      value: marksEntered,
      description: 'Assessment records',
      icon: TrendingUp,
      color: 'text-orange-600'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
