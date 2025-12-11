import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@/lib/openai'
import { ApiResponse, Question } from '@/lib/types'

/**
 * Generate interview questions with OpenAI API endpoint
 * Creates personalized questions based on CV and position
 */
export async function POST(request: NextRequest) {
  try {
    const { cvText, position } = await request.json()

    if (!cvText || !position) {
      return NextResponse.json(
        { success: false, error: 'CV text and position are required' } as ApiResponse,
        { status: 400 }
      )
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert interviewer. Generate relevant, insightful interview questions based on the candidate\'s CV and the position they are applying for.',
        },
        {
          role: 'user',
          content: `Generate 5 interview questions for a ${position} position based on this CV:

${cvText}

Requirements:
- Questions should be specific to their experience and skills
- Mix of technical and behavioral questions
- Professional and relevant
- Each question should be clear and concise

Respond with a JSON array of question strings.`,
        },
      ],
      temperature: 0.8,
      max_tokens: 800,
    })

    const content = completion.choices[0].message.content || '[]'
    const questionTexts: string[] = JSON.parse(content)

    // Convert to Question objects
    const questions: Question[] = questionTexts.map((text, index) => ({
      id: `q-${index + 1}`,
      interview_id: 'temp-id',
      question_text: text,
      order: index + 1,
      created_at: new Date().toISOString(),
    }))

    return NextResponse.json({
      success: true,
      data: { questions },
    } as ApiResponse)
  } catch (error) {
    console.error('Question generation error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate questions' } as ApiResponse,
      { status: 500 }
    )
  }
}
