import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@/lib/openai'
import { ApiResponse, Question } from '@/lib/types'

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
            "You are an expert interviewer. Generate relevant, insightful interview questions based on the candidate's CV and the position they are applying for.",
        },
        {
          role: 'user',
          content: `Generate 5 interview questions for a ${position} position based on this CV:

${cvText}

Respond with a JSON array of question strings.`,
        },
      ],
      temperature: 0.8,
      max_tokens: 800,
    })

    const content = completion.choices[0].message.content || '[]'
    const questionTexts: string[] = JSON.parse(content)

    // ✅ Question type ile birebir uyumlu
    const questions: Question[] = questionTexts.map((text, index) => ({
      id: `q-${index + 1}`,
      interview_id: 'temp-id',
      question_text: text,
      order: index + 1, // ⬅️ KRİTİK FIX
      created_at: new Date().toISOString(),
    }))

    return NextResponse.json(
      {
        success: true,
        data: { questions },
      } as ApiResponse,
      { status: 200 }
    )
  } catch (error) {
    console.error('Question generation error:', error)

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to generate questions',
      } as ApiResponse,
      { status: 500 }
    )
  }
}
