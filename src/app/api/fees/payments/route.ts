import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let whereClause: any = {}

    if (session.user.role === 'STUDENT') {
      const student = await prisma.student.findUnique({
        where: { userId: session.user.id }
      })
      if (student) {
        whereClause.studentId = student.id
      }
    }

    const payments = await prisma.feePayment.findMany({
      where: whereClause,
      include: {
        student: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(payments)
  } catch (error) {
    console.error('Error fetching fee payments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const student = await prisma.student.findUnique({
      where: { userId: session.user.id }
    })

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    const data = await request.json()
    const { amount, paymentMethod, semester, year } = data

    // Create payment record
    const payment = await prisma.feePayment.create({
      data: {
        studentId: student.id,
        amount,
        paymentMethod,
        semester,
        year,
        status: 'COMPLETED', // In real app, this would be PENDING initially
        transactionId: `TXN${Date.now()}` // Generate proper transaction ID
      }
    })

    return NextResponse.json(payment)
  } catch (error) {
    console.error('Error processing payment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
