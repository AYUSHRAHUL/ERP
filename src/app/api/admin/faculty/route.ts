import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const departmentId = searchParams.get('departmentId')

    let whereClause: any = {}

    if (departmentId) {
      whereClause.departmentId = departmentId
    }

    const faculty = await prisma.faculty.findMany({
      where: whereClause,
      include: {
        department: true,
        user: {
          select: {
            email: true,
            isActive: true
          }
        },
        allocations: {
          include: {
            subject: true
          }
        }
      },
      orderBy: [
        { employeeId: 'desc' }
      ]
    })

    return NextResponse.json(faculty)
  } catch (error) {
    console.error('Error fetching faculty:', error)
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
    const { 
      firstName, 
      lastName, 
      email, 
      phone, 
      employeeId, 
      qualification, 
      experience, 
      departmentId 
    } = data

    // Check if email or employee ID already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      )
    }

    const existingFaculty = await prisma.faculty.findUnique({
      where: { employeeId }
    })

    if (existingFaculty) {
      return NextResponse.json(
        { error: 'Employee ID already exists' },
        { status: 400 }
      )
    }

    // Create user and faculty
    const hashedPassword = await bcrypt.hash('faculty123', 12) // Default password

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'FACULTY',
        faculty: {
          create: {
            employeeId,
            firstName,
            lastName,
            phone,
            qualification,
            experience,
            departmentId
          }
        }
      },
      include: {
        faculty: {
          include: {
            department: true
          }
        }
      }
    })

    return NextResponse.json(user.faculty)
  } catch (error) {
    console.error('Error creating faculty:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
