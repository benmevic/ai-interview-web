import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@/lib/openai'
import { getServerSupabase } from '@/lib/supabase-server'
import { ApiResponse, Evaluation } from '@/lib/types'

export async function POST(request: NextRequest) {
  // ✅ 1. ÖNCE KEY VAR MI BAK
  const openaiKey = process.env.OPENAI_API_KEY

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🔑 OPENAI KEY CHECK: ')
  console.log('  - Exists:', !!openaiKey)
  console.log('  - Length:', openaiKey?. length || 0)
  console.log('  - Starts with sk-:', openaiKey?.startsWith('sk-'))
  console.log('  - First 25 chars:', openaiKey?.substring(0, 25))
  console.log('  - Will use MOCK?', ! openaiKey)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  let questionId = ''
  let question = ''
  let answer = ''
  let interviewId = ''

  try {
    const body = await request.json()
    questionId = body.questionId
    question = body.question
    answer = body.answer
    interviewId = body.interviewId
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

    const useMock = !process.env. OPENAI_API_KEY

    let evaluationResult:  {
      score: number
      feedback: string
      strengths: string[]
      improvements: string[]
    }

    if (useMock) {
      console.log('⚠️ Using mock evaluation (NO OPENAI KEY)')

      // ✅ SIKI MOCK PUANLAMA
      const answerTrimmed = answer.trim()
      const answerLength = answerTrimmed.length
      const wordCount = answerTrimmed.split(/\s+/).filter((w) => w.length > 0).length

      const meaningfulWords = answerTrimmed
        .split(/\s+/)
        .filter((w) => /[a-zA-ZğüşıöçĞÜŞİÖÇ]{2,}/.test(w))
      const meaningfulWordCount = meaningfulWords.length

      console.log(`📊 Answer analysis:`, {
        length: answerLength,
        words: wordCount,
        meaningfulWords: meaningfulWordCount,
        preview: answerTrimmed.substring(0, 50),
      })

      let score = 1

      if (answerLength < 10 || meaningfulWordCount < 3) {
        score = 1
      } else if (answerLength < 30 || meaningfulWordCount < 8) {
        score = 2
      } else if (answerLength < 60 || meaningfulWordCount < 15) {
        score = 3
      } else if (answerLength < 100 || meaningfulWordCount < 25) {
        score = 5
      } else if (answerLength < 200 || meaningfulWordCount < 40) {
        score = 7
      } else if (answerLength < 350 || meaningfulWordCount < 60) {
        score = 8
      } else {
        score = 9
      }

      const variation = Math.random() > 0.5 ? 0 : Math.random() > 0.5 ? 1 : -1
      score = Math.max(1, Math.min(10, score + variation))

      console.log(`📊 Final mock score: ${score}/10`)

      evaluationResult = {
        score,
        feedback: 
          score >= 8
            ? 'Mükemmel bir cevap!  Konuya hakimiyetiniz ve detaylı açıklamalarınız çok iyi.'
            : score >= 6
            ? 'Cevabınız genel olarak iyiydi.  Daha spesifik örnekler vererek güçlendirebilirsiniz.'
            :  score >= 4
            ? 'Soruyu anladınız fakat daha detaylı ve yapılandırılmış bir cevap verebilirdiniz.'
            : score >= 2
            ? 'Cevabınız çok kısa ve yüzeysel kaldı. Lütfen daha detaylı ve örneklerle desteklenmiş cevaplar verin.'
            : 'Cevabınız yetersiz. Soruyu ciddiye alıp detaylı, yapılandırılmış bir cevap vermeniz bekleniyor.',
        strengths: 
          score >= 7
            ? [
                'Konuya hakim olduğunuz anlaşılıyor',
                'Detaylı ve net açıklama yaptınız',
                'İyi yapılandırılmış cevap',
              ]
            : score >= 5
            ? ['Soruyu doğru anladınız', 'Temel bilgileri verdiniz']
            : score >= 3
            ? ['Soruya cevap vermeye çalıştınız']
            : ['Temel düzeyde yanıt verdiniz'],
        improvements: 
          score >= 7
            ? [
                'Daha fazla gerçek dünya örneği ekleyebilirsiniz',
                'Teknik derinliği artırabilirsiniz',
              ]
            : score >= 5
            ? ['Daha fazla detay ekleyin', 'Gerçek örneklerle destekleyin', 'Cevabınızı genişletin']
            : score >= 3
            ? [
                'Çok daha detaylı cevap verin',
                'Örneklerle destekleyin',
                'Cevabınızı yapılandırın',
                'En az 100-150 kelime yazın',
              ]
            :  [
                'Soruyu ciddiye alın',
                'Detaylı, anlamlı cevaplar verin',
                'En az 100-150 kelime kullanın',
                'Deneyimlerinizden örnekler paylaşın',
              ],
      }
    } else {
      console.log('📡 Calling OpenAI API for evaluation...')

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages:  [
          {
            role:  'system',
            content: 
              'You are an expert interviewer.  Provide constructive feedback with a score out of 10. Be strict:  answers shorter than 50 words should get maximum 3/10. Answers with no real content (like "q", "test", random characters) should get 1/10.',
          },
          {
            role: 'user',
            content: `Evaluate this interview answer: 

Question: ${question}

Answer: ${answer}

Provide: 
1. Score (0-10) - BE STRICT, short or meaningless answers get 1-3/10
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
      console.log('✅ OpenAI evaluation received:', evaluationResult)
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

            const { error:  completeError } = await serverSupabase
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
    const meaningfulWords = answer
      .trim()
      .split(/\s+/)
      .filter((w) => /[a-zA-ZğüşıöçĞÜŞİÖÇ]{2,}/.test(w))

    let score = 1
    if (answerLength < 10 || meaningfulWords.length < 3) score = 1
    else if (answerLength < 30 || meaningfulWords.length < 8) score = 2
    else if (answerLength < 60 || meaningfulWords.length < 15) score = 3
    else if (answerLength < 100 || meaningfulWords. length < 25) score = 5
    else if (answerLength < 200 || meaningfulWords.length < 40) score = 7
    else score = 8

    return NextResponse.json({
      success: true,
      data: {
        questionId,
        score,
        feedback: 'Cevabınız değerlendirildi.',
        strengths: ['Cevap verdiniz'],
        improvements: ['Daha detaylı cevap verin', 'En az 100-150 kelime kullanın'],
      },
    } as ApiResponse)
  }
}
