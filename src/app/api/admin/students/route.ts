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

    const { searchParams } = new URL(request.url)
    const departmentId = searchParams.get('departmentId')
    const search = searchParams.get('search')

    let whereClause: any = {}

    if (departmentId) {
      whereClause.departmentId = departmentId
    }

    if (search) {
      whereClause.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { rollNumber: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } }
      ]
    }

    const students = await prisma.student.findMany({
      where: whereClause,
      include: {
        department: true,
        user: {
          select: {
            email: true,
            isActive: true
          }
        }
      },
      orderBy: [
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json(students)
  } catch (error) {
    console.error('Error fetching students:', error)
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
      rollNumber, 
      departmentId, 
      semester, 
      admissionYear 
    } = data

    // Check if email or roll number already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      )
    }

    const existingStudent = await prisma.student.findUnique({
      where: { rollNumber }
    })

    if (existingStudent) {
      return NextResponse.json(
        { error: 'Roll number already exists' },
        { status: 400 }
      )
    }

    // Create user and student
    const hashedPassword = await bcrypt.hash('student123', 12) // Default password

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'STUDENT',
        student: {
          create: {
            rollNumber,
            firstName,
            lastName,
            phone,
            departmentId,
            semester,
            admissionYear
          }
        }
      },
      include: {
        student: {
          include: {
            department: true
          }
        }
      }
    })

    return NextResponse.json(user.student)
  } catch (error) {
    console.error('Error creating student:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
