'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, MapPin, Plus, Users } from 'lucide-react'

interface TimetableEntry {
  id: string
  dayOfWeek: string
  startTime: string
  endTime: string
  subject: {
    name: string
    code: string
    course: { name: string }
  }
  faculty: {
    firstName: string
    lastName: string
  }
  room?: {
    number: string
    name?: string
  }
}

export function TimetableManager() {
  const [timetables, setTimetables] = useState<TimetableEntry[]>([])
  const [subjects, setSubjects] = useState([])
  const [faculty, setFaculty] = useState([])
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedSemester, setSelectedSemester] = useState('1')
  const [selectedYear, setSelectedYear] = useState('2024')

  const [formData, setFormData] = useState({
    subjectId: '',
    facultyId: '',
    roomId: '',
    dayOfWeek: '',
    startTime: '',
    endTime: '',
    semester: 1,
    year: 2024
  })

  useEffect(() => {
    fetchTimetables()
    fetchSubjects()
    fetchFaculty()
    fetchRooms()
  }, [selectedSemester, selectedYear])

  const fetchTimetables = async () => {
    try {
      const response = await fetch(`/api/timetable?semester=${selectedSemester}&year=${selectedYear}`)
      const data = await response.json()
      setTimetables(data)
    } catch (error) {
      console.error('Error fetching timetables:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSubjects = async () => {
    try {
      const response = await fetch('/api/admin/subjects')
      const data = await response.json()
      setSubjects(data)
    } catch (error) {
      console.error('Error fetching subjects:', error)
    }
  }

  const fetchFaculty = async () => {
    try {
      const response = await fetch('/api/admin/faculty')
      const data = await response.json()
      setFaculty(data)
    } catch (error) {
      console.error('Error fetching faculty:', error)
    }
  }

  const fetchRooms = async () => {
    try {
      const response = await fetch('/api/rooms')
      const data = await response.json()
      setRooms(data)
    } catch (error) {
      console.error('Error fetching rooms:', error)
    }
  }

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/timetable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          semester: parseInt(selectedSemester),
          year: parseInt(selectedYear)
        })
      })

      if (response.ok) {
        setDialogOpen(false)
        resetForm()
        fetchTimetables()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create timetable entry')
      }
    } catch (error) {
      console.error('Error creating timetable entry:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      subjectId: '',
      facultyId: '',
      roomId: '',
      dayOfWeek: '',
      startTime: '',
      endTime: '',
      semester: parseInt(selectedSemester),
      year: parseInt(selectedYear)
    })
  }

  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
  ]

  const groupedTimetables = timetables.reduce((acc, entry) => {
    if (!acc[entry.dayOfWeek]) {
      acc[entry.dayOfWeek] = []
    }
    acc[entry.dayOfWeek].push(entry)
    return acc
  }, {} as Record<string, TimetableEntry[]>)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Timetable Management</h2>
          <p className="text-muted-foreground">
            Create and manage class schedules for all departments
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Class
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Schedule New Class</DialogTitle>
              <DialogDescription>
                Add a new class to the timetable for semester {selectedSemester}, {selectedYear}.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Select 
                    value={formData.subjectId} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, subjectId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject: any) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name} ({subject.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="faculty">Faculty</Label>
                  <Select 
                    value={formData.facultyId} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, facultyId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select faculty" />
                    </SelectTrigger>
                    <SelectContent>
                      {faculty.map((member: any) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.firstName} {member.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="day">Day</Label>
                  <Select 
                    value={formData.dayOfWeek} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, dayOfWeek: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      {days.map((day) => (
                        <SelectItem key={day} value={day}>
                          {day.charAt(0) + day.slice(1).toLowerCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Select 
                    value={formData.startTime} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, startTime: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Start time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Select 
                    value={formData.endTime} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, endTime: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="End time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="room">Room (Optional)</Label>
                <Select 
                  value={formData.roomId} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, roomId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select room" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No specific room</SelectItem>
                    {rooms.map((room: any) => (
                      <SelectItem key={room.id} value={room.id}>
                        {room.number} - {room.name || 'General Room'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                Schedule Class
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Timetable</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="space-y-2">
              <Label>Semester</Label>
              <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1,2,3,4,5,6,7,8].map(sem => (
                    <SelectItem key={sem} value={sem.toString()}>
                      Semester {sem}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Academic Year</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2023, 2024, 2025].map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timetable Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
        {days.map((day) => (
          <Card key={day}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{day.charAt(0) + day.slice(1).toLowerCase()}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {groupedTimetables[day]?.map((entry) => (
                <div key={entry.id} className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <div className="font-medium text-sm">{entry.subject.name}</div>
                  <div className="text-xs text-gray-600">{entry.subject.code}</div>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <Clock className="h-3 w-3 mr-1" />
                    {entry.startTime} - {entry.endTime}
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <Users className="h-3 w-3 mr-1" />
                    {entry.faculty.firstName} {entry.faculty.lastName}
                  </div>
                  {entry.room && (
                    <div className="flex items-center text-xs text-gray-500">
                      <MapPin className="h-3 w-3 mr-1" />
                      {entry.room.number}
                    </div>
                  )}
                </div>
              )) || (
                <div className="text-center text-gray-500 text-sm py-4">
                  No classes scheduled
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
