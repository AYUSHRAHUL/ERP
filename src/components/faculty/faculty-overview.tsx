import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { prisma } from '@/lib/db'

interface FacultyOverviewProps {
  userId: string
}

export async function FacultyOverview({ userId }: FacultyOverviewProps) {
  const faculty = await prisma.faculty.findUnique({
    where: { userId },
    include: {
      department: true,
      allocations: {
        include: {
          subject: {
            include: { course: true }
          }
        }
      }
    }
  })

  if (!faculty) {
    return <div>Faculty not found</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Faculty Profile
          <Badge variant="outline">
            {faculty.department.name}
          </Badge>
        </CardTitle>
        <CardDescription>Your academic information and assignments</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Name</p>
            <p className="text-lg">{faculty.firstName} {faculty.lastName}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Employee ID</p>
            <p className="text-lg font-mono">{faculty.employeeId}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Department</p>
            <p className="text-lg">{faculty.department.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Experience</p>
            <p className="text-lg">{faculty.experience || 0} years</p>
          </div>
        </div>
        
        <div>
          <p className="text-sm font-medium text-gray-500 mb-2">Current Subjects</p>
          <div className="flex flex-wrap gap-2">
            {faculty.allocations.map((allocation) => (
              <Badge key={allocation.id} variant="secondary">
                {allocation.subject.name} ({allocation.subject.course.name})
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
