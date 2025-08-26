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
    const departmentId = searchParams.get('departmentId')
    const semester = searchParams.get('semester')
    const year = searchParams.get('year')

    let whereClause: any = {}

    if (departmentId) whereClause.departmentId = departmentId
    if (semester) whereClause.semester = parseInt(semester)
    if (year) whereClause.year = parseInt(year)

    const feeStructures = await prisma.feeStructure.findMany({
      where: whereClause,
      orderBy: [
        { year: 'desc' },
        { semester: 'asc' }
      ]
    })

    return NextResponse.json(feeStructures)
  } catch (error) {
    console.error('Error fetching fee structures:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const { departmentId, semester, tuitionFee, libraryFee, labFee, otherFee, year } = data

    const totalFee = tuitionFee + libraryFee + labFee + otherFee

    const feeStructure = await prisma.feeStructure.create({
      data: {
        departmentId,
        semester,
        tuitionFee,
        libraryFee,
        labFee,
        otherFee,
        totalFee,
        year
      }
    })

    return NextResponse.json(feeStructure)
  } catch (error) {
    console.error('Error creating fee structure:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
