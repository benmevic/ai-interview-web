import { NextRequest, NextResponse } from 'next/server'
import { openai, getOpenAI } from '@/lib/openai'
import { ApiResponse, Question } from '@/lib/types'

/**
 * Generate interview questions with OpenAI API endpoint
 */
export async function POST(request:  NextRequest) {
  // ✅ BODY'Yİ BAŞTA OKU
  let cvText = ''
  let position = ''

  try {
    const body = await request.json()
    cvText = body.cvText
    position = body.position
  } catch (parseError) {
    console.error('❌ Request body parse error:', parseError)
    return NextResponse.json(
      { success: false, error: 'Invalid request body' } as ApiResponse,
      { status: 400 }
    )
  }

  try {
    // 🔍 DEBUG: Key var mı kontrol et
    const apiKey = process.env.OPENAI_API_KEY
    console.log('🔑 OpenAI Key Check:', {
      exists: !!apiKey,
      prefix: apiKey?.substring(0, 8),
      length: apiKey?.length,
      startsWithSk: apiKey?.startsWith('sk-'),
    })

    // OpenAI client test
    try {
      const testClient = getOpenAI()
      console.log('✅ OpenAI client created successfully')
    } catch (clientErr) {
      console.error('❌ OpenAI client creation failed:', clientErr)
    }

    if (!cvText || !position) {
      return NextResponse.json(
        { success: false, error: 'CV text and position are required' } as ApiResponse,
        { status: 400 }
      )
    }

    // ✅ MOCK SORULAR (OpenAI key yoksa veya hata olursa)
    const useMock = ! process.env.OPENAI_API_KEY

    if (useMock) {
      console.log('⚠️ Using mock questions (no OpenAI key)')

      const mockQuestions: Question[] = [
        {
          id: 'q-1',
          interview_id: 'temp-id',
          question_text: `${position} pozisyonu için en önemli becerileriniz nelerdir?`,
          order_num: 1,
          created_at: new Date().toISOString(),
        },
        {
          id: 'q-2',
          interview_id: 'temp-id',
          question_text: 'Geçmiş projelerinizde karşılaştığınız en büyük zorluk neydi ve nasıl çözdünüz?',
          order_num: 2,
          created_at: new Date().toISOString(),
        },
        {
          id: 'q-3',
          interview_id: 'temp-id',
          question_text: 'Neden bu pozisyona başvurdunuz ve şirketimize neler katabilirsiniz?',
          order_num: 3,
          created_at: new Date().toISOString(),
        },
        {
          id: 'q-4',
          interview_id: 'temp-id',
          question_text: 'Ekip çalışması konusunda bir deneyiminizi detaylı anlatır mısınız?',
          order_num: 4,
          created_at: new Date().toISOString(),
        },
        {
          id: 'q-5',
          interview_id: 'temp-id',
          question_text: 'Kendinizi 5 yıl sonra nerede görüyorsunuz?',
          order_num: 5,
          created_at: new Date().toISOString(),
        },
      ]

      return NextResponse.json({
        success: true,
        data: { questions: mockQuestions },
      } as ApiResponse)
    }

    // ✅ GERÇEK OpenAI çağrısı
    console.log('📡 Calling OpenAI API...')

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages:  [
        {
          role:  'system',
          content: 
            'You are an expert interviewer.  Generate relevant, insightful interview questions based on the candidate\'s CV and the position they are applying for.',
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

Respond with a JSON array of question strings. `,
        },
      ],
      temperature: 0.8,
      max_tokens: 800,
    })

    console.log('✅ OpenAI response received')

    const content = completion.choices[0].message.content || '[]'
    console.log('📝 Generated content:', content)

    const questionTexts:  string[] = JSON.parse(content)

    const questions: Question[] = questionTexts.map((text, index) => ({
      id: `q-${index + 1}`,
      interview_id: 'temp-id',
      question_text: text,
      order_num: index + 1,
      created_at: new Date().toISOString(),
    }))

    console.log('✅ Questions generated:', questions.length)

    return NextResponse.json({
      success: true,
      data:  { questions },
    } as ApiResponse)
  } catch (error) {
    console.error('💥 Question generation error:', error)
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error')

    // ✅ Hata olursa mock dön (body tekrar okuma YOK!)
    console.log('⚠️ Falling back to mock questions due to error')

    const mockQuestions: Question[] = [
      {
        id: 'q-1',
        interview_id: 'temp-id',
        question_text: `${position} pozisyonu için en önemli becerileriniz nelerdir?`,
        order_num: 1,
        created_at: new Date().toISOString(),
      },
      {
        id: 'q-2',
        interview_id: 'temp-id',
        question_text: 'Geçmiş projelerinizde karşılaştığınız en büyük zorluk neydi? ',
        order_num: 2,
        created_at:  new Date().toISOString(),
      },
      {
        id: 'q-3',
        interview_id: 'temp-id',
        question_text: 'Neden bu pozisyona başvurdunuz?',
        order_num: 3,
        created_at: new Date().toISOString(),
      },
      {
        id: 'q-4',
        interview_id:  'temp-id',
        question_text: 'Ekip çalışması konusunda bir deneyiminizi anlatır mısınız?',
        order_num: 4,
        created_at: new Date().toISOString(),
      },
      {
        id: 'q-5',
        interview_id: 'temp-id',
        question_text: '5 yıl sonra kendinizi nerede görüyorsunuz?',
        order_num: 5,
        created_at: new Date().toISOString(),
      },
    ]

    return NextResponse.json({
      success: true,
      data: { questions: mockQuestions },
    } as ApiResponse)
  }
}
