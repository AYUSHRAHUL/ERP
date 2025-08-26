import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { prisma } from '@/lib/db'

interface StudentOverviewProps {
  userId: string
}

export async function StudentOverview({ userId }: StudentOverviewProps) {
  const student = await prisma.student.findUnique({
    where: { userId },
    include: {
      department: true,
      enrollments: {
        include: { course: true }
      }
    }
  })

  if (!student) {
    return <div>Student not found</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Student Profile
          <Badge variant="outline">
            Year {new Date().getFullYear() - student.admissionYear + 1}
          </Badge>
        </CardTitle>
        <CardDescription>Your academic information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Name</p>
            <p className="text-lg">{student.firstName} {student.lastName}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Roll Number</p>
            <p className="text-lg font-mono">{student.rollNumber}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Department</p>
            <p className="text-lg">{student.department.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Current Semester</p>
            <p className="text-lg">{student.semester}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Admission Year</p>
            <p className="text-lg">{student.admissionYear}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Enrolled Courses</p>
            <p className="text-lg">{student.enrollments.length}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
