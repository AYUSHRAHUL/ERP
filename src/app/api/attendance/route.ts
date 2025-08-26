import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const subjectId = searchParams.get('subjectId')
    const studentId = searchParams.get('studentId')

    let whereClause: any = {}

    if (session.user.role === 'STUDENT') {
      const student = await prisma.student.findUnique({
        where: { userId: session.user.id }
      })
      whereClause.studentId = student?.id
    } else if (session.user.role === 'FACULTY') {
      const faculty = await prisma.faculty.findUnique({
        where: { userId: session.user.id }
      })
      whereClause.facultyId = faculty?.id
    }

    if (subjectId) {
      whereClause.subjectId = subjectId
    }

    if (studentId && (session.user.role === 'ADMIN' || session.user.role === 'FACULTY')) {
      whereClause.studentId = studentId
    }

    const attendance = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        student: true,
        subject: true,
        faculty: true
      },
      orderBy: { date: 'desc' }
    })

    return NextResponse.json(attendance)
  } catch (error) {
    console.error('Error fetching attendance:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'FACULTY') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const faculty = await prisma.faculty.findUnique({
      where: { userId: session.user.id }
    })

    if (!faculty) {
      return NextResponse.json({ error: 'Faculty not found' }, { status: 404 })
    }

    const data = await request.json()
    const { attendanceRecords } = data

    // Bulk create attendance records
    const attendance = await prisma.attendance.createMany({
      data: attendanceRecords.map((record: any) => ({
        studentId: record.studentId,
        subjectId: record.subjectId,
        facultyId: faculty.id,
        date: new Date(record.date),
        status: record.status
      }))
    })

    return NextResponse.json(attendance)
  } catch (error) {
    console.error('Error creating attendance:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
