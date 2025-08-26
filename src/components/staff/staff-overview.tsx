import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { prisma } from '@/lib/db'

interface StaffOverviewProps {
  userId: string
}

export async function StaffOverview({ userId }: StaffOverviewProps) {
  const staff = await prisma.staff.findUnique({
    where: { userId }
  })

  if (!staff) {
    return <div>Staff not found</div>
  }

  // Mock data based on department type
  const getDepartmentInfo = (department: string) => {
    switch (department) {
      case 'LIBRARY':
        return {
          title: 'Library Management',
          description: 'Manage books, borrowing, and library resources',
          stats: [
            { label: 'Total Books', value: '15,420' },
            { label: 'Books Issued', value: '2,340' },
            { label: 'Pending Returns', value: '340' },
            { label: 'New Acquisitions', value: '45' }
          ]
        }
      case 'HOSTEL':
        return {
          title: 'Hostel Management',
          description: 'Manage room allocations and hostel facilities',
          stats: [
            { label: 'Total Rooms', value: '450' },
            { label: 'Occupied Rooms', value: '398' },
            { label: 'Available Rooms', value: '52' },
            { label: 'Maintenance Requests', value: '12' }
          ]
        }
      case 'TRANSPORT':
        return {
          title: 'Transport Management',
          description: 'Manage bus routes and transportation services',
          stats: [
            { label: 'Active Routes', value: '25' },
            { label: 'Total Buses', value: '18' },
            { label: 'Students Using Transport', value: '1,240' },
            { label: 'Maintenance Due', value: '3' }
          ]
        }
      case 'ACCOUNTS':
        return {
          title: 'Accounts Management',
          description: 'Manage financial records and transactions',
          stats: [
            { label: 'Fee Collections', value: '₹24.5L' },
            { label: 'Pending Payments', value: '₹3.2L' },
            { label: 'Salary Disbursals', value: '₹18.7L' },
            { label: 'Outstanding Bills', value: '₹1.8L' }
          ]
        }
      default:
        return {
          title: 'Staff Dashboard',
          description: 'Manage your department operations',
          stats: []
        }
    }
  }

  const departmentInfo = getDepartmentInfo(staff.department)

  return (
    <div className="space-y-6">
      {/* Staff Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Staff Profile
            <Badge variant="outline">{staff.department}</Badge>
          </CardTitle>
          <CardDescription>Your staff information and department details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Name</p>
              <p className="text-lg">{staff.firstName} {staff.lastName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Employee ID</p>
              <p className="text-lg font-mono">{staff.employeeId}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Department</p>
              <p className="text-lg">{staff.department}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Phone</p>
              <p className="text-lg">{staff.phone || 'Not provided'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Department Overview */}
      <Card>
        <CardHeader>
          <CardTitle>{departmentInfo.title}</CardTitle>
          <CardDescription>{departmentInfo.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {departmentInfo.stats.map((stat, index) => (
              <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
