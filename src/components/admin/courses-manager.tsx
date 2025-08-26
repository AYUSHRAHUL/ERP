'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BookOpen, Plus, Edit, Trash2, GraduationCap } from 'lucide-react'

interface Course {
  id: string
  name: string
  code: string
  credits: number
  semester: number
  department: {
    id: string
    name: string
    code: string
  }
  subjects: Array<{
    id: string
    name: string
    code: string
    credits: number
  }>
}

interface Department {
  id: string
  name: string
  code: string
}

interface Subject {
  id: string
  name: string
  code: string
  credits: number
  courseId: string
}

export function CoursesManager() {
  const [courses, setCourses] = useState<Course[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [subjectDialogOpen, setSubjectDialogOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [courseFormData, setCourseFormData] = useState({
    name: '',
    code: '',
    credits: 0,
    semester: 1,
    departmentId: ''
  })
  const [subjectFormData, setSubjectFormData] = useState({
    name: '',
    code: '',
    credits: 0,
    courseId: ''
  })

  useEffect(() => {
    fetchCourses()
    fetchDepartments()
  }, [])

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/admin/courses')
      const data = await response.json()
      setCourses(data)
    } catch (error) {
      console.error('Error fetching courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/departments')
      const data = await response.json()
      setDepartments(data)
    } catch (error) {
      console.error('Error fetching departments:', error)
    }
  }

  const resetCourseForm = () => {
    setCourseFormData({
      name: '',
      code: '',
      credits: 0,
      semester: 1,
      departmentId: ''
    })
    setEditingCourse(null)
  }

  const resetSubjectForm = () => {
    setSubjectFormData({
      name: '',
      code: '',
      credits: 0,
      courseId: ''
    })
  }

  const handleSaveCourse = async () => {
    try {
      const url = editingCourse 
        ? `/api/admin/courses/${editingCourse.id}`
        : '/api/admin/courses'
      
      const method = editingCourse ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseFormData)
      })

      if (response.ok) {
        setDialogOpen(false)
        resetCourseForm()
        fetchCourses()
      }
    } catch (error) {
      console.error('Error saving course:', error)
    }
  }

  const handleSaveSubject = async () => {
    try {
      const response = await fetch('/api/admin/subjects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subjectFormData)
      })

      if (response.ok) {
        setSubjectDialogOpen(false)
        resetSubjectForm()
        fetchCourses()
      }
    } catch (error) {
      console.error('Error saving subject:', error)
    }
  }

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course)
    setCourseFormData({
      name: course.name,
      code: course.code,
      credits: course.credits,
      semester: course.semester,
      departmentId: course.department.id
    })
    setDialogOpen(true)
  }

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return

    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchCourses()
      }
    } catch (error) {
      console.error('Error deleting course:', error)
    }
  }

  const handleAddSubject = (course: Course) => {
    setSelectedCourse(course)
    setSubjectFormData(prev => ({ ...prev, courseId: course.id }))
    setSubjectDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Courses Management</h2>
          <p className="text-muted-foreground">
            Create and manage courses, subjects, and curriculum
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetCourseForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Course
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingCourse ? 'Edit Course' : 'Add New Course'}
              </DialogTitle>
              <DialogDescription>
                Fill in the course details below.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="courseName">Course Name</Label>
                <Input
                  id="courseName"
                  value={courseFormData.name}
                  onChange={(e) => setCourseFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Bachelor of Technology"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="courseCode">Course Code</Label>
                  <Input
                    id="courseCode"
                    value={courseFormData.code}
                    onChange={(e) => setCourseFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    placeholder="e.g., BTECH"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="credits">Total Credits</Label>
                  <Input
                    id="credits"
                    type="number"
                    value={courseFormData.credits}
                    onChange={(e) => setCourseFormData(prev => ({ ...prev, credits: Number(e.target.value) }))}
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="semester">Duration (Semesters)</Label>
                  <Select 
                    value={courseFormData.semester.toString()} 
                    onValueChange={(value) => setCourseFormData(prev => ({ ...prev, semester: Number(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4,5,6,7,8].map(sem => (
                        <SelectItem key={sem} value={sem.toString()}>{sem} Semesters</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select 
                    value={courseFormData.departmentId} 
                    onValueChange={(value) => setCourseFormData(prev => ({ ...prev, departmentId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveCourse}>
                {editingCourse ? 'Update' : 'Create'} Course
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Subject Dialog */}
      <Dialog open={subjectDialogOpen} onOpenChange={setSubjectDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Subject</DialogTitle>
            <DialogDescription>
              Add a subject to {selectedCourse?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="subjectName">Subject Name</Label>
              <Input
                id="subjectName"
                value={subjectFormData.name}
                onChange={(e) => setSubjectFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Data Structures and Algorithms"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subjectCode">Subject Code</Label>
                <Input
                  id="subjectCode"
                  value={subjectFormData.code}
                  onChange={(e) => setSubjectFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  placeholder="e.g., CSE201"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subjectCredits">Credits</Label>
                <Input
                  id="subjectCredits"
                  type="number"
                  value={subjectFormData.credits}
                  onChange={(e) => setSubjectFormData(prev => ({ ...prev, credits: Number(e.target.value) }))}
                  min="1"
                  max="10"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSubjectDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSubject}>
              Add Subject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Courses List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-8">Loading courses...</div>
        ) : courses.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            No courses found
          </div>
        ) : (
          courses.map((course) => (
            <Card key={course.id} className="h-full">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center">
                      <BookOpen className="mr-2 h-5 w-5" />
                      {course.name}
                    </CardTitle>
                    <CardDescription>
                      {course.code} • {course.department.name}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => handleEditCourse(course)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteCourse(course.id)}>
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="font-medium text-blue-600">{course.credits}</div>
                    <div className="text-gray-600">Total Credits</div>
                  </div>
                  <div>
                    <div className="font-medium text-green-600">{course.semester}</div>
                    <div className="text-gray-600">Semesters</div>
                  </div>
                  <div>
                    <div className="font-medium text-purple-600">{course.subjects.length}</div>
                    <div className="text-gray-600">Subjects</div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-sm">Subjects</h4>
                    <Button variant="outline" size="sm" onClick={() => handleAddSubject(course)}>
                      <Plus className="h-3 w-3 mr-1" />
                      Add Subject
                    </Button>
                  </div>
                  
                  {course.subjects.length === 0 ? (
                    <div className="text-sm text-gray-500 text-center py-2">
                      No subjects added yet
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {course.subjects.map((subject) => (
                        <div key={subject.id} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                          <div>
                            <div className="font-medium">{subject.name}</div>
                            <div className="text-gray-600">{subject.code}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{subject.credits}</div>
                            <div className="text-gray-600">credits</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
