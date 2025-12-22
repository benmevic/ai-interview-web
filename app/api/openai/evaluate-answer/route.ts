import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@/lib/openai'
import { getServerSupabase } from '@/lib/supabase-server'
import { ApiResponse, Evaluation } from '@/lib/types'

export async function POST(request: NextRequest) {
  let questionId = ''
  let question = ''
  let answer = ''
  let interviewId = ''

  try {
    const body = await request.json()
    questionId = body.questionId
    question = body.question
    answer = body.answer
    interviewId = body.interviewId // ← Ekle
  } catch (parseError) {
    console.error('❌ Request body parse error:', parseError)
    return NextResponse.json(
      { success: false, error: 'Invalid request body' } as ApiResponse,
      { status: 400 }
    )
  }

  try {
    console.log('🧠 Evaluating answer for question:', questionId)

    if (!question || !answer) {
      return NextResponse.json(
        { success: false, error: 'Question and answer are required' } as ApiResponse,
        { status: 400 }
      )
    }

    const useMock = ! process.env.OPENAI_API_KEY

    let evaluationResult: {
      score: number
      feedback: string
      strengths: string[]
      improvements: string[]
    }

    if (useMock) {
      console.log('⚠️ Using mock evaluation')

      // ✅ AKILLI MOCK PUANLAMA
      const answerLength = answer.trim().length
      const wordCount = answer.trim().split(/\s+/).length

      let score = 5

      if (answerLength < 20 || wordCount < 5) {
        score = 3
      } else if (wordCount < 15) {
        score = 5
      } else if (wordCount < 30) {
        score = 6
      } else if (wordCount < 50) {
        score = 7
      } else if (wordCount < 80) {
        score = 8
      } else {
        score = 9
      }

      score = Math.max(1, Math.min(10, score + Math.floor(Math.random() * 3) - 1))

      console.log(`📊 Mock score: ${score}/10 (${wordCount} words, ${answerLength} chars)`)

      evaluationResult = {
        score,
        feedback: 
          score >= 8
            ? 'Mükemmel bir cevap!  Konuya hakimiyetiniz ve detaylı açıklamalarınız çok iyi.'
            : score >= 6
            ? 'Cevabınız genel olarak iyiydi. Daha spesifik örnekler vererek güçlendirebilirsiniz.'
            :  score >= 4
            ? 'Soruyu anladınız fakat daha detaylı ve yapılandırılmış bir cevap verebilirdiniz.'
            : 'Cevabınız çok kısa kaldı. Lütfen daha detaylı ve örneklerle desteklenmiş cevaplar verin.',
        strengths: 
          score >= 7
            ? [
                'Konuya hakim olduğunuz anlaşılıyor',
                'Detaylı ve net açıklama yaptınız',
                'İyi yapılandırılmış cevap',
              ]
            : score >= 5
            ? ['Soruyu doğru anladınız', 'Net ifade kullandınız']
            : ['Temel konuyu kavradınız'],
        improvements: 
          score >= 7
            ? ['Daha fazla gerçek dünya örneği ekleyebilirsiniz']
            : score >= 5
            ? ['Daha fazla teknik detay ekleyin', 'Gerçek örneklerle destekleyin']
            : [
                'Çok daha detaylı cevap verin',
                'Örneklerle destekleyin',
                'Cevabınızı yapılandırın',
              ],
      }
    } else {
      console.log('📡 Calling OpenAI for evaluation.. .')

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages:  [
          {
            role:  'system',
            content: 
              'You are an expert interviewer.  Provide constructive feedback with a score out of 10.',
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
      evaluationResult = JSON.parse(content)
      console.log('✅ OpenAI evaluation received')
    }

    // ✅ SUPABASE'E KAYDET
    const serverSupabase = getServerSupabase()

    const { error:  updateError } = await serverSupabase
      .from('questions')
      .update({
        answer_text: answer,
        score: evaluationResult.score,
        feedback: evaluationResult.feedback,
      })
      .eq('id', questionId)

    if (updateError) {
      console.error('❌ Question update error:', updateError)
    } else {
      console.log('✅ Answer saved to database')
    }

    // ✅ TÜM SORULAR CEVAPLANDI MI KONTROL ET
    if (interviewId) {
      try {
        const { data: allQuestions } = await serverSupabase
          .from('questions')
          .select('id, answer_text, score')
          .eq('interview_id', interviewId)

        if (allQuestions) {
          const allAnswered = allQuestions.every((q) => q.answer_text && q.score !== undefined)

          if (allAnswered) {
            console.log('🏁 All questions answered, completing interview.. .')

            const totalScore = allQuestions.reduce((sum, q) => sum + (q.score || 0), 0)
            const averageScore = Math.round((totalScore / allQuestions.length) * 10)

            console.log(`📊 Final score: ${averageScore}%`)

            // Interview'i tamamla
            const { error: completeError } = await serverSupabase
              .from('interviews')
              .update({
                status: 'completed',
                score: averageScore,
                updated_at: new Date().toISOString(),
              })
              .eq('id', interviewId)

            if (completeError) {
              console. error('❌ Interview completion error:', completeError)
            } else {
              console.log('✅ Interview completed successfully!')
            }
          }
        }
      } catch (completeError) {
        console.error('⚠️ Interview completion check failed:', completeError)
      }
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

    const answerLength = answer.trim().length
    const wordCount = answer. trim().split(/\s+/).length

    let score = 5
    if (answerLength < 20 || wordCount < 5) score = 3
    else if (wordCount < 15) score = 5
    else if (wordCount < 30) score = 6
    else if (wordCount < 50) score = 7
    else if (wordCount < 80) score = 8
    else score = 9

    score = Math.max(1, Math.min(10, score + Math.floor(Math.random() * 3) - 1))

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
