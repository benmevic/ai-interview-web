import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@/lib/openai'
import { ApiResponse, Question } from '@/lib/types'

/**
 * Generate interview questions with OpenAI API endpoint
 */
export async function POST(request: NextRequest) {
  try {
    // 🔍 DEBUG: OpenAI key kontrol
    const hasKey = !!process.env.OPENAI_API_KEY

    const { cvText, position } = await request.json()

    if (!cvText || !position) {
      return NextResponse.json(
        { success: false, error: 'CV text and position are required' } as ApiResponse,
        { status: 400 }
      )
    }

    // -----------------------------
    // MOCK QUESTIONS (Key yoksa)
    // -----------------------------
    if (!hasKey) {
      console.log('⚠️ Using mock questions (no OpenAI key)')

      const mockQuestions: Question[] = [
        {
          id: 'q-1',
          interview_id: 'temp-id',
          question_text: `${position} pozisyonu için en önemli becerileriniz nelerdir?`,
          order: 1,
          created_at: new Date().toISOString(),
        },
        {
          id: 'q-2',
          interview_id: 'temp-id',
          question_text: 'Geçmiş projelerinizde karşılaştığınız en büyük zorluk neydi?',
          order: 2,
          created_at: new Date().toISOString(),
        },
        {
          id: 'q-3',
          interview_id: 'temp-id',
          question_text: 'Neden bu pozisyona başvurdunuz?',
          order: 3,
          created_at: new Date().toISOString(),
        },
        {
          id: 'q-4',
          interview_id: 'temp-id',
          question_text: 'Ekip çalışması konusunda bir deneyiminizi anlatır mısınız?',
          order: 4,
          created_at: new Date().toISOString(),
        },
        {
          id: 'q-5',
          interview_id: 'temp-id',
          question_text: '5 yıl sonra kendinizi nerede görüyorsunuz?',
          order: 5,
          created_at: new Date().toISOString(),
        },
      ]

      return NextResponse.json(
        {
          success: true,
          data: { questions: mockQuestions },
        } as ApiResponse,
        { status: 200 }
      )
    }

    // -----------------------------
    // OPENAI CALL
    // -----------------------------
    const completion = await openai.chat.completions.create({
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

    // -----------------------------
    // SAFE PARSE
    // -----------------------------
    let questionTexts: string[] = []

    try {
      const parsed = JSON.parse(content)
      if (Array.isArray(parsed)) {
        questionTexts = parsed
      }
    } catch {
      questionTexts = content
        .split('\n')
        .map(q => q.replace(/^[0-9.\-\s]+/, '').trim())
        .filter(Boolean)
        .slice(0, 5)
    }

    const questions: Question[] = questionTexts.map((text, index) => ({
      id: `q-${index + 1}`,
      interview_id: 'temp-id',
      question_text: text,
      order: index + 1, // ✅ DOĞRU ALAN
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
    console.error('💥 Question generation error:', error)

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
