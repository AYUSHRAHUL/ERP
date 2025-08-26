'use client'

import { ReactNode } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  BookOpen,
  Calendar,
  CreditCard,
  Settings,
  LogOut,
  Menu
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

interface DashboardLayoutProps {
  children: ReactNode
  role: 'ADMIN' | 'FACULTY' | 'STUDENT' | 'STAFF'
}

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const { data: session } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigation = getNavigationByRole(role)

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform 
        lg:translate-x-0 lg:static lg:inset-0 transition duration-200 ease-in-out`}>
        
        <div className="flex items-center justify-center h-16 bg-blue-600">
          <h1 className="text-white text-xl font-bold">College ERP</h1>
        </div>
        
        <nav className="mt-8">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-blue-600"
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          ))}
        </nav>
        
        <div className="absolute bottom-4 left-4 right-4">
          <Button 
            onClick={() => signOut()} 
            variant="outline" 
            className="w-full"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="h-6 w-6" />
              </Button>
              <h2 className="ml-4 text-xl font-semibold text-gray-800">
                {getRoleTitle(role)} Dashboard
              </h2>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {session?.user?.name}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

function getNavigationByRole(role: string) {
  const baseNavigation = [
    { name: 'Dashboard', href: `/${role.toLowerCase()}`, icon: LayoutDashboard },
  ]

  switch (role) {
    case 'ADMIN':
      return [
        ...baseNavigation,
        { name: 'Students', href: '/admin/students', icon: Users },
        { name: 'Faculty', href: '/admin/faculty', icon: GraduationCap },
        { name: 'Courses', href: '/admin/courses', icon: BookOpen },
        { name: 'Departments', href: '/admin/departments', icon: Settings },
        { name: 'Timetable', href: '/admin/timetable', icon: Calendar },
        { name: 'Fees', href: '/admin/fees', icon: CreditCard },
      ]
    case 'FACULTY':
      return [
        ...baseNavigation,
        { name: 'My Courses', href: '/faculty/courses', icon: BookOpen },
        { name: 'Attendance', href: '/faculty/attendance', icon: Users },
        { name: 'Marks', href: '/faculty/marks', icon: GraduationCap },
        { name: 'Schedule', href: '/faculty/schedule', icon: Calendar },
      ]
    case 'STUDENT':
      return [
        ...baseNavigation,
        { name: 'My Courses', href: '/student/courses', icon: BookOpen },
        { name: 'Attendance', href: '/student/attendance', icon: Calendar },
        { name: 'Marks', href: '/student/marks', icon: GraduationCap },
        { name: 'Fees', href: '/student/fees', icon: CreditCard },
      ]
    case 'STAFF':
      return [
        ...baseNavigation,
        { name: 'Management', href: '/staff/management', icon: Settings },
      ]
    default:
      return baseNavigation
  }
}

function getRoleTitle(role: string) {
  switch (role) {
    case 'ADMIN': return 'Admin'
    case 'FACULTY': return 'Faculty'
    case 'STUDENT': return 'Student'
    case 'STAFF': return 'Staff'
    default: return 'User'
  }
}
