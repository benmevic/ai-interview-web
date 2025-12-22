import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@/lib/openai'
import { getServerSupabase } from '@/lib/supabase-server'
import { ApiResponse, Evaluation } from '@/lib/types'

export async function POST(request: NextRequest) {
  let questionId = ''
  let question = ''
  let answer = ''

  try {
    const body = await request.json()
    questionId = body.questionId
    question = body.question
    answer = body.answer
  } catch (parseError) {
    console.error('❌ Request body parse error:', parseError)
    return NextResponse.json(
      { success: false, error:  'Invalid request body' } as ApiResponse,
      { status:  400 }
    )
  }

  try {
    console.log('🧠 Evaluating answer for question:', questionId)

    if (!question || !answer) {
      return NextResponse.json(
        { success: false, error:  'Question and answer are required' } as ApiResponse,
        { status: 400 }
      )
    }

    const useMock = !process.env. OPENAI_API_KEY

    let evaluationResult: {
      score: number
      feedback: string
      strengths: string[]
      improvements: string[]
    }

    if (useMock) {
      console.log('⚠️ Using mock evaluation')

      const answerLength = answer.split(' ').length
      let score = 7
      if (answerLength > 50) score = 9
      else if (answerLength > 30) score = 8
      else if (answerLength < 10) score = 5

      evaluationResult = {
        score,
        feedback: 'Cevabınız genel olarak iyiydi.  Daha spesifik örnekler vererek güçlendirebilirsiniz.',
        strengths: ['Konuya hakim olduğunuz anlaşılıyor', 'Net ifade kullandınız'],
        improvements: ['Daha fazla teknik detay ekleyin', 'Gerçek örneklerle destekleyin'],
      }
    } else {
      console.log('📡 Calling OpenAI for evaluation...')

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert interviewer.  Provide constructive feedback with a score out of 10.',
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

      const content = completion.choices[0].message. content || '{}'
      evaluationResult = JSON.parse(content)
      console.log('✅ OpenAI evaluation received')
    }

    // ✅ SUPABASE'E KAYDET
    try {
      const serverSupabase = getServerSupabase()

      const { error: updateError } = await serverSupabase
        .from('questions')
        .update({
          answer_text:  answer,
          score: evaluationResult.score,
          feedback: evaluationResult.feedback,
        })
        .eq('id', questionId)

      if (updateError) {
        console.error('❌ Question update error:', updateError)
      } else {
        console.log('✅ Answer saved to database')
      }
    } catch (dbError) {
      console.error('⚠️ Database save failed:', dbError)
    }

    return NextResponse.json({
      success: true,
      data: {
        questionId,
        ... evaluationResult,
      },
    } as ApiResponse)
  } catch (error) {
    console.error('💥 Evaluation error:', error)

    // Fallback mock
    const answerLength = answer. split(' ').length
    let score = 7
    if (answerLength > 50) score = 9
    else if (answerLength > 30) score = 8
    else if (answerLength < 10) score = 5

    return NextResponse.json({
      success: true,
      data: {
        questionId,
        score,
        feedback: 'Cevabınız değerlendirildi.',
        strengths: ['Soruyu anladınız'],
        improvements: ['Daha detaylı cevap verin'],
      },
    } as ApiResponse)
  }
}
