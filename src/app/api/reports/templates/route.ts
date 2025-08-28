import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !['ADMIN', 'FACULTY'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const type = searchParams.get('type')

    let whereClause: any = { isActive: true }
    
    if (category) whereClause.category = category
    if (type) whereClause.type = type

    // Faculty can only see certain templates
    if (session.user.role === 'FACULTY') {
      whereClause.OR = [
        { type: { in: ['ATTENDANCE_REPORT', 'GRADE_REPORT', 'STUDENT_LIST'] } },
        { createdBy: session.user.id }
      ]
    }

    const templates = await prisma.reportTemplate.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
        category: true,
        isSystem: true,
        createdAt: true,
        _count: {
          select: { reports: true }
        }
      },
      orderBy: [
        { isSystem: 'desc' },
        { name: 'asc' }
      ]
    })

    return NextResponse.json(templates)
  } catch (error) {
    console.error('Error fetching report templates:', error)
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
      name,
      description,
      type,
      category,
      template,
      parameters
    } = data

    const reportTemplate = await prisma.reportTemplate.create({
      data: {
        name,
        description,
        type,
        category,
        template,
        parameters: JSON.stringify(parameters),
        createdBy: session.user.id
      }
    })

    return NextResponse.json(reportTemplate)
  } catch (error) {
    console.error('Error creating report template:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
