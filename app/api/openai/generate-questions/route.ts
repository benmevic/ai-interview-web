import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@/lib/openai'
import { ApiResponse, Question } from '@/lib/types'

/**
 * Generate interview questions with OpenAI API endpoint
 */


export async function POST(request: NextRequest) {
  try {
    // 🔍 EXTREME DEBUG
    const apiKey = process.env.OPENAI_API_KEY
    console.log('🔑 OpenAI Key Check:', {
      exists: !!apiKey,
      prefix: apiKey?. substring(0, 8),
      length: apiKey?. length,
      startsWithSk: apiKey?.startsWith('sk-'),
    })

    // OpenAI client oluşturmayı test et
    try {
      const testClient = new OpenAI({ apiKey: apiKey || '' })
      console.log('✅ OpenAI client created successfully')
    } catch (clientErr) {
      console.error('❌ OpenAI client creation failed:', clientErr)
    }

    const { cvText, position } = await request.json()
    

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
