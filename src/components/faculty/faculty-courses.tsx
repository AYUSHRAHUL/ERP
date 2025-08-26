import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/db'
import { BookOpen, Users, Calendar, FileText } from 'lucide-react'
import Link from 'next/link'

interface FacultyCoursesProps {
  userId: string
}

export async function FacultyCourses({ userId }: FacultyCoursesProps) {
  const faculty = await prisma.faculty.findUnique({
    where: { userId },
    include: {
      allocations: {
        include: {
          subject: {
            include: {
              course: {
                include: {
                  department: true
                }
              }
            }
          }
        },
        where: {
          year: new Date().getFullYear() // Current year only
        }
      }
    }
  })

  if (!faculty) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {faculty.allocations.map((allocation) => {
        const subject = allocation.subject
        const course = subject.course

        return (
          <Card key={allocation.id} className="h-full">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{subject.name}</CardTitle>
                <Badge variant="secondary">{subject.code}</Badge>
              </div>
              <CardDescription>
                {course.name} • {course.department.name}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center">
                  <BookOpen className="h-4 w-4 mr-2 text-blue-600" />
                  {subject.credits} Credits
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-green-600" />
                  Sem {allocation.semester}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Quick Actions</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Link href={`/faculty/attendance?subject=${subject.id}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      <Users className="h-3 w-3 mr-1" />
                      Attendance
                    </Button>
                  </Link>
                  <Link href={`/faculty/marks?subject=${subject.id}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      <FileText className="h-3 w-3 mr-1" />
                      Marks
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Subject Statistics */}
              <div className="pt-2 border-t">
                <div className="text-xs text-gray-600 space-y-1">
                  <div>Course: {course.code}</div>
                  <div>Year: {allocation.year}</div>
                  <div>Semester: {allocation.semester}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}

      {faculty.allocations.length === 0 && (
        <div className="col-span-full text-center py-12 text-gray-500">
          <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No Subjects Assigned</h3>
          <p>You don't have any subjects assigned for the current academic year.</p>
        </div>
      )}
    </div>
  )
}
