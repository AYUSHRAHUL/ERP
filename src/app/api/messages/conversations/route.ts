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
    const search = searchParams.get('search')

    let whereClause: any = {
      participants: {
        some: {
          userId: session.user.id,
          isActive: true
        }
      }
    }

    const conversations = await prisma.conversation.findMany({
      where: whereClause,
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                role: true,
                student: {
                  select: {
                    firstName: true,
                    lastName: true
                  }
                },
                faculty: {
                  select: {
                    firstName: true,
                    lastName: true
                  }
                },
                admin: {
                  select: {
                    firstName: true,
                    lastName: true
                  }
                },
                staff: {
                  select: {
                    firstName: true,
                    lastName: true
                  }
                },
                onlineStatus: true
              }
            }
          },
          where: {
            isActive: true
          }
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          include: {
            sender: {
              select: {
                id: true,
                student: { select: { firstName: true, lastName: true } },
                faculty: { select: { firstName: true, lastName: true } },
                admin: { select: { firstName: true, lastName: true } },
                staff: { select: { firstName: true, lastName: true } }
              }
            },
            _count: {
              select: {
                readReceipts: {
                  where: { userId: session.user.id }
                }
              }
            }
          }
        },
        _count: {
          select: {
            messages: {
              where: {
                readReceipts: {
                  none: {
                    userId: session.user.id
                  }
                },
                senderId: {
                  not: session.user.id
                }
              }
            }
          }
        }
      },
      orderBy: {
        lastMessageAt: 'desc'
      }
    })

    // Filter by search if provided
    let filteredConversations = conversations
    if (search) {
      filteredConversations = conversations.filter(conv => {
        const otherParticipants = conv.participants.filter(p => p.userId !== session.user.id)
        return otherParticipants.some(p => {
          const user = p.user
          const name = getUserFullName(user)
          return name.toLowerCase().includes(search.toLowerCase()) ||
                 user.email.toLowerCase().includes(search.toLowerCase())
        })
      })
    }

    return NextResponse.json(filteredConversations)
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const { participantIds, name, type = 'DIRECT' } = data

    // Validate participants
    if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
      return NextResponse.json({ error: 'Participant IDs are required' }, { status: 400 })
    }

    // Include current user in participants
    const allParticipantIds = [...new Set([session.user.id, ...participantIds])]

    // For direct conversations, check if one already exists
    if (type === 'DIRECT' && allParticipantIds.length === 2) {
      const existingConversation = await prisma.conversation.findFirst({
        where: {
          type: 'DIRECT',
          participants: {
            every: {
              userId: { in: allParticipantIds },
              isActive: true
            }
          },
          AND: {
            participants: {
              some: { userId: allParticipantIds[0] }
            }
          }
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  role: true,
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

      if (existingConversation) {
        return NextResponse.json(existingConversation)
      }
    }

    // Create new conversation
    const conversation = await prisma.conversation.create({
      data: {
        name,
        type,
        createdBy: session.user.id,
        participants: {
          create: allParticipantIds.map((userId, index) => ({
            userId,
            role: userId === session.user.id ? 'ADMIN' : 'MEMBER'
          }))
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                role: true,
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

    return NextResponse.json(conversation)
  } catch (error) {
    console.error('Error creating conversation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function getUserFullName(user: any) {
  if (user.student) return `${user.student.firstName} ${user.student.lastName}`
  if (user.faculty) return `${user.faculty.firstName} ${user.faculty.lastName}`
  if (user.admin) return `${user.admin.firstName} ${user.admin.lastName}`
  if (user.staff) return `${user.staff.firstName} ${user.staff.lastName}`
  return user.email
}
