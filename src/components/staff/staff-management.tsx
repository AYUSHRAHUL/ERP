import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { prisma } from '@/lib/db'
import { Book, Home, Bus, Calculator, Plus, Search, Eye } from 'lucide-react'

interface StaffManagementProps {
  userId: string
}

export async function StaffManagement({ userId }: StaffManagementProps) {
  const staff = await prisma.staff.findUnique({
    where: { userId }
  })

  if (!staff) {
    return <div>Staff not found</div>
  }

  const renderDepartmentManagement = () => {
    switch (staff.department) {
      case 'LIBRARY':
        return <LibraryManagement />
      case 'HOSTEL':
        return <HostelManagement />
      case 'TRANSPORT':
        return <TransportManagement />
      case 'ACCOUNTS':
        return <AccountsManagement />
      default:
        return <DefaultManagement />
    }
  }

  return (
    <div className="space-y-6">
      {renderDepartmentManagement()}
    </div>
  )
}

function LibraryManagement() {
  const mockBooks = [
    { id: 1, title: 'Introduction to Algorithms', author: 'Thomas Cormen', isbn: '978-0262033848', available: 3, total: 5 },
    { id: 2, title: 'Clean Code', author: 'Robert Martin', isbn: '978-0132350884', available: 2, total: 3 },
    { id: 3, title: 'Design Patterns', author: 'Gang of Four', isbn: '978-0201633610', available: 1, total: 2 }
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Book className="mr-2 h-5 w-5" />
            Library Management
          </CardTitle>
          <CardDescription>Manage books, borrowing, and library resources</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Book Catalog</h3>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Book
            </Button>
          </div>
          
          <div className="space-y-3">
            {mockBooks.map((book) => (
              <div key={book.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{book.title}</h4>
                  <p className="text-sm text-gray-600">by {book.author}</p>
                  <p className="text-xs text-gray-500">ISBN: {book.isbn}</p>
                </div>
                <div className="text-right">
                  <Badge variant={book.available > 0 ? 'default' : 'secondary'}>
                    {book.available}/{book.total} Available
                  </Badge>
                  <div className="flex space-x-1 mt-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function HostelManagement() {
  const mockRooms = [
    { id: 1, number: 'H1-101', capacity: 2, occupied: 2, status: 'occupied' },
    { id: 2, number: 'H1-102', capacity: 2, occupied: 1, status: 'partial' },
    { id: 3, number: 'H1-103', capacity: 2, occupied: 0, status: 'available' }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Home className="mr-2 h-5 w-5" />
          Hostel Management
        </CardTitle>
        <CardDescription>Manage room allocations and hostel facilities</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Room Allocation</h3>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Allocate Room
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockRooms.map((room) => (
            <Card key={room.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">{room.number}</h4>
                  <Badge variant={
                    room.status === 'available' ? 'default' : 
                    room.status === 'partial' ? 'secondary' : 'outline'
                  }>
                    {room.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">
                  {room.occupied}/{room.capacity} occupied
                </p>
                <Button variant="outline" size="sm" className="w-full mt-2">
                  Manage
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function TransportManagement() {
  const mockRoutes = [
    { id: 1, name: 'Route A', bus: 'KL-01-1234', students: 45, capacity: 50 },
    { id: 2, name: 'Route B', bus: 'KL-01-5678', students: 38, capacity: 45 },
    { id: 3, name: 'Route C', bus: 'KL-01-9012', students: 42, capacity: 50 }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bus className="mr-2 h-5 w-5" />
          Transport Management
        </CardTitle>
        <CardDescription>Manage bus routes and transportation services</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Bus Routes</h3>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Route
          </Button>
        </div>
        
        <div className="space-y-3">
          {mockRoutes.map((route) => (
            <div key={route.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">{route.name}</h4>
                <p className="text-sm text-gray-600">Bus: {route.bus}</p>
                <p className="text-xs text-gray-500">
                  {route.students}/{route.capacity} students
                </p>
              </div>
              <div className="text-right">
                <Badge variant="outline">
                  {Math.round((route.students / route.capacity) * 100)}% Full
                </Badge>
                <div className="flex space-x-1 mt-2">
                  <Button variant="outline" size="sm">View</Button>
                  <Button variant="outline" size="sm">Edit</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function AccountsManagement() {
  const mockTransactions = [
    { id: 1, type: 'Fee Collection', amount: 50000, student: 'John Doe', date: '2024-01-15' },
    { id: 2, type: 'Salary Disbursal', amount: 45000, employee: 'Dr. Smith', date: '2024-01-14' },
    { id: 3, type: 'Utility Payment', amount: 12000, description: 'Electricity Bill', date: '2024-01-13' }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calculator className="mr-2 h-5 w-5" />
          Accounts Management
        </CardTitle>
        <CardDescription>Manage financial records and transactions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Recent Transactions</h3>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Transaction
          </Button>
        </div>
        
        <div className="space-y-3">
          {mockTransactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">{transaction.type}</h4>
                <p className="text-sm text-gray-600">
                  {transaction.student || transaction.employee || transaction.description}
                </p>
                <p className="text-xs text-gray-500">{transaction.date}</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-medium">₹{transaction.amount.toLocaleString()}</div>
                <Button variant="outline" size="sm">View Details</Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function DefaultManagement() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Department Management</CardTitle>
        <CardDescription>Manage your department operations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-gray-500">
          Department-specific management tools will be available here.
        </div>
      </CardContent>
    </Card>
  )
}
