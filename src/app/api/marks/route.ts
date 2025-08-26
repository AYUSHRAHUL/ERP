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
    const semester = searchParams.get('semester')
    const year = searchParams.get('year')

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

    if (subjectId) whereClause.subjectId = subjectId
    if (semester) whereClause.semester = parseInt(semester)
    if (year) whereClause.year = parseInt(year)

    const marks = await prisma.mark.findMany({
      where: whereClause,
      include: {
        student: true,
        subject: true,
        faculty: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(marks)
  } catch (error) {
    console.error('Error fetching marks:', error)
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
    const { studentId, subjectId, examType, maxMarks, obtainedMarks, semester, year } = data

    const mark = await prisma.mark.create({
      data: {
        studentId,
        subjectId,
        facultyId: faculty.id,
        examType,
        maxMarks,
        obtainedMarks,
        semester,
        year
      },
      include: {
        student: true,
        subject: true
      }
    })

    return NextResponse.json(mark)
  } catch (error) {
    console.error('Error creating mark:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
