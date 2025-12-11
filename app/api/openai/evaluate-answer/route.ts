import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@/lib/openai'
import { ApiResponse, Evaluation } from '@/lib/types'

/**
 * Evaluate answer with OpenAI API endpoint
 * Analyzes user's answer and provides score and feedback
 */
export async function POST(request: NextRequest) {
  try {
    const { questionId, question, answer } = await request.json()

    if (!question || !answer) {
      return NextResponse.json(
        { success: false, error: 'Question and answer are required' } as ApiResponse,
        { status: 400 }
      )
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert interviewer evaluating candidate responses. Provide constructive feedback with a score out of 10.',
        },
        {
          role: 'user',
          content: `Evaluate this interview answer:

Question: ${question}

Answer: ${answer}

Provide:
1. Score (0-10)
2. Detailed feedback (2-3 sentences)
3. Strengths (array of 2-3 points)
4. Areas for improvement (array of 2-3 points)

Respond in JSON format with keys: score, feedback, strengths, improvements`,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    })

    const content = completion.choices[0].message.content || '{}'
    const evaluation: Evaluation = JSON.parse(content)

    return NextResponse.json({
      success: true,
      data: {
        questionId,
        score: evaluation.score,
        feedback: evaluation.feedback,
        strengths: evaluation.strengths,
        improvements: evaluation.improvements,
      },
    } as ApiResponse)
  } catch (error) {
    console.error('Answer evaluation error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to evaluate answer' } as ApiResponse,
      { status: 500 }
    )
  }
}
