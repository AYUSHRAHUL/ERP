import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { prisma } from '@/lib/db'
import { Calendar, Clock, MapPin, Users } from 'lucide-react'

interface FacultyScheduleProps {
  userId: string
}

export async function FacultySchedule({ userId }: FacultyScheduleProps) {
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

  // Mock weekly schedule (in real app, this would come from timetable system)
  const weeklySchedule = [
    {
      day: 'Monday',
      classes: [
        {
          time: '09:00 AM - 10:00 AM',
          subject: 'Data Structures',
          code: 'CSE201',
          room: 'CS-101',
          students: 45
        },
        {
          time: '02:00 PM - 04:00 PM',
          subject: 'Data Structures Lab',
          code: 'CSE201L',
          room: 'Lab-1',
          students: 25
        }
      ]
    },
    {
      day: 'Tuesday',
      classes: [
        {
          time: '11:00 AM - 12:00 PM',
          subject: 'Database Systems',
          code: 'CSE301',
          room: 'CS-102',
          students: 38
        }
      ]
    },
    {
      day: 'Wednesday',
      classes: [
        {
          time: '09:00 AM - 10:00 AM',
          subject: 'Data Structures',
          code: 'CSE201',
          room: 'CS-101',
          students: 45
        },
        {
          time: '03:00 PM - 04:00 PM',
          subject: 'Database Systems',
          code: 'CSE301',
          room: 'CS-102',
          students: 38
        }
      ]
    },
    {
      day: 'Thursday',
      classes: [
        {
          time: '10:00 AM - 12:00 PM',
          subject: 'Database Lab',
          code: 'CSE301L',
          room: 'Lab-2',
          students: 20
        }
      ]
    },
    {
      day: 'Friday',
      classes: [
        {
          time: '09:00 AM - 10:00 AM',
          subject: 'Data Structures',
          code: 'CSE201',
          room: 'CS-101',
          students: 45
        }
      ]
    },
    {
      day: 'Saturday',
      classes: []
    },
    {
      day: 'Sunday',
      classes: []
    }
  ]

  const totalWeeklyHours = weeklySchedule.reduce((total, day) => 
    total + day.classes.reduce((dayTotal, class_) => {
      const duration = class_.time.includes('04:00 PM') ? 2 : 1 // Simple duration calculation
      return dayTotal + duration
    }, 0), 0
  )

  return (
    <div className="space-y-6">
      {/* Schedule Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWeeklyHours}</div>
            <p className="text-xs text-muted-foreground">
              Teaching hours per week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subjects</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{faculty.allocations.length}</div>
            <p className="text-xs text-muted-foreground">
              Assigned subjects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Working Days</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {weeklySchedule.filter(day => day.classes.length > 0).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Days per week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Weekly Schedule
          </CardTitle>
          <CardDescription>Your complete teaching timetable</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {weeklySchedule.map((day) => (
              <div key={day.day} className="border-l-4 border-blue-200 pl-4">
                <h3 className="font-semibold text-lg mb-3">{day.day}</h3>
                {day.classes.length === 0 ? (
                  <div className="text-gray-500 text-sm">No classes scheduled</div>
                ) : (
                  <div className="space-y-3">
                    {day.classes.map((class_, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium">{class_.subject}</h4>
                            <div className="text-sm text-gray-600">{class_.code}</div>
                          </div>
                          <Badge variant="outline">{class_.time}</Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {class_.room}
                          </div>
                          <div className="flex items-center">
                            <Users className="h-3 w-3 mr-1" />
                            {class_.students} students
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
