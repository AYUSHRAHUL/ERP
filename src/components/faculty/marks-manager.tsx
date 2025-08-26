'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileText, Save, Plus, CheckCircle, Edit } from 'lucide-react'

interface Student {
  id: string
  rollNumber: string
  firstName: string
  lastName: string
}

interface Subject {
  id: string
  name: string
  code: string
}

interface MarkEntry {
  studentId: string
  student?: Student
  obtainedMarks: number
  maxMarks: number
  examType: string
}

interface MarksManagerProps {
  userId: string
}

export function MarksManager({ userId }: MarksManagerProps) {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  const [students, setStudents] = useState<Student[]>([])
  const [markEntries, setMarkEntries] = useState<MarkEntry[]>([])
  const [examType, setExamType] = useState<string>('QUIZ')
  const [maxMarks, setMaxMarks] = useState<number>(100)
  const [semester, setSemester] = useState<number>(1)
  const [year, setYear] = useState<number>(new Date().getFullYear())
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

  useEffect(() => {
    if (students.length > 0) {
      initializeMarkEntries()
    }
  }, [students, examType, maxMarks])

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
      setStudents(data)
    } catch (error) {
      console.error('Error fetching students:', error)
    } finally {
      setLoading(false)
    }
  }

  const initializeMarkEntries = () => {
    setMarkEntries(students.map(student => ({
      studentId: student.id,
      student,
      obtainedMarks: 0,
      maxMarks,
      examType
    })))
  }

  const updateMarkEntry = (studentId: string, obtainedMarks: number) => {
    setMarkEntries(prev =>
      prev.map(entry =>
        entry.studentId === studentId
          ? { ...entry, obtainedMarks: Math.min(obtainedMarks, maxMarks) }
          : entry
      )
    )
  }

  const saveMarks = async () => {
    if (!selectedSubject || markEntries.length === 0) return

    setSaving(true)
    try {
      const promises = markEntries.map(entry =>
        fetch('/api/marks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            studentId: entry.studentId,
            subjectId: selectedSubject,
            examType: entry.examType,
            maxMarks: entry.maxMarks,
            obtainedMarks: entry.obtainedMarks,
            semester,
            year
          })
        })
      )

      await Promise.all(promises)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      console.error('Error saving marks:', error)
    } finally {
      setSaving(false)
    }
  }

  const calculateGrade = (obtained: number, max: number) => {
    const percentage = (obtained / max) * 100
    if (percentage >= 90) return { grade: 'A+', color: 'bg-green-100 text-green-800' }
    if (percentage >= 80) return { grade: 'A', color: 'bg-green-100 text-green-800' }
    if (percentage >= 70) return { grade: 'B', color: 'bg-blue-100 text-blue-800' }
    if (percentage >= 60) return { grade: 'C', color: 'bg-yellow-100 text-yellow-800' }
    if (percentage >= 50) return { grade: 'D', color: 'bg-orange-100 text-orange-800' }
    return { grade: 'F', color: 'bg-red-100 text-red-800' }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Marks Entry
          </CardTitle>
          <CardDescription>
            Enter marks for students across different assessments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
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
              <label className="text-sm font-medium">Exam Type</label>
              <Select value={examType} onValueChange={setExamType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="QUIZ">Quiz</SelectItem>
                  <SelectItem value="MIDTERM">Midterm</SelectItem>
                  <SelectItem value="FINAL">Final Exam</SelectItem>
                  <SelectItem value="ASSIGNMENT">Assignment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Max Marks</label>
              <Input
                type="number"
                value={maxMarks}
                onChange={(e) => setMaxMarks(Number(e.target.value))}
                min={1}
                max={1000}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Semester</label>
              <Select value={semester.toString()} onValueChange={(v) => setSemester(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                    <SelectItem key={sem} value={sem.toString()}>Semester {sem}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Marks saved successfully!
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {selectedSubject && (
        <Tabs defaultValue="entry" className="w-full">
          <TabsList>
            <TabsTrigger value="entry">Mark Entry</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
          </TabsList>

          <TabsContent value="entry">
            <Card>
              <CardHeader>
                <CardTitle>Student Marks Entry</CardTitle>
                <CardDescription>
                  Enter marks for {students.length} students • {examType} • Max: {maxMarks}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading students...</div>
                ) : students.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No students found for this subject
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-3">
                      {markEntries.map((entry) => {
                        const { grade, color } = calculateGrade(entry.obtainedMarks, entry.maxMarks)
                        const percentage = entry.maxMarks > 0 ? (entry.obtainedMarks / entry.maxMarks * 100) : 0

                        return (
                          <div key={entry.studentId} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex-1">
                              <div className="font-medium">
                                {entry.student?.firstName} {entry.student?.lastName}
                              </div>
                              <div className="text-sm text-gray-600">
                                Roll: {entry.student?.rollNumber}
                              </div>
                            </div>

                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                <Input
                                  type="number"
                                  value={entry.obtainedMarks}
                                  onChange={(e) => updateMarkEntry(entry.studentId, Number(e.target.value))}
                                  min={0}
                                  max={entry.maxMarks}
                                  className="w-20"
                                />
                                <span className="text-sm text-gray-500">/ {entry.maxMarks}</span>
                              </div>

                              <Badge className={color}>
                                {grade}
                              </Badge>

                              <div className="text-sm text-gray-600 w-16 text-right">
                                {percentage.toFixed(1)}%
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <div className="pt-4 border-t">
                      <Button 
                        onClick={saveMarks} 
                        disabled={saving}
                        className="w-full"
                      >
                        {saving ? (
                          <>
                            <Save className="mr-2 h-4 w-4 animate-spin" />
                            Saving Marks...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save All Marks
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="summary">
            <Card>
              <CardHeader>
                <CardTitle>Marks Summary</CardTitle>
                <CardDescription>Statistical overview of marks entered</CardDescription>
              </CardHeader>
              <CardContent>
                {markEntries.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {(markEntries.reduce((sum, entry) => sum + entry.obtainedMarks, 0) / markEntries.length / maxMarks * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">Average Score</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {Math.max(...markEntries.map(e => e.obtainedMarks))}
                      </div>
                      <div className="text-sm text-gray-600">Highest Score</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {Math.min(...markEntries.map(e => e.obtainedMarks))}
                      </div>
                      <div className="text-sm text-gray-600">Lowest Score</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {markEntries.filter(e => (e.obtainedMarks / e.maxMarks) >= 0.6).length}
                      </div>
                      <div className="text-sm text-gray-600">Pass Count</div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="font-medium">Grade Distribution</h4>
                  {['A+', 'A', 'B', 'C', 'D', 'F'].map(gradeLetter => {
                    const count = markEntries.filter(entry => {
                      const percentage = (entry.obtainedMarks / entry.maxMarks) * 100
                      const { grade } = calculateGrade(entry.obtainedMarks, entry.maxMarks)
                      return grade === gradeLetter
                    }).length
                    
                    const percentage = markEntries.length > 0 ? (count / markEntries.length) * 100 : 0
                    
                    return (
                      <div key={gradeLetter} className="flex justify-between items-center py-2">
                        <span>Grade {gradeLetter}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm w-12">{count} ({percentage.toFixed(0)}%)</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
