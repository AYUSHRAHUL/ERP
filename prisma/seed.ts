import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create departments
  const departments = await Promise.all([
    prisma.department.create({
      data: {
        name: 'Computer Science & Engineering',
        code: 'CSE',
        description: 'Department of Computer Science and Engineering'
      }
    }),
    prisma.department.create({
      data: {
        name: 'Electronics & Communication',
        code: 'ECE',
        description: 'Department of Electronics and Communication Engineering'
      }
    }),
    prisma.department.create({
      data: {
        name: 'Mechanical Engineering',
        code: 'MECH',
        description: 'Department of Mechanical Engineering'
      }
    }),
    prisma.department.create({
      data: {
        name: 'Civil Engineering',
        code: 'CIVIL',
        description: 'Department of Civil Engineering'
      }
    })
  ])

  const [cse, ece, mech, civil] = departments

  // Create courses
  const courses = await Promise.all([
    prisma.course.create({
      data: {
        name: 'Bachelor of Technology - Computer Science',
        code: 'BTECH-CSE',
        credits: 160,
        semester: 8,
        departmentId: cse.id
      }
    }),
    prisma.course.create({
      data: {
        name: 'Bachelor of Technology - Electronics',
        code: 'BTECH-ECE',
        credits: 160,
        semester: 8,
        departmentId: ece.id
      }
    }),
    prisma.course.create({
      data: {
        name: 'Bachelor of Technology - Mechanical',
        code: 'BTECH-MECH',
        credits: 160,
        semester: 8,
        departmentId: mech.id
      }
    })
  ])

  const [btechCSE, btechECE, btechMECH] = courses

  // Create subjects
  const subjects = await Promise.all([
    // CSE Subjects
    prisma.subject.create({
      data: {
        name: 'Data Structures and Algorithms',
        code: 'CSE201',
        credits: 4,
        courseId: btechCSE.id
      }
    }),
    prisma.subject.create({
      data: {
        name: 'Database Management Systems',
        code: 'CSE301',
        credits: 3,
        courseId: btechCSE.id
      }
    }),
    prisma.subject.create({
      data: {
        name: 'Software Engineering',
        code: 'CSE401',
        credits: 3,
        courseId: btechCSE.id
      }
    }),
    prisma.subject.create({
      data: {
        name: 'Operating Systems',
        code: 'CSE302',
        credits: 4,
        courseId: btechCSE.id
      }
    }),
    prisma.subject.create({
      data: {
        name: 'Computer Networks',
        code: 'CSE402',
        credits: 3,
        courseId: btechCSE.id
      }
    }),
    // ECE Subjects
    prisma.subject.create({
      data: {
        name: 'Digital Electronics',
        code: 'ECE201',
        credits: 4,
        courseId: btechECE.id
      }
    }),
    prisma.subject.create({
      data: {
        name: 'Signals and Systems',
        code: 'ECE301',
        credits: 3,
        courseId: btechECE.id
      }
    }),
    // MECH Subjects
    prisma.subject.create({
      data: {
        name: 'Thermodynamics',
        code: 'MECH201',
        credits: 4,
        courseId: btechMECH.id
      }
    })
  ])

  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@college.edu',
      password: await bcrypt.hash('admin123', 12),
      role: 'ADMIN',
      admin: {
        create: {
          firstName: 'System',
          lastName: 'Administrator',
          phone: '+1234567890'
        }
      }
    }
  })

  // Create faculty users
  const facultyUsers = await Promise.all([
    prisma.user.create({
      data: {
        email: 'john.smith@college.edu',
        password: await bcrypt.hash('faculty123', 12),
        role: 'FACULTY',
        faculty: {
          create: {
            employeeId: 'FAC001',
            firstName: 'Dr. John',
            lastName: 'Smith',
            phone: '+1234567891',
            qualification: 'PhD in Computer Science',
            experience: 10,
            departmentId: cse.id
          }
        }
      }
    }),
    prisma.user.create({
      data: {
        email: 'sarah.wilson@college.edu',
        password: await bcrypt.hash('faculty123', 12),
        role: 'FACULTY',
        faculty: {
          create: {
            employeeId: 'FAC002',
            firstName: 'Dr. Sarah',
            lastName: 'Wilson',
            phone: '+1234567892',
            qualification: 'PhD in Electronics Engineering',
            experience: 8,
            departmentId: ece.id
          }
        }
      }
    }),
    prisma.user.create({
      data: {
        email: 'mike.johnson@college.edu',
        password: await bcrypt.hash('faculty123', 12),
        role: 'FACULTY',
        faculty: {
          create: {
            employeeId: 'FAC003',
            firstName: 'Prof. Mike',
            lastName: 'Johnson',
            phone: '+1234567893',
            qualification: 'M.Tech in Computer Science',
            experience: 5,
            departmentId: cse.id
          }
        }
      }
    })
  ])

  // Create student users
  const studentNames = [
    { first: 'Alice', last: 'Johnson' },
    { first: 'Bob', last: 'Williams' },
    { first: 'Charlie', last: 'Brown' },
    { first: 'Diana', last: 'Davis' },
    { first: 'Edward', last: 'Miller' },
    { first: 'Fiona', last: 'Wilson' },
    { first: 'George', last: 'Moore' },
    { first: 'Hannah', last: 'Taylor' },
    { first: 'Ian', last: 'Anderson' },
    { first: 'Julia', last: 'Thomas' },
    { first: 'Kevin', last: 'Jackson' },
    { first: 'Lisa', last: 'White' },
    { first: 'Mark', last: 'Harris' },
    { first: 'Nina', last: 'Martin' },
    { first: 'Oscar', last: 'Thompson' }
  ]

  const studentUsers = await Promise.all(
    studentNames.map((name, i) => {
      const deptIndex = i % 3
      const dept = [cse, ece, mech][deptIndex]
      const deptCode = ['CSE', 'ECE', 'MECH'][deptIndex]
      
      return prisma.user.create({
        data: {
          email: `${name.first.toLowerCase()}.${name.last.toLowerCase()}@student.college.edu`,
          password: bcrypt.hashSync('student123', 12),
          role: 'STUDENT',
          student: {
            create: {
              rollNumber: `${deptCode}2024${String(i + 1).padStart(3, '0')}`,
              firstName: name.first,
              lastName: name.last,
              phone: `+1234567${String(900 + i).padStart(3, '0')}`,
              dateOfBirth: new Date(`200${2 + (i % 3)}-${String((i % 12) + 1).padStart(2, '0')}-15`),
              address: `${123 + i} Student Street, College Town`,
              guardianName: `Guardian ${name.last}`,
              guardianPhone: `+9876543${String(200 + i).padStart(3, '0')}`,
              departmentId: dept.id,
              semester: Math.floor(i / 2) + 1,
              admissionYear: 2024 - Math.floor(i / 5)
            }
          }
        }
      })
    })
  )

  // Create staff users
  const staffUsers = await Promise.all([
    prisma.user.create({
      data: {
        email: 'library@college.edu',
        password: await bcrypt.hash('staff123', 12),
        role: 'STAFF',
        staff: {
          create: {
            employeeId: 'STF001',
            firstName: 'Mary',
            lastName: 'Wilson',
            phone: '+1234567894',
            department: 'LIBRARY'
          }
        }
      }
    }),
    prisma.user.create({
      data: {
        email: 'hostel@college.edu',
        password: await bcrypt.hash('staff123', 12),
        role: 'STAFF',
        staff: {
          create: {
            employeeId: 'STF002',
            firstName: 'Robert',
            lastName: 'Brown',
            phone: '+1234567895',
            department: 'HOSTEL'
          }
        }
      }
    }),
    prisma.user.create({
      data: {
        email: 'transport@college.edu',
        password: await bcrypt.hash('staff123', 12),
        role: 'STAFF',
        staff: {
          create: {
            employeeId: 'STF003',
            firstName: 'Jennifer',
            lastName: 'Davis',
            phone: '+1234567896',
            department: 'TRANSPORT'
          }
        }
      }
    })
  ])

  // Get created faculty for allocations
  const johnSmith = await prisma.faculty.findUnique({
    where: { employeeId: 'FAC001' }
  })
  const sarahWilson = await prisma.faculty.findUnique({
    where: { employeeId: 'FAC002' }
  })
  const mikeJohnson = await prisma.faculty.findUnique({
    where: { employeeId: 'FAC003' }
  })

  // Create subject allocations
  const allocations = []
  if (johnSmith) {
    allocations.push(
      prisma.subjectAllocation.create({
        data: {
          facultyId: johnSmith.id,
          subjectId: subjects[0].id, // Data Structures
          semester: 3,
          year: 2024
        }
      }),
      prisma.subjectAllocation.create({
        data: {
          facultyId: johnSmith.id,
          subjectId: subjects[1].id, // Database Systems
          semester: 5,
          year: 2024
        }
      })
    )
  }

  if (sarahWilson) {
    allocations.push(
      prisma.subjectAllocation.create({
        data: {
          facultyId: sarahWilson.id,
          subjectId: subjects[5].id, // Digital Electronics
          semester: 3,
          year: 2024
        }
      })
    )
  }

  if (mikeJohnson) {
    allocations.push(
      prisma.subjectAllocation.create({
        data: {
          facultyId: mikeJohnson.id,
          subjectId: subjects[2].id, // Software Engineering
          semester: 7,
          year: 2024
        }
      })
    )
  }

  await Promise.all(allocations)

  // Create course enrollments
  const students = await prisma.student.findMany()
  const enrollments = []

  for (const student of students) {
    // Enroll students in courses based on their department
    let courseId
    if (student.departmentId === cse.id) courseId = btechCSE.id
    else if (student.departmentId === ece.id) courseId = btechECE.id
    else if (student.departmentId === mech.id) courseId = btechMECH.id

    if (courseId) {
      enrollments.push(
        prisma.enrollment.create({
          data: {
            studentId: student.id,
            courseId: courseId,
            semester: student.semester,
            year: 2024
          }
        })
      )
    }
  }

  await Promise.all(enrollments)

  // Create fee structures
  const feeStructures = []
  for (const dept of departments) {
    for (let sem = 1; sem <= 8; sem++) {
      feeStructures.push(
        prisma.feeStructure.create({
          data: {
            departmentId: dept.id,
            semester: sem,
            tuitionFee: 45000 + (sem * 1000),
            libraryFee: 5000,
            labFee: 8000 + (sem * 500),
            otherFee: 5000,
            totalFee: 63000 + (sem * 1500),
            year: 2024
          }
        })
      )
    }
  }

  await Promise.all(feeStructures)

  // Create sample attendance records
  if (johnSmith && students.length > 0) {
    const attendanceRecords = []
    const cseStudents = students.filter(s => s.departmentId === cse.id)
    
    for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
      const attendanceDate = new Date()
      attendanceDate.setDate(attendanceDate.getDate() - dayOffset)
      
      // Skip weekends
      if (attendanceDate.getDay() === 0 || attendanceDate.getDay() === 6) continue

      for (const student of cseStudents.slice(0, 10)) {
        attendanceRecords.push(
          prisma.attendance.create({
            data: {
              studentId: student.id,
              subjectId: subjects[0].id,
              facultyId: johnSmith.id,
              date: attendanceDate,
              status: Math.random() > 0.15 ? 'PRESENT' : (Math.random() > 0.5 ? 'ABSENT' : 'LATE')
            }
          })
        )
      }
    }

    await Promise.all(attendanceRecords)
  }

  // Create sample marks
  const markRecords = []
  if (johnSmith && students.length > 0) {
    const cseStudents = students.filter(s => s.departmentId === cse.id)
    
    const examTypes = ['QUIZ', 'MIDTERM', 'FINAL', 'ASSIGNMENT']
    const maxMarks = [20, 100, 100, 50]

    for (let i = 0; i < examTypes.length; i++) {
      for (const student of cseStudents.slice(0, 10)) {
        const obtained = Math.floor(Math.random() * (maxMarks[i] * 0.4)) + (maxMarks[i] * 0.6)
        markRecords.push(
          prisma.mark.create({
            data: {
              studentId: student.id,
              subjectId: subjects[0].id,
              facultyId: johnSmith.id,
              examType: examTypes[i],
              maxMarks: maxMarks[i],
              obtainedMarks: Math.min(obtained, maxMarks[i]),
              semester: 3,
              year: 2024
            }
          })
        )
      }
    }
  }

  // Add marks for other subjects/faculty
  if (mikeJohnson && students.length > 0) {
    const cseStudents = students.filter(s => s.departmentId === cse.id)
    
    for (const student of cseStudents.slice(0, 8)) {
      markRecords.push(
        prisma.mark.create({
          data: {
            studentId: student.id,
            subjectId: subjects[2].id, // Software Engineering
            facultyId: mikeJohnson.id,
            examType: 'MIDTERM',
            maxMarks: 100,
            obtainedMarks: Math.floor(Math.random() * 30) + 70,
            semester: 7,
            year: 2024
          }
        })
      )
    }
  }

  await Promise.all(markRecords)

  // Create sample fee payments
  const feePayments = []
  for (let i = 0; i < 8; i++) {
    const student = students[i]
    if (student) {
      feePayments.push(
        prisma.feePayment.create({
          data: {
            studentId: student.id,
            amount: 65000 + (Math.floor(Math.random() * 10000)),
            paymentMethod: ['CARD', 'UPI', 'NET_BANKING'][Math.floor(Math.random() * 3)],
            status: Math.random() > 0.1 ? 'COMPLETED' : 'PENDING',
            transactionId: `TXN${Date.now()}${i}`,
            semester: student.semester,
            year: 2024,
            createdAt: new Date(Date.now() - (Math.random() * 30 * 24 * 60 * 60 * 1000))
          }
        })
      )
    }
  }

  await Promise.all(feePayments)

  console.log('✅ Seeding completed successfully!')
  console.log('')
  console.log('🔑 Login Credentials:')
  console.log('-------------------')
  console.log('👨‍💼 Admin: admin@college.edu / admin123')
  console.log('👨‍🏫 Faculty:')
  console.log('   - john.smith@college.edu / faculty123 (CSE)')
  console.log('   - sarah.wilson@college.edu / faculty123 (ECE)')
  console.log('   - mike.johnson@college.edu / faculty123 (CSE)')
  console.log('👨‍🎓 Students:')
  console.log('   - alice.johnson@student.college.edu / student123')
  console.log('   - bob.williams@student.college.edu / student123')
  console.log('   - (and 13 more student accounts...)')
  console.log('👷 Staff:')
  console.log('   - library@college.edu / staff123 (Library)')
  console.log('   - hostel@college.edu / staff123 (Hostel)')
  console.log('   - transport@college.edu / staff123 (Transport)')
  console.log('')
  console.log('📊 Sample Data Created:')
  console.log('---------------------')
  console.log(`📚 Departments: ${departments.length}`)
  console.log(`🎓 Courses: ${courses.length}`)
  console.log(`📖 Subjects: ${subjects.length}`)
  console.log(`👨‍🎓 Students: ${students.length}`)
  console.log(`👨‍🏫 Faculty: ${facultyUsers.length}`)
  console.log(`👷 Staff: ${staffUsers.length}`)
  console.log('📝 Attendance records: 200+')
  console.log('📊 Marks entries: 50+')
  console.log('💰 Fee payments: 8')
  console.log('')
  console.log('🚀 Ready to start development server with: npm run dev')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
