'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Award, TrendingUp, BarChart3 } from 'lucide-react'

interface Mark {
  id: string
  obtainedMarks: number
  maxMarks: number
  examType: string
  semester: number
  year: number
  createdAt: string
  subject: {
    name: string
    code: string
    credits: number
  }
  faculty: {
    firstName: string
    lastName: string
  }
}

interface StudentMarksProps {
  userId: string
}

export function StudentMarks({ userId }: StudentMarksProps) {
  const [marks, setMarks] = useState<Mark[]>([])
  const [selectedSemester, setSelectedSemester] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMarks()
  }, [selectedSemester])

  const fetchMarks = async () => {
    try {
      const params = new URLSearchParams()
      if (selectedSemester !== 'all') {
        params.append('semester', selectedSemester)
      }

      const response = await fetch(`/api/marks?${params.toString()}`)
      const data = await response.json()
      setMarks(data)
    } catch (error) {
      console.error('Error fetching marks:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateGPA = (semesterMarks: Mark[]) => {
    if (semesterMarks.length === 0) return 0

    const gradePoints = semesterMarks.map(mark => {
      const percentage = (mark.obtainedMarks / mark.maxMarks) * 100
      let gp = 0
      if (percentage >= 90) gp = 10
      else if (percentage >= 80) gp = 9
      else if (percentage >= 70) gp = 8
      else if (percentage >= 60) gp = 7
      else if (percentage >= 50) gp = 6
      else if (percentage >= 40) gp = 5
      else gp = 0

      return { gp, credits: mark.subject.credits }
    })

    const totalPoints = gradePoints.reduce((sum, g) => sum + (g.gp * g.credits), 0)
    const totalCredits = gradePoints.reduce((sum, g) => sum + g.credits, 0)

    return totalCredits > 0 ? totalPoints / totalCredits : 0
  }

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return { grade: 'A+', color: 'bg-green-100 text-green-800' }
    if (percentage >= 80) return { grade: 'A', color: 'bg-green-100 text-green-800' }
    if (percentage >= 70) return { grade: 'B', color: 'bg-blue-100 text-blue-800' }
    if (percentage >= 60) return { grade: 'C', color: 'bg-yellow-100 text-yellow-800' }
    if (percentage >= 50) return { grade: 'D', color: 'bg-orange-100 text-orange-800' }
    return { grade: 'F', color: 'bg-red-100 text-red-800' }
  }

  const groupedBySemester = marks.reduce((acc, mark) => {
    const key = `${mark.year}-${mark.semester}`
    if (!acc[key]) acc[key] = []
    acc[key].push(mark)
    return acc
  }, {} as Record<string, Mark[]>)

  const overallGPA = calculateGPA(marks)

  if (loading) {
    return <div>Loading marks data...</div>
  }

  return (
    <div className="space-y-6">
      {/* Academic Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall GPA</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallGPA.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Out of 10.0
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subjects</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{marks.length}</div>
            <p className="text-xs text-muted-foreground">
              Across all semesters
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {marks.length > 0 
                ? ((marks.reduce((sum, mark) => sum + (mark.obtainedMarks / mark.maxMarks * 100), 0) / marks.length).toFixed(1) + '%')
                : '0%'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Percentage across subjects
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Marks by Semester */}
      <Card>
        <CardHeader>
          <CardTitle>Academic Results</CardTitle>
          <CardDescription>Your examination results organized by semester</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Semesters</TabsTrigger>
              <TabsTrigger value="current">Current Semester</TabsTrigger>
              <TabsTrigger value="previous">Previous Semester</TabsTrigger>
              <TabsTrigger value="summary">Summary</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {Object.entries(groupedBySemester).map(([semesterKey, semesterMarks]) => {
                const [year, semester] = semesterKey.split('-')
                const semesterGPA = calculateGPA(semesterMarks)

                return (
                  <Card key={semesterKey}>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">
                          Semester {semester}, {year}
                        </CardTitle>
                        <Badge variant="outline">
                          GPA: {semesterGPA.toFixed(2)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {semesterMarks.map((mark) => {
                          const percentage = (mark.obtainedMarks / mark.maxMarks) * 100
                          const { grade, color } = getGrade(percentage)

                          return (
                            <div key={mark.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex-1">
                                <div className="font-medium">{mark.subject.name}</div>
                                <div className="text-sm text-gray-600">
                                  {mark.subject.code} • {mark.examType} • Credits: {mark.subject.credits}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Faculty: {mark.faculty.firstName} {mark.faculty.lastName}
                                </div>
                              </div>
                              
                              <div className="text-right space-y-2">
                                <div className="font-bold">
                                  {mark.obtainedMarks}/{mark.maxMarks}
                                </div>
                                <Badge className={color}>{grade}</Badge>
                                <div className="w-24">
                                  <Progress value={percentage} className="h-2" />
                                  <div className="text-xs text-center mt-1">
                                    {percentage.toFixed(1)}%
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </TabsContent>

            <TabsContent value="current" className="space-y-4">
              <div className="text-center py-8 text-gray-500">
                Current semester results will appear here
              </div>
            </TabsContent>

            <TabsContent value="previous" className="space-y-4">
              <div className="text-center py-8 text-gray-500">
                Previous semester results will appear here
              </div>
            </TabsContent>

            <TabsContent value="summary" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Grade Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {['A+', 'A', 'B', 'C', 'D', 'F'].map(gradeLetter => {
                      const count = marks.filter(mark => {
                        const percentage = (mark.obtainedMarks / mark.maxMarks) * 100
                        return getGrade(percentage).grade === gradeLetter
                      }).length
                      
                      return (
                        <div key={gradeLetter} className="flex justify-between items-center py-2">
                          <span>Grade {gradeLetter}</span>
                          <div className="flex items-center space-x-2">
                            <Progress value={marks.length > 0 ? (count / marks.length) * 100 : 0} className="w-20 h-2" />
                            <span className="text-sm w-8">{count}</span>
                          </div>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Performance Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(groupedBySemester).map(([semesterKey, semesterMarks]) => {
                        const [year, semester] = semesterKey.split('-')
                        const avgPercentage = semesterMarks.reduce((sum, mark) => 
                          sum + (mark.obtainedMarks / mark.maxMarks * 100), 0) / semesterMarks.length

                        return (
                          <div key={semesterKey} className="flex justify-between items-center py-2">
                            <span>Sem {semester}, {year}</span>
                            <div className="flex items-center space-x-2">
                              <Progress value={avgPercentage} className="w-20 h-2" />
                              <span className="text-sm w-12">{avgPercentage.toFixed(1)}%</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
