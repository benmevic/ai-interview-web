'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import QuestionCard from '@/components/QuestionCard'
import { Question, Interview } from '@/lib/types'
import { CheckCircle, Award } from 'lucide-react'

/**
 * Active interview page with questions and answers
 */
export default function InterviewPage() {
  const router = useRouter()
  const params = useParams()
  const interviewId = params.id as string

  const [interview, setInterview] = useState<Interview | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    // Check authentication
    const session = localStorage.getItem('user_session')
    if (!session) {
      router.push('/login')
      return
    }

    // Fetch interview data
    fetchInterview()
  }, [router, interviewId])

  const fetchInterview = async () => {
    try {
      const response = await fetch(`/api/interview/${interviewId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch interview')
      }

      setInterview(data.data.interview)
      setQuestions(data.data.questions)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitAnswer = async (answer: string) => {
    try {
      const response = await fetch('/api/openai/evaluate-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: questions[currentQuestionIndex].id,
          answer,
          question: questions[currentQuestionIndex].question_text,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to evaluate answer')
      }

      // Update question with evaluation
      const updatedQuestions = [...questions]
      updatedQuestions[currentQuestionIndex] = {
        ...updatedQuestions[currentQuestionIndex],
        answer_text: answer,
        score: data.data.score,
        feedback: data.data.feedback,
      }
      setQuestions(updatedQuestions)

      // Move to next question after a delay
      setTimeout(() => {
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1)
        }
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit answer')
    }
  }

  const isInterviewComplete =
    questions.length > 0 &&
    questions.every((q) => q.answer_text && q.score !== undefined)

  const totalScore = isInterviewComplete
    ? Math.round(
        questions.reduce((sum, q) => sum + (q.score || 0), 0) / questions.length * 10
      )
    : 0

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading interview...</p>
        </div>
      </div>
    )
  }

  if (error || !interview) {
    return (
      <div className="gradient-bg flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-red-600">{error || 'Interview not found'}</p>
            <Button className="mt-4" onClick={() => router.push('/dashboard')}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isInterviewComplete) {
    return (
      <div className="gradient-bg min-h-[calc(100vh-4rem)] py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Card className="text-center">
            <CardContent className="p-12">
              <Award className="mx-auto h-16 w-16 text-primary-600" />
              <h1 className="mt-4 text-3xl font-bold text-gray-900">
                Interview Complete!
              </h1>
              <p className="mt-2 text-lg text-gray-600">
                Great job completing {interview.title}
              </p>

              <div className="mt-8 rounded-xl bg-gradient-to-r from-primary-50 to-secondary-50 p-8">
                <p className="text-sm text-gray-600">Your Score</p>
                <p className="mt-2 text-5xl font-bold text-primary-600">{totalScore}%</p>
              </div>

              <div className="mt-8 space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">Question Review</h2>
                {questions.map((question, index) => (
                  <QuestionCard key={question.id} question={question} isAnswered={true} />
                ))}
              </div>

              <div className="mt-8 flex justify-center space-x-4">
                <Button onClick={() => router.push('/dashboard')}>
                  Back to Dashboard
                </Button>
                <Button variant="outline" onClick={() => router.push('/interview/new')}>
                  Start New Interview
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="gradient-bg min-h-[calc(100vh-4rem)] py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{interview.title}</h1>
          <p className="mt-2 text-gray-600">{interview.position}</p>
        </div>

        {/* Progress */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Progress</p>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {questions.map((q, index) => (
                  <div
                    key={q.id}
                    className={`h-2 w-8 rounded-full ${
                      q.answer_text
                        ? 'bg-green-500'
                        : index === currentQuestionIndex
                        ? 'bg-primary-500'
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Question */}
        {questions[currentQuestionIndex] && (
          <QuestionCard
            question={questions[currentQuestionIndex]}
            onSubmitAnswer={handleSubmitAnswer}
            isAnswered={!!questions[currentQuestionIndex].answer_text}
          />
        )}

        {/* Navigation */}
        {questions[currentQuestionIndex]?.answer_text && (
          <div className="mt-8 flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </Button>
            <Button
              onClick={() =>
                setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))
              }
              disabled={currentQuestionIndex === questions.length - 1}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
