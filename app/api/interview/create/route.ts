import { NextRequest, NextResponse } from 'next/server'
import { ApiResponse } from '@/lib/types'
import { supabase } from '@/lib/supabase'
import pdf from 'pdf-parse'

export async function POST(request: NextRequest) {
  try {
    // --------------------
    // AUTH
    // --------------------
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Yetkilendirme gerekli' } as ApiResponse,
        { status: 401 }
      )
    }

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

    // --------------------
    // FORM DATA
    // --------------------
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

    // --------------------
    // PDF PARSE
    // --------------------
    const buffer = Buffer.from(await file.arrayBuffer())
    const pdfData = await pdf(buffer)
    const cvText = pdfData.text

    // --------------------
    // QUESTION GENERATION
    // --------------------
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

    // --------------------
    // INTERVIEW INSERT (FIXED)
    // --------------------
    const { data: interviewData, error: interviewError } = await supabase
      .from('interviews')
      .insert(
        [
          {
            user_id: user.id,
            title,
            position,
            cv_text: cvText,
            status: 'in_progress',
          },
        ] as any
      )
      .select()
      .single()

    if (interviewError || !interviewData) {
      throw new Error('Interview kaydedilemedi')
    }

    const interviewId = (interviewData as any).id

    // --------------------
    // QUESTIONS INSERT
    // --------------------
    const questionsToInsert = questionsData.questions.map(
      (q: any, index: number) => ({
        interview_id: interviewId,
        question_text: q.text || q.question_text || q,
        order_num: index + 1,
      })
    )

    const { error: questionsError } = await supabase
      .from('questions')
      .insert(questionsToInsert as any)

    if (questionsError) {
      await supabase.from('interviews').delete().eq('id', interviewId)
      throw new Error('Sorular kaydedilemedi')
    }

    // --------------------
    // RESPONSE
    // --------------------
    return NextResponse.json(
      {
        success: true,
        data: {
          id: interviewId,
          interview: interviewData,
        },
      } as ApiResponse,
      { status: 200 }
    )
  } catch (error) {
    console.error('Create interview error:', error)
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
