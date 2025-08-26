import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const { name, code, credits, courseId } = data

    // Check if subject code already exists
    const existingSubject = await prisma.subject.findUnique({
      where: { code }
    })

    if (existingSubject) {
      return NextResponse.json(
        { error: 'Subject code already exists' },
        { status: 400 }
      )
    }

    const subject = await prisma.subject.create({
      data: {
        name,
        code,
        credits,
        courseId
      }
    })

    return NextResponse.json(subject)
  } catch (error) {
    console.error('Error creating subject:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
