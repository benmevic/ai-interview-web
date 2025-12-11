import { NextRequest, NextResponse } from 'next/server'
import { ApiResponse, Interview, Question } from '@/lib/types'

/**
 * Get interview details API endpoint
 * Returns interview data and associated questions
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const interviewId = params.id

    // In a real app, fetch from database
    // For demo, return mock data
    const interview: Interview = {
      id: interviewId,
      user_id: 'user-123',
      title: 'Software Engineer Interview',
      position: 'Senior Frontend Developer',
      status: 'in_progress',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Mock questions
    const questions: Question[] = [
      {
        id: '1',
        interview_id: interviewId,
        question_text:
          'Can you describe your experience with React and how you\'ve used it in production applications?',
        order: 1,
        created_at: new Date().toISOString(),
      },
      {
        id: '2',
        interview_id: interviewId,
        question_text:
          'Tell me about a challenging technical problem you solved recently. What was your approach?',
        order: 2,
        created_at: new Date().toISOString(),
      },
      {
        id: '3',
        interview_id: interviewId,
        question_text:
          'How do you handle state management in large React applications?',
        order: 3,
        created_at: new Date().toISOString(),
      },
      {
        id: '4',
        interview_id: interviewId,
        question_text:
          'Describe your experience with TypeScript and why it\'s beneficial in modern web development.',
        order: 4,
        created_at: new Date().toISOString(),
      },
      {
        id: '5',
        interview_id: interviewId,
        question_text:
          'How do you ensure the accessibility of your web applications?',
        order: 5,
        created_at: new Date().toISOString(),
      },
    ]

    return NextResponse.json({
      success: true,
      data: {
        interview,
        questions,
      },
    } as ApiResponse)
  } catch (error) {
    console.error('Get interview error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get interview' } as ApiResponse,
      { status: 500 }
    )
  }
}
