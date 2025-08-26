import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { prisma } from '@/lib/db'
import { TrendingUp, Award } from 'lucide-react'

interface RecentMarksProps {
  userId: string
}

export async function RecentMarks({ userId }: RecentMarksProps) {
  const student = await prisma.student.findUnique({
    where: { userId }
  })

  if (!student) return null

  const recentMarks = await prisma.mark.findMany({
    where: { studentId: student.id },
    include: {
      subject: true,
      faculty: true
    },
    orderBy: { createdAt: 'desc' },
    take: 5
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Award className="h-5 w-5 mr-2" />
          Recent Marks
        </CardTitle>
        <CardDescription>Your latest examination results</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentMarks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No marks available yet
          </div>
        ) : (
          recentMarks.map((mark) => {
            const percentage = (mark.obtainedMarks / mark.maxMarks) * 100
            const getGrade = (percent: number) => {
              if (percent >= 90) return { grade: 'A+', color: 'text-green-600' }
              if (percent >= 80) return { grade: 'A', color: 'text-green-600' }
              if (percent >= 70) return { grade: 'B', color: 'text-blue-600' }
              if (percent >= 60) return { grade: 'C', color: 'text-yellow-600' }
              return { grade: 'F', color: 'text-red-600' }
            }

            const { grade, color } = getGrade(percentage)

            return (
              <div key={mark.id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">{mark.subject.name}</h4>
                    <p className="text-sm text-gray-600">{mark.examType}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">
                      {mark.obtainedMarks}/{mark.maxMarks}
                    </div>
                    <Badge className={color} variant="outline">
                      {grade}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Percentage</span>
                    <span>{percentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
