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
    const enrolled = searchParams.get('enrolled') === 'true'
    const role = session.user.role

    let whereClause: any = { isPublished: true }
    let include: any = {
      course: {
        include: { department: true }
      },
      _count: {
        select: {
          modules: true,
          enrollments: true
        }
      }
    }

    // Role-based filtering
    if (role === 'STUDENT') {
      if (enrolled) {
        const student = await prisma.student.findUnique({
          where: { userId: session.user.id }
        })
        if (student) {
          include.enrollments = {
            where: { studentId: student.id },
            select: { progress: true, enrolledAt: true }
          }
        }
      }
    } else if (role === 'FACULTY') {
      const faculty = await prisma.faculty.findUnique({
        where: { userId: session.user.id }
      })
      if (faculty) {
        whereClause.createdBy = session.user.id
      }
    }

    const lmsCourses = await prisma.lMSCourse.findMany({
      where: whereClause,
      include,
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(lmsCourses)
  } catch (error) {
    console.error('Error fetching LMS courses:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'FACULTY') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const { courseId, title, description, coverImage } = data

    const lmsCourse = await prisma.lMSCourse.create({
      data: {
        courseId,
        title,
        description,
        coverImage,
        createdBy: session.user.id
      },
      include: {
        course: {
          include: { department: true }
        }
      }
    })

    return NextResponse.json(lmsCourse)
  } catch (error) {
    console.error('Error creating LMS course:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
