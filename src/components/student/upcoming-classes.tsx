import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { prisma } from '@/lib/db'
import { Clock, MapPin, User } from 'lucide-react'

interface UpcomingClassesProps {
  userId: string
}

export async function UpcomingClasses({ userId }: UpcomingClassesProps) {
  const student = await prisma.student.findUnique({
    where: { userId },
    include: {
      enrollments: {
        include: {
          course: {
            include: {
              subjects: {
                include: {
                  allocations: {
                    include: {
                      faculty: true
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  })

  if (!student) return null

  // Mock schedule data (in real app, this would come from timetable)
  const mockSchedule = [
    {
      subject: 'Data Structures',
      faculty: 'Dr. John Smith',
      time: '09:00 AM',
      room: 'CS-101',
      status: 'upcoming'
    },
    {
      subject: 'Database Systems',
      faculty: 'Dr. Sarah Wilson',
      time: '11:00 AM',
      room: 'CS-102',
      status: 'upcoming'
    },
    {
      subject: 'Software Engineering',
      faculty: 'Prof. Mike Johnson',
      time: '02:00 PM',
      room: 'CS-103',
      status: 'upcoming'
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          Today's Schedule
        </CardTitle>
        <CardDescription>Your upcoming classes for today</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {mockSchedule.map((class_, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="space-y-1">
              <div className="font-medium">{class_.subject}</div>
              <div className="flex items-center text-sm text-gray-600">
                <User className="h-3 w-3 mr-1" />
                {class_.faculty}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-3 w-3 mr-1" />
                {class_.room}
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium text-blue-600">{class_.time}</div>
              <Badge variant="outline" className="mt-1">
                {class_.status}
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
