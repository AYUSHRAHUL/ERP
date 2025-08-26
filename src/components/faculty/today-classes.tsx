import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, Users, MapPin } from 'lucide-react'

interface TodayClassesProps {
  userId: string
}

export async function TodayClasses({ userId }: TodayClassesProps) {
  // Mock data for today's schedule (in real app, this would come from timetable)
  const todayClasses = [
    {
      id: '1',
      subject: 'Data Structures',
      code: 'CSE201',
      time: '09:00 AM - 10:00 AM',
      room: 'CS-101',
      students: 45,
      status: 'upcoming'
    },
    {
      id: '2',
      subject: 'Database Systems',
      code: 'CSE301',
      time: '11:00 AM - 12:00 PM',
      room: 'CS-102',
      students: 38,
      status: 'upcoming'
    },
    {
      id: '3',
      subject: 'Software Engineering Lab',
      code: 'CSE401L',
      time: '02:00 PM - 04:00 PM',
      room: 'Lab-1',
      students: 25,
      status: 'upcoming'
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          Today's Classes
        </CardTitle>
        <CardDescription>Your teaching schedule for today</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {todayClasses.map((class_) => (
          <div key={class_.id} className="p-4 border rounded-lg">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-medium">{class_.subject}</h4>
                <p className="text-sm text-gray-600">{class_.code}</p>
              </div>
              <Badge variant="outline">{class_.status}</Badge>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-2" />
                {class_.time}
              </div>
              <div className="flex items-center">
                <MapPin className="h-3 w-3 mr-2" />
                {class_.room}
              </div>
              <div className="flex items-center">
                <Users className="h-3 w-3 mr-2" />
                {class_.students} students
              </div>
            </div>
            
            <div className="flex gap-2 mt-3">
              <Button variant="outline" size="sm">
                Mark Attendance
              </Button>
              <Button variant="outline" size="sm">
                View Students
              </Button>
            </div>
          </div>
        ))}
        
        {todayClasses.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No classes scheduled for today
          </div>
        )}
      </CardContent>
    </Card>
  )
}
