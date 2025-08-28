'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Plus, BookOpen, Users, Play, FileText, 
  Settings, Edit, Trash2, Upload, Save
} from 'lucide-react'

interface Course {
  id: string
  name: string
  code: string
  department: { name: string }
}

interface LMSCourse {
  id: string
  title: string
  description?: string
  isPublished: boolean
  course: Course
  _count: {
    modules: number
    enrollments: number
  }
}

export function LMSCourseCreator() {
  const [courses, setCourses] = useState<Course[]>([])
  const [lmsCourses, setLmsCourses] = useState<LMSCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

  const [courseForm, setCourseForm] = useState({
    courseId: '',
    title: '',
    description: '',
    coverImage: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [coursesRes, lmsCoursesRes] = await Promise.all([
        fetch('/api/faculty/subjects'), // Reuse existing endpoint
        fetch('/api/lms/courses')
      ])
      
      const coursesData = await coursesRes.json()
      const lmsCoursesData = await lmsCoursesRes.json()
      
      setCourses(coursesData)
      setLmsCourses(lmsCoursesData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCourse = async () => {
    try {
      const response = await fetch('/api/lms/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseForm)
      })

      if (response.ok) {
        setDialogOpen(false)
        resetForm()
        fetchData()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create LMS course')
      }
    } catch (error) {
      console.error('Error creating LMS course:', error)
    }
  }

  const resetForm = () => {
    setCourseForm({
      courseId: '',
      title: '',
      description: '',
      coverImage: ''
    })
  }

  const togglePublish = async (courseId: string, isPublished: boolean) => {
    try {
      const response = await fetch(`/api/lms/courses/${courseId}/publish`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isPublished: !isPublished })
      })

      if (response.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Error toggling publish status:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Learning Management</h2>
          <p className="text-muted-foreground">
            Create and manage online courses for your students
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Create LMS Course
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New LMS Course</DialogTitle>
              <DialogDescription>
                Set up a new online learning course for your students.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="courseId">Base Course</Label>
                <Select 
                  value={courseForm.courseId} 
                  onValueChange={(value) => setCourseForm(prev => ({ ...prev, courseId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select course to base LMS on" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name} ({course.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">LMS Course Title</Label>
                <Input
                  id="title"
                  value={courseForm.title}
                  onChange={(e) => setCourseForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter course title for LMS"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={courseForm.description}
                  onChange={(e) => setCourseForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what students will learn..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="coverImage">Cover Image URL (Optional)</Label>
                <Input
                  id="coverImage"
                  value={courseForm.coverImage}
                  onChange={(e) => setCourseForm(prev => ({ ...prev, coverImage: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateCourse}>
                Create Course
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Course Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lmsCourses.length}</div>
            <p className="text-xs text-muted-foreground">
              LMS courses created
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lmsCourses.filter(c => c.isPublished).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Live courses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lmsCourses.reduce((sum, course) => sum + course._count.enrollments, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Enrolled students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Modules</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lmsCourses.length > 0 
                ? Math.round(lmsCourses.reduce((sum, course) => sum + course._count.modules, 0) / lmsCourses.length)
                : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Modules per course
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-8">Loading courses...</div>
        ) : lmsCourses.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No LMS Courses</h3>
            <p className="text-muted-foreground mb-4">
              Create your first online course to get started with the Learning Management System.
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create First Course
            </Button>
          </div>
        ) : (
          lmsCourses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                    <CardDescription>
                      {course.course.name} • {course.course.department.name}
                    </CardDescription>
                  </div>
                  <Badge variant={course.isPublished ? 'default' : 'secondary'}>
                    {course.isPublished ? 'Published' : 'Draft'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {course.description && (
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {course.description}
                  </p>
                )}
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-gray-500" />
                    {course._count.modules} modules
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-gray-500" />
                    {course._count.enrollments} students
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => togglePublish(course.id, course.isPublished)}
                  >
                    {course.isPublished ? 'Unpublish' : 'Publish'}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
