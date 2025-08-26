import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { prisma } from '@/lib/db'
import { Users, GraduationCap, BookOpen, Building2 } from 'lucide-react'

export async function AdminStats() {
  const [studentCount, facultyCount, courseCount, departmentCount] = await Promise.all([
    prisma.student.count(),
    prisma.faculty.count(), 
    prisma.course.count(),
    prisma.department.count()
  ])

  const stats = [
    {
      title: 'Total Students',
      value: studentCount,
      description: 'Active enrolled students',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Faculty Members',
      value: facultyCount,
      description: 'Teaching staff',
      icon: GraduationCap,
      color: 'text-green-600'
    },
    {
      title: 'Courses',
      value: courseCount,
      description: 'Available courses',
      icon: BookOpen,
      color: 'text-purple-600'
    },
    {
      title: 'Departments',
      value: departmentCount,
      description: 'Academic departments',
      icon: Building2,
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
