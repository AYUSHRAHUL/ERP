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
    const semester = searchParams.get('semester')
    const year = searchParams.get('year')
    const facultyId = searchParams.get('facultyId')
    const studentId = searchParams.get('studentId')

    let whereClause: any = {}

    if (semester) whereClause.semester = parseInt(semester)
    if (year) whereClause.year = parseInt(year)
    if (facultyId) whereClause.facultyId = facultyId

    // If requesting for student, get their enrolled subjects
    if (studentId) {
      const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: {
          enrollments: {
            include: {
              course: {
                include: { subjects: true }
              }
            }
          }
        }
      })

      if (student) {
        const subjectIds = student.enrollments.flatMap(
          enrollment => enrollment.course.subjects.map(subject => subject.id)
        )
        whereClause.subjectId = { in: subjectIds }
      }
    }

    const timetables = await prisma.timetable.findMany({
      where: whereClause,
      include: {
        subject: {
          include: { course: true }
        },
        faculty: true,
        room: true
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' }
      ]
    })

    return NextResponse.json(timetables)
  } catch (error) {
    console.error('Error fetching timetables:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
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
      subjectId,
      facultyId,
      roomId,
      dayOfWeek,
      startTime,
      endTime,
      semester,
      year,
      batch
    } = data

    // Check for conflicts
    const conflicts = await prisma.timetable.findMany({
      where: {
        OR: [
          // Faculty conflict
          {
            facultyId,
            dayOfWeek,
            semester,
            year,
            OR: [
              {
                AND: [
                  { startTime: { lte: startTime } },
                  { endTime: { gt: startTime } }
                ]
              },
              {
                AND: [
                  { startTime: { lt: endTime } },
                  { endTime: { gte: endTime } }
                ]
              }
            ]
          },
          // Room conflict
          ...(roomId ? [{
            roomId,
            dayOfWeek,
            OR: [
              {
                AND: [
                  { startTime: { lte: startTime } },
                  { endTime: { gt: startTime } }
                ]
              },
              {
                AND: [
                  { startTime: { lt: endTime } },
                  { endTime: { gte: endTime } }
                ]
              }
            ]
          }] : [])
        ]
      }
    })

    if (conflicts.length > 0) {
      return NextResponse.json(
        { error: 'Scheduling conflict detected' },
        { status: 400 }
      )
    }

    const timetable = await prisma.timetable.create({
      data: {
        subjectId,
        facultyId,
        roomId,
        dayOfWeek,
        startTime,
        endTime,
        semester,
        year,
        batch
      },
      include: {
        subject: { include: { course: true } },
        faculty: true,
        room: true
      }
    })

    return NextResponse.json(timetable)
  } catch (error) {
    console.error('Error creating timetable:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
