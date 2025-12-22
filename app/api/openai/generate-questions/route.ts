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
      // ✅ PROD'DA ÇALIŞAN MODEL
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            "You are an expert interviewer. Generate concise, professional interview questions.",
        },
        {
          role: 'user',
          content: `
Generate exactly 5 interview questions for a "${position}" position
based on the following CV.

Rules:
- Return ONLY a valid JSON array of strings
- No explanations
- No numbering
- No extra text

CV:
${cvText}
`,
        },
      ],
      temperature: 0.7,
      max_tokens: 600,
    })

    const content = completion.choices[0].message.content ?? '[]'

    // --------------------
    // SAFE PARSE
    // --------------------
    let questionTexts: string[] = []

    try {
      const parsed = JSON.parse(content)
      if (Array.isArray(parsed)) {
        questionTexts = parsed
      }
    } catch {
      // Fallback (asla patlamaz)
      questionTexts = content
        .split('\n')
        .map(q => q.replace(/^[0-9.\-\s]+/, '').trim())
        .filter(Boolean)
        .slice(0, 5)
    }

    // --------------------
    // TYPE-SAFE RESPONSE
    // --------------------
    const questions: Question[] = questionTexts.map((text, index) => ({
      id: `q-${index + 1}`,
      interview_id: 'temp-id',
      question_text: text,
      order: index + 1,
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
    console.error('❌ OpenAI question generation failed:', error)

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
