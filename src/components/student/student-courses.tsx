import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { prisma } from '@/lib/db'
import { BookOpen, Clock, Users } from 'lucide-react'

interface StudentCoursesProps {
  userId: string
}

export async function StudentCourses({ userId }: StudentCoursesProps) {
  const student = await prisma.student.findUnique({
    where: { userId },
    include: {
      enrollments: {
        include: {
          course: {
            include: {
              subjects: {
                include: {
                  attendance: {
                    where: { studentId: { equals: undefined } }
                  },
                  marks: {
                    where: { studentId: { equals: undefined } }
                  }
                }
              },
              department: true
            }
          }
        }
      },
      attendance: true,
      marks: true
    }
  })

  if (!student) {
    return <div>Student not found</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {student.enrollments.map((enrollment) => {
        const course = enrollment.course
        
        return (
          <Card key={enrollment.id} className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{course.name}</CardTitle>
                <Badge variant="secondary">{course.code}</Badge>
              </div>
              <CardDescription>{course.department.name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {course.credits} Credits
                </div>
                <div className="flex items-center">
                  <BookOpen className="h-4 w-4 mr-1" />
                  {course.subjects.length} Subjects
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Subjects:</h4>
                {course.subjects.map((subject) => {
                  // Calculate attendance for this subject
                  const subjectAttendance = student.attendance.filter(
                    a => a.subjectId === subject.id
                  )
                  const totalClasses = subjectAttendance.length
                  const presentClasses = subjectAttendance.filter(
                    a => a.status === 'PRESENT'
                  ).length
                  const attendancePercentage = totalClasses > 0 
                    ? (presentClasses / totalClasses) * 100 : 0

                  return (
                    <div key={subject.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-sm">{subject.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {subject.code}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>Attendance</span>
                          <span>{attendancePercentage.toFixed(1)}%</span>
                        </div>
                        <Progress value={attendancePercentage} className="h-1" />
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
