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
    const role = session.user.role
    const subjectId = searchParams.get('subjectId')

    let whereClause: any = {}

    if (role === 'FACULTY') {
      const faculty = await prisma.faculty.findUnique({
        where: { userId: session.user.id }
      })
      if (!faculty) {
        return NextResponse.json({ error: 'Faculty not found' }, { status: 404 })
      }
      whereClause.facultyId = faculty.id
    } else if (role === 'STUDENT') {
      whereClause.isActive = true
      whereClause.startDate = { lte: new Date() }
      whereClause.endDate = { gte: new Date() }
    }

    if (subjectId) {
      whereClause.subjectId = subjectId
    }

    const exams = await prisma.exam.findMany({
      where: whereClause,
      include: {
        subject: {
          include: { course: true }
        },
        faculty: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        _count: {
          select: {
            questions: true,
            submissions: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(exams)
  } catch (error) {
    console.error('Error fetching exams:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
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
    const {
      title,
      description,
      subjectId,
      duration,
      totalMarks,
      passingMarks,
      startDate,
      endDate,
      instructions,
      shuffleQuestions,
      showResults,
      allowReview
    } = data

    const exam = await prisma.exam.create({
      data: {
        title,
        description,
        subjectId,
        facultyId: faculty.id,
        duration,
        totalMarks,
        passingMarks,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        instructions,
        shuffleQuestions,
        showResults,
        allowReview
      },
      include: {
        subject: true,
        faculty: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    })

    return NextResponse.json(exam)
  } catch (error) {
    console.error('Error creating exam:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
