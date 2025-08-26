'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, User, BookOpen } from 'lucide-react'

interface AttendanceRecord {
  id: string
  date: string
  status: string
  subject: {
    name: string
    code: string
  }
  faculty: {
    firstName: string
    lastName: string
  }
}

interface StudentAttendanceProps {
  userId: string
}

export function StudentAttendance({ userId }: StudentAttendanceProps) {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [selectedSubject, setSelectedSubject] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAttendance()
  }, [selectedSubject])

  const fetchAttendance = async () => {
    try {
      const params = new URLSearchParams()
      if (selectedSubject !== 'all') {
        params.append('subjectId', selectedSubject)
      }

      const response = await fetch(`/api/attendance?${params.toString()}`)
      const data = await response.json()
      setAttendance(data)
    } catch (error) {
      console.error('Error fetching attendance:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateAttendanceStats = () => {
    if (attendance.length === 0) return { percentage: 0, present: 0, total: 0 }

    const present = attendance.filter(a => a.status === 'PRESENT').length
    const total = attendance.length
    const percentage = (present / total) * 100

    return { percentage, present, total }
  }

  const { percentage, present, total } = calculateAttendanceStats()

  const getAttendanceStatus = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return { badge: 'Present', variant: 'default' as const }
      case 'ABSENT':
        return { badge: 'Absent', variant: 'destructive' as const }
      case 'LATE':
        return { badge: 'Late', variant: 'secondary' as const }
      default:
        return { badge: status, variant: 'outline' as const }
    }
  }

  if (loading) {
    return <div>Loading attendance data...</div>
  }

  return (
    <div className="space-y-6">
      {/* Attendance Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Attendance Overview
          </CardTitle>
          <CardDescription>Your overall attendance statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{percentage.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Overall Attendance</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{present}</div>
              <div className="text-sm text-gray-600">Classes Attended</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{total}</div>
              <div className="text-sm text-gray-600">Total Classes</div>
            </div>
          </div>
          <Progress value={percentage} className="h-3" />
          <div className="mt-2 text-sm text-gray-600">
            {percentage >= 75 ? (
              <span className="text-green-600">✓ Meeting attendance requirement (75%)</span>
            ) : (
              <span className="text-red-600">⚠ Below attendance requirement (75%)</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Attendance Records */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
          <CardDescription>Detailed attendance history</CardDescription>
          <div className="pt-4">
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {/* In real app, populate with actual subjects */}
                <SelectItem value="subject1">Data Structures</SelectItem>
                <SelectItem value="subject2">Database Systems</SelectItem>
                <SelectItem value="subject3">Software Engineering</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {attendance.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No attendance records found
            </div>
          ) : (
            <div className="space-y-3">
              {attendance.map((record) => {
                const { badge, variant } = getAttendanceStatus(record.status)
                return (
                  <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div>
                        <div className="font-medium">{record.subject.name}</div>
                        <div className="text-sm text-gray-600 flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          {record.faculty.firstName} {record.faculty.lastName}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600 mb-1">
                        {new Date(record.date).toLocaleDateString()}
                      </div>
                      <Badge variant={variant}>{badge}</Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
