import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'overview'

    switch (type) {
      case 'overview':
        return await getOverviewAnalytics()
      case 'attendance':
        return await getAttendanceAnalytics()
      case 'performance':
        return await getPerformanceAnalytics()
      case 'finance':
        return await getFinanceAnalytics()
      default:
        return NextResponse.json({ error: 'Invalid analytics type' }, { status: 400 })
    }
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function getOverviewAnalytics() {
  const [
    totalStudents,
    totalFaculty,
    totalCourses,
    totalDepartments,
    recentEnrollments,
    attendanceStats,
    feeCollection
  ] = await Promise.all([
    prisma.student.count(),
    prisma.faculty.count(),
    prisma.course.count(),
    prisma.department.count(),
    prisma.enrollment.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      }
    }),
    getAttendanceOverview(),
    getFeeOverview()
  ])

  return NextResponse.json({
    overview: {
      totalStudents,
      totalFaculty,
      totalCourses,
      totalDepartments,
      recentEnrollments
    },
    attendance: attendanceStats,
    finance: feeCollection
  })
}

async function getAttendanceOverview() {
  const totalAttendanceRecords = await prisma.attendance.count()
  const presentRecords = await prisma.attendance.count({
    where: { status: 'PRESENT' }
  })
  
  const attendancePercentage = totalAttendanceRecords > 0 
    ? Math.round((presentRecords / totalAttendanceRecords) * 100)
    : 0

  return {
    totalRecords: totalAttendanceRecords,
    presentRecords,
    averageAttendance: attendancePercentage
  }
}

async function getFeeOverview() {
  const totalCollected = await prisma.feePayment.aggregate({
    _sum: { amount: true },
    where: { status: 'COMPLETED' }
  })

  const pendingPayments = await prisma.feePayment.count({
    where: { status: 'PENDING' }
  })

  return {
    totalCollected: totalCollected._sum.amount || 0,
    pendingPayments
  }
}

async function getAttendanceAnalytics() {
  // Department-wise attendance
  const departmentAttendance = await prisma.$queryRaw`
    SELECT 
      d.name as department,
      COUNT(a.id) as totalRecords,
      SUM(CASE WHEN a.status = 'PRESENT' THEN 1 ELSE 0 END) as presentRecords
    FROM departments d
    JOIN students s ON d.id = s.departmentId
    JOIN attendance a ON s.id = a.studentId
    GROUP BY d.id, d.name
  `

  // Monthly attendance trend
  const monthlyTrend = await prisma.$queryRaw`
    SELECT 
      DATE_FORMAT(date, '%Y-%m') as month,
      COUNT(*) as totalClasses,
      SUM(CASE WHEN status = 'PRESENT' THEN 1 ELSE 0 END) as attendedClasses
    FROM attendance
    WHERE date >= DATE_SUB(CURRENT_DATE, INTERVAL 6 MONTH)
    GROUP BY DATE_FORMAT(date, '%Y-%m')
    ORDER BY month
  `

  return NextResponse.json({
    departmentAttendance,
    monthlyTrend
  })
}

async function getPerformanceAnalytics() {
  // Grade distribution
  const gradeDistribution = await prisma.$queryRaw`
    SELECT 
      CASE 
        WHEN (obtainedMarks / maxMarks * 100) >= 90 THEN 'A+'
        WHEN (obtainedMarks / maxMarks * 100) >= 80 THEN 'A'
        WHEN (obtainedMarks / maxMarks * 100) >= 70 THEN 'B'
        WHEN (obtainedMarks / maxMarks * 100) >= 60 THEN 'C'
        WHEN (obtainedMarks / maxMarks * 100) >= 50 THEN 'D'
        ELSE 'F'
      END as grade,
      COUNT(*) as count
    FROM marks
    GROUP BY grade
    ORDER BY grade
  `

  // Subject-wise performance
  const subjectPerformance = await prisma.$queryRaw`
    SELECT 
      s.name as subject,
      AVG(m.obtainedMarks / m.maxMarks * 100) as averageScore,
      COUNT(m.id) as totalAssessments
    FROM subjects s
    JOIN marks m ON s.id = m.subjectId
    GROUP BY s.id, s.name
    ORDER BY averageScore DESC
  `

  return NextResponse.json({
    gradeDistribution,
    subjectPerformance
  })
}
