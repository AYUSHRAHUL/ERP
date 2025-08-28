import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'FACULTY') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const difficulty = searchParams.get('difficulty')
    const search = searchParams.get('search')

    let whereClause: any = {
      createdBy: session.user.id
    }

    if (type) whereClause.type = type
    if (difficulty) whereClause.difficulty = difficulty
    if (search) {
      whereClause.question = {
        contains: search,
        mode: 'insensitive'
      }
    }

    const questions = await prisma.question.findMany({
      where: whereClause,
      include: {
        options: true,
        _count: {
          select: { examQuestions: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(questions)
  } catch (error) {
    console.error('Error fetching questions:', error)
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
    const {
      question,
      type,
      marks,
      explanation,
      difficulty,
      options
    } = data

    const createdQuestion = await prisma.question.create({
      data: {
        question,
        type,
        marks,
        explanation,
        difficulty,
        createdBy: session.user.id,
        options: {
          create: options?.map((opt: any) => ({
            option: opt.option,
            isCorrect: opt.isCorrect
          })) || []
        }
      },
      include: {
        options: true
      }
    })

    return NextResponse.json(createdQuestion)
  } catch (error) {
    console.error('Error creating question:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
