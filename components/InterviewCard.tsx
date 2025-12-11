import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Interview } from '@/lib/types'
import { Calendar, Briefcase, TrendingUp } from 'lucide-react'

interface InterviewCardProps {
  interview: Interview
}

/**
 * Interview card component for displaying interview history
 */
export default function InterviewCard({ interview }: InterviewCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100'
      case 'in_progress':
        return 'text-yellow-600 bg-yellow-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Tamamlandı'
      case 'in_progress':
        return 'Devam Ediyor'
      default:
        return status
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{interview.title}</CardTitle>
            <p className="mt-1 text-sm text-gray-600">{interview.position}</p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(
              interview.status
            )}`}
          >
            {getStatusText(interview.status)}
          </span>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="mr-2 h-4 w-4" />
            {formatDate(interview.created_at)}
          </div>

          {interview.score !== undefined && (
            <div className="flex items-center text-sm text-gray-600">
              <TrendingUp className="mr-2 h-4 w-4" />
              Puan: <span className="ml-1 font-semibold">{interview.score}%</span>
            </div>
          )}

          <div className="flex items-center text-sm text-gray-600">
            <Briefcase className="mr-2 h-4 w-4" />
            {interview.status === 'completed' ? 'Tamamlandı' : 'Devam Ediyor'}
          </div>

          <div className="mt-4 flex space-x-2">
            {interview.status === 'in_progress' && (
              <Link href={`/interview/${interview.id}`} className="flex-1">
                <Button className="w-full" size="sm">
                  Devam Et
                </Button>
              </Link>
            )}
            {interview.status === 'completed' && (
              <Link href={`/interview/${interview.id}`} className="flex-1">
                <Button variant="outline" className="w-full" size="sm">
                  Detayları Gör
                </Button>
              </Link>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
