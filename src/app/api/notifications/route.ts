import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// Add to your Prisma schema
/*
model Notification {
  id        String   @id @default(cuid())
  title     String
  message   String   @db.Text
  type      NotificationType
  priority  Priority @default(NORMAL)
  targetRole Role?
  targetUserId String?
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())
  createdBy String
  
  @@map("notifications")
}

enum NotificationType {
  GENERAL
  ACADEMIC
  FEE_REMINDER
  ATTENDANCE_ALERT
  EXAM_SCHEDULE
  RESULT_PUBLISHED
  SYSTEM_UPDATE
}
*/

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '10')

    let whereClause: any = {
      OR: [
        { targetRole: session.user.role },
        { targetUserId: session.user.id },
        { targetRole: null } // General notifications
      ]
    }

    if (type) {
      whereClause.type = type
    }

    const notifications = await prisma.notification.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: limit
    })

    const unreadCount = await prisma.notification.count({
      where: {
        ...whereClause,
        isRead: false
      }
    })

    return NextResponse.json({
      notifications,
      unreadCount
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !['ADMIN', 'FACULTY'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const {
      title,
      message,
      type,
      priority = 'NORMAL',
      targetRole,
      targetUserId
    } = data

    const notification = await prisma.notification.create({
      data: {
        title,
        message,
        type,
        priority,
        targetRole,
        targetUserId,
        createdBy: session.user.id
      }
    })

    return NextResponse.json(notification)
  } catch (error) {
    console.error('Error creating notification:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
