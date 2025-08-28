import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const modules = await prisma.lMSModule.findMany({
      where: { 
        lmsCourseId: params.id,
        isPublished: true
      },
      include: {
        lessons: {
          where: { isPublished: true },
          orderBy: { order: 'asc' }
        },
        assignments: {
          where: { isPublished: true },
          orderBy: { dueDate: 'asc' }
        },
        _count: {
          select: {
            lessons: true,
            assignments: true
          }
        }
      },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json(modules)
  } catch (error) {
    console.error('Error fetching modules:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'FACULTY') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const { title, description, order } = data

    const module = await prisma.lMSModule.create({
      data: {
        lmsCourseId: params.id,
        title,
        description,
        order
      }
    })

    return NextResponse.json(module)
  } catch (error) {
    console.error('Error creating module:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
