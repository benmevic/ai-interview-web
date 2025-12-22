'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Question } from '@/lib/types'
import { MessageCircle, CheckCircle } from 'lucide-react'
import { useState } from 'react'

interface QuestionCardProps {
  question: Question
  onSubmitAnswer?: (answer: string) => void
  isAnswered?: boolean
}

/**
 * Question card component for displaying interview questions
 */
export default function QuestionCard({
  question,
  onSubmitAnswer,
  isAnswered = false,
}: QuestionCardProps) {
  const [answer, setAnswer] = useState(question.answer_text || '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!answer.trim() || !onSubmitAnswer) return

    setIsSubmitting(true)
    await onSubmitAnswer(answer)
    setIsSubmitting(false)
  }

  return (
    <Card variant="gradient">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="flex items-center">
            <MessageCircle className="mr-2 h-5 w-5 text-primary-600" />
            Soru {question.order_num}
          </CardTitle>
          {isAnswered && (
            <CheckCircle className="h-5 w-5 text-green-600" />
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <p className="text-gray-800">{question.question_text}</p>

          {!isAnswered ? (
            <>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Cevabınızı buraya yazın..."
                rows={6}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <Button
                onClick={handleSubmit}
                disabled={!answer.trim() || isSubmitting}
                className="w-full"
              >
                {isSubmitting ? 'Gönderiliyor...' : 'Cevabı Gönder'}
              </Button>
            </>
          ) : (
            <>
              <div className="rounded-lg bg-white p-4">
                <p className="text-sm font-medium text-gray-700">Cevabınız:</p>
                <p className="mt-2 text-gray-800">{question.answer_text}</p>
              </div>

              {question.score !== undefined && (
                <div className="rounded-lg bg-white p-4">
                  <p className="text-sm font-medium text-gray-700">Puan:</p>
                  <p className="mt-1 text-2xl font-bold text-primary-600">
                    {question.score}/10
                  </p>
                </div>
              )}

              {question.feedback && (
                <div className="rounded-lg bg-white p-4">
                  <p className="text-sm font-medium text-gray-700">Geri Bildirim:</p>
                  <p className="mt-2 text-gray-800">{question.feedback}</p>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
