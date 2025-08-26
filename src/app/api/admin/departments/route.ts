import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const departments = await prisma.department.findMany({
      include: {
        _count: {
          select: {
            students: true,
            faculty: true,
            courses: true
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(departments)
  } catch (error) {
    console.error('Error fetching departments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const { name, code, description } = data

    // Check if department code already exists
    const existingDepartment = await prisma.department.findUnique({
      where: { code }
    })

    if (existingDepartment) {
      return NextResponse.json(
        { error: 'Department code already exists' },
        { status: 400 }
      )
    }

    const department = await prisma.department.create({
      data: {
        name,
        code,
        description
      }
    })

    return NextResponse.json(department)
  } catch (error) {
    console.error('Error creating department:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
