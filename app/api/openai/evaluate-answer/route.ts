import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@/lib/openai'
import { ApiResponse, Evaluation } from '@/lib/types'

/**
 * Evaluate answer with OpenAI API endpoint
 * Analyzes user's answer and provides score and feedback
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🧠 Evaluating answer...')

    const { questionId, question, answer } = await request.json()

    console.log('📝 Evaluation request:', {
      questionId,
      questionLength: question?. length,
      answerLength: answer?.length,
    })

    if (!question || !answer) {
      return NextResponse.json(
        { success: false, error: 'Question and answer are required' } as ApiResponse,
        { status: 400 }
      )
    }

    // ✅ GEÇICI:  Mock evaluation (OpenAI key yoksa)
    if (!process.env.OPENAI_API_KEY) {
      console.log('⚠️ Using mock evaluation (no OpenAI key)')

      const mockEvaluation = {
        score: Math.floor(Math.random() * 3) + 7, // 7-9 arası random
        feedback: 
          'Cevabınız genel olarak iyiydi.  Daha spesifik örnekler vererek cevabınızı güçlendirebilirsiniz.',
        strengths: [
          'Konuya hakim olduğunuz anlaşılıyor',
          'Net ve anlaşılır ifade ettiniz',
        ],
        improvements: [
          'Daha fazla teknik detay ekleyebilirsiniz',
          'Gerçek dünya örnekleri ile destekleyebilirsiniz',
        ],
      }

      return NextResponse.json({
        success: true,
        data: {
          questionId,
          ... mockEvaluation,
        },
      } as ApiResponse)
    }

    // ✅ GERÇEK OpenAI çağrısı
    console.log('📡 Calling OpenAI for evaluation...')

    const completion = await openai. chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert interviewer evaluating candidate responses. Provide constructive feedback with a score out of 10.',
        },
        {
          role:  'user',
          content:  `Evaluate this interview answer:

Question: ${question}

Answer:  ${answer}

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

    console.log('✅ OpenAI evaluation received')

    const content = completion. choices[0].message.content || '{}'
    console.log('📝 Evaluation content:', content)

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
    console.error('💥 Answer evaluation error:', error)
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown')

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to evaluate answer',
      } as ApiResponse,
      { status: 500 }
    )
  }
}
