'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Calendar, Users, Save, CheckCircle } from 'lucide-react'

interface Student {
  id: string
  rollNumber: string
  firstName: string
  lastName: string
  present?: boolean
}

interface Subject {
  id: string
  name: string
  code: string
}

interface AttendanceManagerProps {
  userId: string
}

export function AttendanceManager({ userId }: AttendanceManagerProps) {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  const [students, setStudents] = useState<Student[]>([])
  const [attendanceDate, setAttendanceDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchSubjects()
  }, [])

  useEffect(() => {
    if (selectedSubject) {
      fetchStudents()
    }
  }, [selectedSubject])

  const fetchSubjects = async () => {
    try {
      const response = await fetch('/api/faculty/subjects')
      const data = await response.json()
      setSubjects(data)
    } catch (error) {
      console.error('Error fetching subjects:', error)
    }
  }

  const fetchStudents = async () => {
    if (!selectedSubject) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/faculty/students?subjectId=${selectedSubject}`)
      const data = await response.json()
      setStudents(data.map((student: any) => ({ ...student, present: false })))
    } catch (error) {
      console.error('Error fetching students:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAttendanceChange = (studentId: string, present: boolean) => {
    setStudents(prev => 
      prev.map(student => 
        student.id === studentId ? { ...student, present } : student
      )
    )
  }

  const markAllPresent = () => {
    setStudents(prev => prev.map(student => ({ ...student, present: true })))
  }

  const markAllAbsent = () => {
    setStudents(prev => prev.map(student => ({ ...student, present: false })))
  }

  const saveAttendance = async () => {
    if (!selectedSubject || students.length === 0) return

    setSaving(true)
    try {
      const attendanceRecords = students.map(student => ({
        studentId: student.id,
        subjectId: selectedSubject,
        date: attendanceDate,
        status: student.present ? 'PRESENT' : 'ABSENT'
      }))

      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ attendanceRecords })
      })

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      }
    } catch (error) {
      console.error('Error saving attendance:', error)
    } finally {
      setSaving(false)
    }
  }

  const presentCount = students.filter(s => s.present).length
  const absentCount = students.length - presentCount

  return (
    <div className="space-y-6">
      {/* Subject Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Mark Attendance
          </CardTitle>
          <CardDescription>
            Select subject and date to mark student attendance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name} ({subject.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Attendance saved successfully!
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Student Attendance List */}
      {selectedSubject && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Student List
                </CardTitle>
                <CardDescription>
                  Mark attendance for {students.length} students
                </CardDescription>
              </div>
              <div className="flex space-x-2">
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  Present: {presentCount}
                </Badge>
                <Badge variant="outline" className="bg-red-50 text-red-700">
                  Absent: {absentCount}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Bulk Actions */}
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={markAllPresent}>
                Mark All Present
              </Button>
              <Button variant="outline" size="sm" onClick={markAllAbsent}>
                Mark All Absent
              </Button>
            </div>

            {/* Student List */}
            {loading ? (
              <div className="text-center py-8">Loading students...</div>
            ) : students.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No students found for this subject
              </div>
            ) : (
              <div className="space-y-2">
                {students.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={student.present}
                        onCheckedChange={(checked) => 
                          handleAttendanceChange(student.id, checked as boolean)
                        }
                      />
                      <div>
                        <div className="font-medium">
                          {student.firstName} {student.lastName}
                        </div>
                        <div className="text-sm text-gray-600">
                          Roll: {student.rollNumber}
                        </div>
                      </div>
                    </div>
                    <Badge variant={student.present ? 'default' : 'secondary'}>
                      {student.present ? 'Present' : 'Absent'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}

            {/* Save Button */}
            {students.length > 0 && (
              <div className="pt-4 border-t">
                <Button 
                  onClick={saveAttendance} 
                  disabled={saving}
                  className="w-full"
                >
                  {saving ? (
                    <>
                      <Save className="mr-2 h-4 w-4 animate-spin" />
                      Saving Attendance...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Attendance
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
