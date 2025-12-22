'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Interview } from '@/lib/types'
import { Calendar, Briefcase, Award, PlayCircle, Trash2, CheckCircle } from 'lucide-react'

interface InterviewCardProps {
  interview: Interview
  onContinue: () => void
  onDelete: () => void
}

/**
 * Interview card component for displaying interview summary
 */
export default function InterviewCard({ interview, onContinue, onDelete }: InterviewCardProps) {
  const isCompleted = interview.status === 'completed'

  const getStatusBadge = () => {
    switch (interview.status) {
      case 'completed':
        return (
          <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
            <CheckCircle className="mr-1 h-4 w-4" />
            Tamamlandı
          </span>
        )
      case 'in_progress':
        return (
          <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
            <PlayCircle className="mr-1 h-4 w-4" />
            Devam Ediyor
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800">
            Beklemede
          </span>
        )
    }
  }

  return (
    <Card className="transition-shadow hover:shadow-lg">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{interview.title}</CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-600">
            <Briefcase className="mr-2 h-4 w-4" />
            {interview.position}
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="mr-2 h-4 w-4" />
            {new Date(interview.created_at).toLocaleDateString('tr-TR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>

          {isCompleted && interview.score !== undefined && (
            <div className="flex items-center text-sm font-semibold text-primary-600">
              <Award className="mr-2 h-4 w-4" />
              Puan: {interview.score}%
            </div>
          )}
        </div>

        <div className="mt-6 flex space-x-2">
          <Button onClick={onContinue} className="flex-1" variant={isCompleted ? 'outline' : 'default'}>
            {isCompleted ? 'Sonuçları Gör' : 'Devam Et'}
          </Button>
          <Button
            onClick={onDelete}
            variant="outline"
            className="text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
