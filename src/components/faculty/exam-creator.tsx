'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Plus, Clock, Users, BookOpen, Settings, 
  Edit, Trash2, Eye, Calendar, Target
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Exam {
  id: string
  title: string
  description?: string
  duration: number
  totalMarks: number
  passingMarks: number
  startDate: string
  endDate: string
  isActive: boolean
  subject: {
    name: string
    code: string
    course: { name: string }
  }
  faculty: {
    firstName: string
    lastName: string
  }
  _count: {
    questions: number
    submissions: number
  }
}

interface Subject {
  id: string
  name: string
  code: string
}

export function ExamCreator() {
  const [exams, setExams] = useState<Exam[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedTab, setSelectedTab] = useState('overview')

  const [examForm, setExamForm] = useState({
    title: '',
    description: '',
    subjectId: '',
    duration: 60,
    totalMarks: 100,
    passingMarks: 40,
    startDate: '',
    endDate: '',
    instructions: '',
    shuffleQuestions: false,
    showResults: false,
    allowReview: false
  })

  useEffect(() => {
    fetchExams()
    fetchSubjects()
  }, [])

  const fetchExams = async () => {
    try {
      const response = await fetch('/api/exams')
      const data = await response.json()
      setExams(data)
    } catch (error) {
      console.error('Error fetching exams:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSubjects = async () => {
    try {
      const response = await fetch('/api/faculty/subjects')
      const data = await response.json()
      setSubjects(data)
    } catch (error) {
      console.error('Error fetching subjects:', error)
    }
  }

  const handleCreateExam = async () => {
    try {
      const response = await fetch('/api/exams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(examForm)
      })

      if (response.ok) {
        setDialogOpen(false)
        resetForm()
        fetchExams()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create exam')
      }
    } catch (error) {
      console.error('Error creating exam:', error)
    }
  }

  const resetForm = () => {
    setExamForm({
      title: '',
      description: '',
      subjectId: '',
      duration: 60,
      totalMarks: 100,
      passingMarks: 40,
      startDate: '',
      endDate: '',
      instructions: '',
      shuffleQuestions: false,
      showResults: false,
      allowReview: false
    })
  }

  const getExamStatus = (exam: Exam) => {
    const now = new Date()
    const start = new Date(exam.startDate)
    const end = new Date(exam.endDate)

    if (!exam.isActive) return { status: 'Inactive', color: 'bg-gray-100 text-gray-800' }
    if (now < start) return { status: 'Scheduled', color: 'bg-blue-100 text-blue-800' }
    if (now > end) return { status: 'Ended', color: 'bg-red-100 text-red-800' }
    return { status: 'Active', color: 'bg-green-100 text-green-800' }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Online Examinations</h2>
          <p className="text-muted-foreground">
            Create and manage online exams for your students
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Create Exam
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Create New Exam</DialogTitle>
              <DialogDescription>
                Set up a new online examination for your students.
              </DialogDescription>
            </DialogHeader>
            
            <ScrollArea className="max-h-[60vh] px-1">
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Exam Title</Label>
                    <Input
                      id="title"
                      value={examForm.title}
                      onChange={(e) => setExamForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter exam title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Select 
                      value={examForm.subjectId} 
                      onValueChange={(value) => setExamForm(prev => ({ ...prev, subjectId: value }))}
                    >
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={examForm.description}
                    onChange={(e) => setExamForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the exam"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={examForm.duration}
                      onChange={(e) => setExamForm(prev => ({ ...prev, duration: Number(e.target.value) }))}
                      min="1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="totalMarks">Total Marks</Label>
                    <Input
                      id="totalMarks"
                      type="number"
                      value={examForm.totalMarks}
                      onChange={(e) => setExamForm(prev => ({ ...prev, totalMarks: Number(e.target.value) }))}
                      min="1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passingMarks">Passing Marks</Label>
                    <Input
                      id="passingMarks"
                      type="number"
                      value={examForm.passingMarks}
                      onChange={(e) => setExamForm(prev => ({ ...prev, passingMarks: Number(e.target.value) }))}
                      min="1"
                      max={examForm.totalMarks}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date & Time</Label>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      value={examForm.startDate}
                      onChange={(e) => setExamForm(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date & Time</Label>
                    <Input
                      id="endDate"
                      type="datetime-local"
                      value={examForm.endDate}
                      onChange={(e) => setExamForm(prev => ({ ...prev, endDate: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instructions">Instructions</Label>
                  <Textarea
                    id="instructions"
                    value={examForm.instructions}
                    onChange={(e) => setExamForm(prev => ({ ...prev, instructions: e.target.value }))}
                    placeholder="Instructions for students taking the exam"
                    rows={3}
                  />
                </div>

                <div className="space-y-4">
                  <Label>Exam Settings</Label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="shuffleQuestions"
                        checked={examForm.shuffleQuestions}
                        onCheckedChange={(checked) => setExamForm(prev => ({ ...prev, shuffleQuestions: checked as boolean }))}
                      />
                      <Label htmlFor="shuffleQuestions">Shuffle questions for each student</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="showResults"
                        checked={examForm.showResults}
                        onCheckedChange={(checked) => setExamForm(prev => ({ ...prev, showResults: checked as boolean }))}
                      />
                      <Label htmlFor="showResults">Show results immediately after submission</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="allowReview"
                        checked={examForm.allowReview}
                        onCheckedChange={(checked) => setExamForm(prev => ({ ...prev, allowReview: checked as boolean }))}
                      />
                      <Label htmlFor="allowReview">Allow students to review answers</Label>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateExam}>
                Create Exam
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Exams Overview */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="active">Active Exams</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Exams</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{exams.length}</div>
                <p className="text-xs text-muted-foreground">
                  Created by you
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Exams</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {exams.filter(exam => {
                    const now = new Date()
                    const start = new Date(exam.startDate)
                    const end = new Date(exam.endDate)
                    return exam.isActive && now >= start && now <= end
                  }).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Currently running
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {exams.reduce((sum, exam) => sum + exam._count.submissions, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Across all exams
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Questions</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {exams.length > 0 
                    ? Math.round(exams.reduce((sum, exam) => sum + exam._count.questions, 0) / exams.length)
                    : 0
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  Questions per exam
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <ExamList 
            exams={exams.filter(exam => {
              const now = new Date()
              const start = new Date(exam.startDate)
              const end = new Date(exam.endDate)
              return exam.isActive && now >= start && now <= end
            })}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          <ExamList 
            exams={exams.filter(exam => {
              const now = new Date()
              const start = new Date(exam.startDate)
              return exam.isActive && now < start
            })}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <ExamList 
            exams={exams.filter(exam => {
              const now = new Date()
              const end = new Date(exam.endDate)
              return now > end
            })}
            loading={loading}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ExamList({ exams, loading }: { exams: Exam[], loading: boolean }) {
  const getExamStatus = (exam: Exam) => {
    const now = new Date()
    const start = new Date(exam.startDate)
    const end = new Date(exam.endDate)

    if (!exam.isActive) return { status: 'Inactive', color: 'bg-gray-100 text-gray-800' }
    if (now < start) return { status: 'Scheduled', color: 'bg-blue-100 text-blue-800' }
    if (now > end) return { status: 'Ended', color: 'bg-red-100 text-red-800' }
    return { status: 'Active', color: 'bg-green-100 text-green-800' }
  }

  if (loading) {
    return <div className="text-center py-8">Loading exams...</div>
  }

  if (exams.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No exams found</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {exams.map((exam) => {
        const status = getExamStatus(exam)
        return (
          <Card key={exam.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{exam.title}</CardTitle>
                  <CardDescription>
                    {exam.subject.name} ({exam.subject.code})
                  </CardDescription>
                </div>
                <Badge className={status.color}>{status.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-gray-500" />
                  {exam.duration} mins
                </div>
                <div className="flex items-center">
                  <Target className="h-4 w-4 mr-2 text-gray-500" />
                  {exam.totalMarks} marks
                </div>
                <div className="flex items-center">
                  <BookOpen className="h-4 w-4 mr-2 text-gray-500" />
                  {exam._count.questions} questions
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2 text-gray-500" />
                  {exam._count.submissions} submissions
                </div>
              </div>

              <div className="space-y-2 text-xs text-gray-600">
                <div>
                  <strong>Start:</strong> {new Date(exam.startDate).toLocaleString()}
                </div>
                <div>
                  <strong>End:</strong> {new Date(exam.endDate).toLocaleString()}
                </div>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>
                <Button variant="outline" size="sm">
                  <Edit className="h-3 w-3" />
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
