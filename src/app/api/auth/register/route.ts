import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    console.log('Received registration data:', data) // Debug log
    
    const { 
      email, 
      password, 
      role, 
      firstName, 
      lastName, 
      phone,
      employeeId,
      rollNumber,
      departmentId 
    } = data

    // Validate required fields
    if (!email || !password || !role || !firstName || !lastName) {
      console.log('Missing fields:', { 
        email: !!email, 
        password: !!password, 
        role: !!role, 
        firstName: !!firstName, 
        lastName: !!lastName 
      })
      return NextResponse.json(
        { error: 'Missing required fields: email, password, role, firstName, lastName are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Check for unique constraints based on role
    if (role === 'STUDENT' && rollNumber) {
      const existingStudent = await prisma.student.findUnique({
        where: { rollNumber }
      })
      if (existingStudent) {
        return NextResponse.json(
          { error: 'Student with this roll number already exists' },
          { status: 400 }
        )
      }
    }

    if ((role === 'FACULTY' || role === 'STAFF') && employeeId) {
      const existingFaculty = await prisma.faculty.findUnique({
        where: { employeeId }
      })
      const existingStaff = await prisma.staff.findUnique({
        where: { employeeId }
      })
      if (existingFaculty || existingStaff) {
        return NextResponse.json(
          { error: 'Employee with this ID already exists' },
          { status: 400 }
        )
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Get first department for demo purposes (or create a default one)
    let department = await prisma.department.findFirst()
    
    if (!department) {
      // Create a default department if none exists
      department = await prisma.department.create({
        data: {
          name: 'General',
          code: 'GEN',
          description: 'General Department'
        }
      })
    }

    // Create user with role-specific data
    let userData: any = {
      email,
      password: hashedPassword,
      role,
    }

    switch (role) {
      case 'ADMIN':
        userData.admin = {
          create: {
            firstName,
            lastName,
            phone: phone || null,
          }
        }
        break
      
      case 'FACULTY':
        userData.faculty = {
          create: {
            employeeId: employeeId || `FAC${Date.now()}`,
            firstName,
            lastName,
            phone: phone || null,
            departmentId: department.id,
            qualification: null,
            experience: 0,
          }
        }
        break
      
      case 'STUDENT':
        userData.student = {
          create: {
            rollNumber: rollNumber || `STU${Date.now()}`,
            firstName,
            lastName,
            phone: phone || null,
            departmentId: department.id,
            semester: 1,
            admissionYear: new Date().getFullYear(),
            dateOfBirth: null,
            address: null,
            guardianName: null,
            guardianPhone: null,
          }
        }
        break
      
      case 'STAFF':
        userData.staff = {
          create: {
            employeeId: employeeId || `STF${Date.now()}`,
            firstName,
            lastName,
            phone: phone || null,
            department: 'LIBRARY', // Default staff department
          }
        }
        break

      default:
        return NextResponse.json(
          { error: 'Invalid role specified' },
          { status: 400 }
        )
    }

    const user = await prisma.user.create({
      data: userData,
      include: {
        admin: true,
        faculty: {
          include: {
            department: true
          }
        },
        student: {
          include: {
            department: true
          }
        },
        staff: true,
      }
    })

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      message: 'User created successfully',
      user: userWithoutPassword
    })

  } catch (error) {
    console.error('Registration error:', error)
    
    // Handle Prisma unique constraint violations
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'A user with this information already exists' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error. Please try again.' },
      { status: 500 }
    )
  }
}
