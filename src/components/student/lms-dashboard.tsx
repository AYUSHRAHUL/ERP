'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  BookOpen, Play, FileText, Clock, Calendar, 
  CheckCircle, Award, TrendingUp, Users,
  Video, Document, MessageSquare
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface LMSCourse {
  id: string
  title: string
  description?: string
  coverImage?: string
  course: {
    name: string
    code: string
    department: { name: string }
  }
  enrollments?: [{
    progress: number
    enrolledAt: string
  }]
  _count: {
    modules: number
    enrollments: number
  }
}

interface Module {
  id: string
  title: string
  description?: string
  lessons: Lesson[]
  assignments: Assignment[]
  _count: {
    lessons: number
    assignments: number
  }
}

interface Lesson {
  id: string
  title: string
  type: string
  duration?: number
  videoUrl?: string
  documentUrl?: string
  isCompleted?: boolean
}

interface Assignment {
  id: string
  title: string
  description: string
  dueDate: string
  maxPoints: number
  submission?: {
    grade?: number
    status: string
  }
}

export function LMSDashboard() {
  const [enrolledCourses, setEnrolledCourses] = useState<LMSCourse[]>([])
  const [availableCourses, setAvailableCourses] = useState<LMSCourse[]>([])
  const [selectedCourse, setSelectedCourse] = useState<LMSCourse | null>(null)
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const [enrolledRes, availableRes] = await Promise.all([
        fetch('/api/lms/courses?enrolled=true'),
        fetch('/api/lms/courses')
      ])
      
      const enrolled = await enrolledRes.json()
      const available = await availableRes.json()
      
      setEnrolledCourses(enrolled.filter((c: LMSCourse) => c.enrollments?.length > 0))
      setAvailableCourses(available.filter((c: LMSCourse) => !c.enrollments?.length))
    } catch (error) {
      console.error('Error fetching courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchModules = async (courseId: string) => {
    try {
      const response = await fetch(`/api/lms/courses/${courseId}/modules`)
      const data = await response.json()
      setModules(data)
    } catch (error) {
      console.error('Error fetching modules:', error)
    }
  }

  const enrollInCourse = async (courseId: string) => {
    try {
      const response = await fetch(`/api/lms/courses/${courseId}/enroll`, {
        method: 'POST'
      })
      
      if (response.ok) {
        fetchCourses()
      }
    } catch (error) {
      console.error('Error enrolling in course:', error)
    }
  }

  const openCourse = (course: LMSCourse) => {
    setSelectedCourse(course)
    fetchModules(course.id)
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return 'text-green-600'
    if (progress >= 70) return 'text-blue-600'
    if (progress >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'VIDEO': return <Video className="h-4 w-4" />
      case 'DOCUMENT': return <Document className="h-4 w-4" />
      case 'QUIZ': return <Award className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  if (selectedCourse) {
    return (
      <div className="space-y-6">
        {/* Course Header */}
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={() => setSelectedCourse(null)}
          >
            ← Back to Courses
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{selectedCourse.title}</h1>
            <p className="text-muted-foreground">
              {selectedCourse.course.name} • {selectedCourse.course.department.name}
            </p>
          </div>
        </div>

        {/* Course Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {modules.map((module) => (
              <Card key={module.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {module.title}
                    <Badge variant="outline">
                      {module._count.lessons} lessons • {module._count.assignments} assignments
                    </Badge>
                  </CardTitle>
                  {module.description && (
                    <CardDescription>{module.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Lessons */}
                  {module.lessons.map((lesson) => (
                    <div key={lesson.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getLessonIcon(lesson.type)}
                        <div>
                          <div className="font-medium">{lesson.title}</div>
                          {lesson.duration && (
                            <div className="text-sm text-gray-500 flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {lesson.duration} min
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {lesson.isCompleted && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                        <Button variant="outline" size="sm">
                          <Play className="h-3 w-3 mr-1" />
                          {lesson.type === 'VIDEO' ? 'Watch' : 'View'}
                        </Button>
                      </div>
                    </div>
                  ))}

                  {/* Assignments */}
                  {module.assignments.map((assignment) => (
                    <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg bg-yellow-50">
                      <div className="flex items-center space-x-3">
                        <Award className="h-4 w-4 text-orange-500" />
                        <div>
                          <div className="font-medium">{assignment.title}</div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            Due: {new Date(assignment.dueDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{assignment.maxPoints} pts</Badge>
                        <Button variant="outline" size="sm">
                          Submit
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Your Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Course Completion</span>
                      <span className={getProgressColor(selectedCourse.enrollments?.[0]?.progress || 0)}>
                        {selectedCourse.enrollments?.[0]?.progress || 0}%
                      </span>
                    </div>
                    <Progress value={selectedCourse.enrollments?.[0]?.progress || 0} />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {modules.reduce((sum, m) => sum + m._count.lessons, 0)}
                      </div>
                      <div className="text-sm text-gray-600">Total Lessons</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-600">
                        {modules.reduce((sum, m) => sum + m._count.assignments, 0)}
                      </div>
                      <div className="text-sm text-gray-600">Assignments</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <div className="text-sm">
                      <div>Completed "Introduction to React"</div>
                      <div className="text-gray-500">2 hours ago</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Award className="h-4 w-4 text-orange-500" />
                    <div className="text-sm">
                      <div>Submitted assignment "Project Setup"</div>
                      <div className="text-gray-500">1 day ago</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Learning Management</h1>
        <p className="text-muted-foreground">
          Access your courses, track progress, and enhance your learning experience
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrolledCourses.length}</div>
            <p className="text-xs text-muted-foreground">
              Active enrollments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {enrolledCourses.length > 0
                ? Math.round(
                    enrolledCourses.reduce((sum, course) => sum + (course.enrollments?.[0]?.progress || 0), 0) /
                    enrolledCourses.length
                  )
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Across all courses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Courses</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableCourses.length}</div>
            <p className="text-xs text-muted-foreground">
              Ready to enroll
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Assignments due
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Course Tabs */}
      <Tabs defaultValue="enrolled" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="enrolled">My Courses</TabsTrigger>
          <TabsTrigger value="available">Available Courses</TabsTrigger>
        </TabsList>

        <TabsContent value="enrolled" className="space-y-6">
          {loading ? (
            <div className="text-center py-8">Loading your courses...</div>
          ) : enrolledCourses.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Enrolled Courses</h3>
              <p className="text-muted-foreground mb-4">
                You haven't enrolled in any courses yet. Browse available courses to get started.
              </p>
              <Button onClick={() => {}}>Browse Courses</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map((course) => (
                <Card key={course.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <div onClick={() => openCourse(course)}>
                    {course.coverImage && (
                      <div className="h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                        <img 
                          src={course.coverImage} 
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {course.course.name} • {course.course.department.name}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Progress</span>
                            <span className={getProgressColor(course.enrollments?.[0]?.progress || 0)}>
                              {course.enrollments?.[0]?.progress || 0}%
                            </span>
                          </div>
                          <Progress value={course.enrollments?.[0]?.progress || 0} />
                        </div>
                        
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>{course._count.modules} modules</span>
                          <span>
                            Enrolled {formatDistanceToNow(new Date(course.enrollments?.[0]?.enrolledAt || ''), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="available" className="space-y-6">
          {loading ? (
            <div className="text-center py-8">Loading available courses...</div>
          ) : availableCourses.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Available Courses</h3>
              <p className="text-muted-foreground">
                All available courses have been enrolled or none are published yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableCourses.map((course) => (
                <Card key={course.id} className="hover:shadow-lg transition-shadow">
                  {course.coverImage && (
                    <div className="h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                      <img 
                        src={course.coverImage} 
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {course.course.name} • {course.course.department.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {course.description && (
                        <p className="text-sm text-gray-600 line-clamp-3">
                          {course.description}
                        </p>
                      )}
                      
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>{course._count.modules} modules</span>
                        <span>{course._count.enrollments} students</span>
                      </div>

                      <Button 
                        className="w-full"
                        onClick={() => enrollInCourse(course.id)}
                      >
                        Enroll Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
