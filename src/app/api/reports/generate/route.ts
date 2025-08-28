import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { generatePDFReport } from '@/lib/pdf-generator'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const {
      templateId,
      title,
      parameters,
      generatedFor
    } = data

    // Verify template exists and user has access
    const template = await prisma.reportTemplate.findUnique({
      where: { id: templateId }
    })

    if (!template || !template.isActive) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    // Check permissions
    if (session.user.role === 'FACULTY') {
      const allowedTypes = ['ATTENDANCE_REPORT', 'GRADE_REPORT', 'STUDENT_LIST']
      if (!allowedTypes.includes(template.type)) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    }

    // Create report record
    const report = await prisma.report.create({
      data: {
        templateId,
        title,
        parameters: JSON.stringify(parameters),
        status: 'PROCESSING',
        generatedBy: session.user.id,
        generatedFor
      }
    })

    // Generate report asynchronously
    generateReportAsync(report.id, template, parameters)

    return NextResponse.json({
      reportId: report.id,
      status: 'PROCESSING',
      message: 'Report generation started'
    })
  } catch (error) {
    console.error('Error starting report generation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function generateReportAsync(
  reportId: string,
  template: any,
  parameters: any
) {
  try {
    let reportData: any = {}

    // Fetch data based on report type
    switch (template.type) {
      case 'TRANSCRIPT':
        reportData = await generateTranscriptData(parameters.studentId)
        break
      case 'ATTENDANCE_REPORT':
        reportData = await generateAttendanceReportData(parameters)
        break
      case 'GRADE_REPORT':
        reportData = await generateGradeReportData(parameters)
        break
      case 'STUDENT_LIST':
        reportData = await generateStudentListData(parameters)
        break
      case 'ANALYTICS_REPORT':
        reportData = await generateAnalyticsReportData(parameters)
        break
      default:
        throw new Error('Unsupported report type')
    }

    // Generate PDF
    const pdfBuffer = await generatePDFReport(template.template, reportData)
    
    // Save to file system (implement your storage logic)
    const fileName = `report_${reportId}_${Date.now()}.pdf`
    const filePath = `reports/${fileName}`
    const fileUrl = `/api/reports/files/${fileName}`
    
    // In a real implementation, save to your file storage
    // await saveFileToStorage(filePath, pdfBuffer)

    // Update report status
    await prisma.report.update({
      where: { id: reportId },
      data: {
        status: 'COMPLETED',
        filePath,
        fileUrl,
        completedAt: new Date()
      }
    })
  } catch (error) {
    console.error('Error generating report:', error)
    
    await prisma.report.update({
      where: { id: reportId },
      data: {
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    })
  }
}

async function generateTranscriptData(studentId: string) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      department: true,
      marks: {
        include: {
          subject: true,
          faculty: true
        }
      },
      enrollments: {
        include: {
          course: true
        }
      }
    }
  })

  if (!student) throw new Error('Student not found')

  // Calculate GPA and other metrics
  const totalMarks = student.marks.reduce((sum, mark) => sum + mark.obtainedMarks, 0)
  const maxMarks = student.marks.reduce((sum, mark) => sum + mark.maxMarks, 0)
  const percentage = maxMarks > 0 ? (totalMarks / maxMarks) * 100 : 0

  return {
    student: {
      name: `${student.firstName} ${student.lastName}`,
      rollNumber: student.rollNumber,
      department: student.department.name,
      semester: student.semester,
      admissionYear: student.admissionYear
    },
    grades: student.marks,
    summary: {
      totalMarks,
      maxMarks,
      percentage: percentage.toFixed(2),
      grade: calculateGrade(percentage)
    },
    courses: student.enrollments
  }
}

async function generateAttendanceReportData(parameters: any) {
  const { subjectId, startDate, endDate } = parameters

  const attendance = await prisma.attendance.findMany({
    where: {
      subjectId,
      date: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    },
    include: {
      student: {
        include: { department: true }
      },
      subject: true
    }
  })

  // Group by student
  const studentAttendance = attendance.reduce((acc, record) => {
    const studentId = record.student.id
    if (!acc[studentId]) {
      acc[studentId] = {
        student: record.student,
        present: 0,
        absent: 0,
        late: 0,
        total: 0
      }
    }
    
    acc[studentId][record.status.toLowerCase()]++
    acc[studentId].total++
    
    return acc
  }, {} as any)

  return {
    subject: attendance[0]?.subject,
    period: { startDate, endDate },
    students: Object.values(studentAttendance).map((data: any) => ({
      ...data,
      percentage: ((data.present + data.late * 0.5) / data.total * 100).toFixed(2)
    }))
  }
}

async function generateGradeReportData(parameters: any) {
  const { semester, year, departmentId } = parameters

  const marks = await prisma.mark.findMany({
    where: {
      semester,
      year,
      student: departmentId ? { departmentId } : undefined
    },
    include: {
      student: {
        include: { department: true }
      },
      subject: true
    }
  })

  // Group by student and subject
  const studentGrades = marks.reduce((acc, mark) => {
    const studentId = mark.student.id
    if (!acc[studentId]) {
      acc[studentId] = {
        student: mark.student,
        subjects: {}
      }
    }
    
    if (!acc[studentId].subjects[mark.subject.id]) {
      acc[studentId].subjects[mark.subject.id] = {
        subject: mark.subject,
        marks: []
      }
    }
    
    acc[studentId].subjects[mark.subject.id].marks.push(mark)
    
    return acc
  }, {} as any)

  return {
    semester,
    year,
    students: Object.values(studentGrades)
  }
}

async function generateStudentListData(parameters: any) {
  const { departmentId, semester } = parameters

  const students = await prisma.student.findMany({
    where: {
      departmentId,
      semester
    },
    include: {
      department: true,
      user: {
        select: { email: true, isActive: true }
      }
    },
    orderBy: { rollNumber: 'asc' }
  })

  return {
    department: students[0]?.department,
    semester,
    students,
    count: students.length
  }
}

async function generateAnalyticsReportData(parameters: any) {
  const { startDate, endDate, departmentId } = parameters

  const [
    studentCount,
    facultyCount,
    attendanceStats,
    gradeStats
  ] = await Promise.all([
    prisma.student.count({
      where: departmentId ? { departmentId } : undefined
    }),
    prisma.faculty.count({
      where: departmentId ? { departmentId } : undefined
    }),
    prisma.attendance.groupBy({
      by: ['status'],
      _count: true,
      where: {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      }
    }),
    prisma.mark.aggregate({
      _avg: { obtainedMarks: true },
      _count: true,
      where: {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      }
    })
  ])

  return {
    period: { startDate, endDate },
    overview: {
      studentCount,
      facultyCount
    },
    attendance: attendanceStats,
    grades: gradeStats
  }
}

function calculateGrade(percentage: number): string {
  if (percentage >= 90) return 'A+'
  if (percentage >= 80) return 'A'
  if (percentage >= 70) return 'B+'
  if (percentage >= 60) return 'B'
  if (percentage >= 50) return 'C'
  return 'F'
}
