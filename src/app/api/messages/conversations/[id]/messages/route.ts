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

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = (page - 1) * limit

    // Verify user is participant in this conversation
    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId: params.id,
        userId: session.user.id,
        isActive: true
      }
    })

    if (!participant) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const messages = await prisma.message.findMany({
      where: {
        conversationId: params.id
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            role: true,
            student: { select: { firstName: true, lastName: true } },
            faculty: { select: { firstName: true, lastName: true } },
            admin: { select: { firstName: true, lastName: true } },
            staff: { select: { firstName: true, lastName: true } }
          }
        },
        replyTo: {
          include: {
            sender: {
              select: {
                id: true,
                student: { select: { firstName: true, lastName: true } },
                faculty: { select: { firstName: true, lastName: true } },
                admin: { select: { firstName: true, lastName: true } },
                staff: { select: { firstName: true, lastName: true } }
              }
            }
          }
        },
        readReceipts: {
          include: {
            user: {
              select: {
                id: true,
                student: { select: { firstName: true, lastName: true } },
                faculty: { select: { firstName: true, lastName: true } },
                admin: { select: { firstName: true, lastName: true } },
                staff: { select: { firstName: true, lastName: true } }
              }
            }
          }
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                student: { select: { firstName: true, lastName: true } },
                faculty: { select: { firstName: true, lastName: true } },
                admin: { select: { firstName: true, lastName: true } },
                staff: { select: { firstName: true, lastName: true } }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    })

    // Mark messages as read
    const unreadMessageIds = messages
      .filter(msg => msg.senderId !== session.user.id)
      .filter(msg => !msg.readReceipts.some(r => r.userId === session.user.id))
      .map(msg => msg.id)

    if (unreadMessageIds.length > 0) {
      await prisma.messageReadReceipt.createMany({
        data: unreadMessageIds.map(messageId => ({
          messageId,
          userId: session.user.id
        })),
        skipDuplicates: true
      })
    }

    return NextResponse.json(messages.reverse()) // Reverse to show oldest first
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is participant in this conversation
    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId: params.id,
        userId: session.user.id,
        isActive: true
      }
    })

    if (!participant) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const data = await request.json()
    const { content, messageType = 'TEXT', fileUrl, fileName, fileSize, replyToId } = data

    if (!content && !fileUrl) {
      return NextResponse.json({ error: 'Message content or file is required' }, { status: 400 })
    }

    const message = await prisma.message.create({
      data: {
        conversationId: params.id,
        senderId: session.user.id,
        content: content || '',
        messageType,
        fileUrl,
        fileName,
        fileSize,
        replyToId
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            role: true,
            student: { select: { firstName: true, lastName: true } },
            faculty: { select: { firstName: true, lastName: true } },
            admin: { select: { firstName: true, lastName: true } },
            staff: { select: { firstName: true, lastName: true } }
          }
        },
        replyTo: {
          include: {
            sender: {
              select: {
                id: true,
                student: { select: { firstName: true, lastName: true } },
                faculty: { select: { firstName: true, lastName: true } },
                admin: { select: { firstName: true, lastName: true } },
                staff: { select: { firstName: true, lastName: true } }
              }
            }
          }
        }
      }
    })

    // Update conversation's last message timestamp
    await prisma.conversation.update({
      where: { id: params.id },
      data: { lastMessageAt: new Date() }
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
