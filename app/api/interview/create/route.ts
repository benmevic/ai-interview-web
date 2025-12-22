import { NextRequest, NextResponse } from 'next/server'
import { ApiResponse } from '@/lib/types'
import { supabase } from '@/lib/supabase'
import pdf from 'pdf-parse'

/* =======================
   TYPES
======================= */
type Interview = {
  id: string
  user_id: string
  title: string
  position: string
  cv_text: string
  status: string
  created_at: string
}

/**
 * Create new interview API endpoint
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Create interview started')

    // Token kontrolü
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Yetkilendirme gerekli' } as ApiResponse,
        { status: 401 }
      )
    }

    // User doğrulama
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz token' } as ApiResponse,
        { status: 401 }
      )
    }

    // Form data al
    const formData = await request.formData()
    const file = formData.get('cv') as File
    const title = formData.get('title') as string
    const position = formData.get('position') as string

    if (!file || !title || !position) {
      return NextResponse.json(
        { success: false, error: 'Eksik alanlar' } as ApiResponse,
        { status: 400 }
      )
    }

    // PDF parse
    const buffer = Buffer.from(await file.arrayBuffer())
    const pdfData = await pdf(buffer)
    const cvText = pdfData.text

    // OpenAI ile soru üret
    const questionsResponse = await fetch(
      `${request.nextUrl.origin}/api/openai/generate-questions`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvText, position }),
      }
    )

    if (!questionsResponse.ok) {
      throw new Error('Soru üretimi başarısız')
    }

    const { data: questionsData } = await questionsResponse.json()

    /* =======================
       INTERVIEW INSERT (FIX)
    ======================= */
    const { data: interview, error: interviewError } = await supabase
      .from('interviews')
      .insert({
        user_id: user.id,
        title,
        position,
        cv_text: cvText,
        status: 'in_progress',
      })
      .select('*')
      .single<Interview>()

    if (interviewError || !interview) {
      throw new Error('Interview kaydedilemedi')
    }

    console.log('✅ Interview saved, ID:', interview.id)

    /* =======================
       QUESTIONS INSERT
    ======================= */
    const questionsToInsert = questionsData.questions.map(
      (q: any, index: number) => ({
        interview_id: interview.id,
        question_text: q.text || q.question_text || q,
        order_num: index + 1,
      })
    )

    const { error: questionsError } = await supabase
      .from('questions')
      .insert(questionsToInsert)

    if (questionsError) {
      await supabase.from('interviews').delete().eq('id', interview.id)
      throw new Error('Sorular kaydedilemedi')
    }

    return NextResponse.json({
      success: true,
      data: {
        id: interview.id,
        interview,
      },
    } as ApiResponse)
  } catch (error) {
    console.error('💥 Create interview error:', error)
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Mülakat oluşturulamadı',
      } as ApiResponse,
      { status: 500 }
    )
  }
}
