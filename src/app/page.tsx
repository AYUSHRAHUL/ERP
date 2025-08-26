'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  Award, 
  BarChart3, 
  Calendar,
  ArrowRight 
} from 'lucide-react'

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session?.user?.role) {
      const role = session.user.role.toLowerCase()
      router.push(`/${role}`)
    }
  }, [session, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (session) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <GraduationCap className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                College ERP System
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="outline">Sign In</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-8">
            Complete
            <span className="text-blue-600"> College ERP </span>
            Solution
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Streamline your educational institution with our comprehensive Enterprise Resource Planning system. 
            Manage students, faculty, courses, and operations all in one place.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="w-full sm:w-auto">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.features.map((item, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-3"></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* CTA Section */}
        <div className="mt-24 bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Transform Your Institution?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Join hundreds of educational institutions already using our ERP system 
            to streamline their operations and improve student experience.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-blue-600">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>

          <Link href="/login">
            <Button size="lg">
              Access Your Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center text-gray-600">
            <div className="flex items-center justify-center mb-4">
              <GraduationCap className="h-6 w-6 text-blue-600" />
              <span className="ml-2 text-lg font-semibold text-gray-900">
                College ERP System
              </span>
            </div>
            <p>&copy; 2025 College ERP System. All rights reserved.</p>
            <p className="mt-2 text-sm">
              Empowering educational institutions with modern technology
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

const features = [
  {
    title: 'Student Management',
    description: 'Comprehensive student lifecycle management from admission to graduation.',
    icon: Users,
    features: [
      'Student registration & profiles',
      'Attendance tracking',
      'Grade & GPA calculation',
      'Fee management & payments'
    ]
  },
  {
    title: 'Faculty Portal',
    description: 'Empower your teaching staff with modern tools and insights.',
    icon: GraduationCap,
    features: [
      'Course & subject allocation',
      'Attendance management',
      'Marks & assessment entry',
      'Student progress tracking'
    ]
  },
  {
    title: 'Academic Management',
    description: 'Streamline curriculum planning and academic operations.',
    icon: BookOpen,
    features: [
      'Course & curriculum design',
      'Timetable generation',
      'Examination management',
      'Result publication'
    ]
  },
  {
    title: 'Administrative Control',
    description: 'Complete oversight and control for institutional administrators.',
    icon: Award,
    features: [
      'Department management',
      'Staff allocation',
      'Resource planning',
      'Policy implementation'
    ]
  },
  {
    title: 'Analytics & Reports',
    description: 'Data-driven insights for better decision making.',
    icon: BarChart3,
    features: [
      'Performance analytics',
      'Attendance reports',
      'Financial insights',
      'Custom dashboards'
    ]
  },
  {
    title: 'Integrated Services',
    description: 'All essential services unified in one platform.',
    icon: Calendar,
    features: [
      'Library management',
      'Hostel administration',
      'Transport services',
      'Event management'
    ]
  }
]

const stats = [
  { value: '500+', label: 'Institutions' },
  { value: '100K+', label: 'Students' },
  { value: '10K+', label: 'Faculty' },
  { value: '99.9%', label: 'Uptime' }
]
