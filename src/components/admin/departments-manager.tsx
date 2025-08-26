'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Building2, Plus, Edit, Trash2, Users, GraduationCap, BookOpen } from 'lucide-react'

interface Department {
  id: string
  name: string
  code: string
  description?: string
  _count?: {
    students: number
    faculty: number
    courses: number
  }
}

export function DepartmentsManager() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: ''
  })

  useEffect(() => {
    fetchDepartments()
  }, [])

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/admin/departments')
      const data = await response.json()
      setDepartments(data)
    } catch (error) {
      console.error('Error fetching departments:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: ''
    })
    setEditingDepartment(null)
  }

  const handleSaveDepartment = async () => {
    try {
      const url = editingDepartment 
        ? `/api/admin/departments/${editingDepartment.id}`
        : '/api/admin/departments'
      
      const method = editingDepartment ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setDialogOpen(false)
        resetForm()
        fetchDepartments()
      }
    } catch (error) {
      console.error('Error saving department:', error)
    }
  }

  const handleEditDepartment = (department: Department) => {
    setEditingDepartment(department)
    setFormData({
      name: department.name,
      code: department.code,
      description: department.description || ''
    })
    setDialogOpen(true)
  }

  const handleDeleteDepartment = async (departmentId: string) => {
    if (!confirm('Are you sure you want to delete this department? This action cannot be undone.')) return

    try {
      const response = await fetch(`/api/admin/departments/${departmentId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchDepartments()
      }
    } catch (error) {
      console.error('Error deleting department:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Departments Management</h2>
          <p className="text-muted-foreground">
            Manage academic departments and their structure
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Department
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingDepartment ? 'Edit Department' : 'Add New Department'}
              </DialogTitle>
              <DialogDescription>
                {editingDepartment 
                  ? 'Update department information below.'
                  : 'Fill in the details to add a new department.'
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Department Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Computer Science & Engineering"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">Department Code</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  placeholder="e.g., CSE"
                  maxLength={10}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the department..."
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveDepartment}>
                {editingDepartment ? 'Update' : 'Create'} Department
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-8">Loading departments...</div>
        ) : departments.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            No departments found
          </div>
        ) : (
          departments.map((department) => (
            <Card key={department.id} className="h-full">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center">
                      <Building2 className="mr-2 h-5 w-5" />
                      {department.name}
                    </CardTitle>
                    <CardDescription className="font-mono">
                      {department.code}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => handleEditDepartment(department)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteDepartment(department.id)}>
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {department.description && (
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {department.description}
                  </p>
                )}

                {/* Department Statistics */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="text-lg font-bold text-blue-600">
                      {department._count?.students || 0}
                    </div>
                    <div className="text-xs text-gray-600">Students</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <GraduationCap className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="text-lg font-bold text-green-600">
                      {department._count?.faculty || 0}
                    </div>
                    <div className="text-xs text-gray-600">Faculty</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <BookOpen className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="text-lg font-bold text-purple-600">
                      {department._count?.courses || 0}
                    </div>
                    <div className="text-xs text-gray-600">Courses</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
