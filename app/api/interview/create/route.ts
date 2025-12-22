import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ApiResponse } from '@/lib/types'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()

    // -----------------------------
    // AUTH
    // -----------------------------
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' } as ApiResponse,
        { status: 401 }
      )
    }

    // -----------------------------
    // BODY
    // -----------------------------
    const { title, position, questions } = await req.json()

    if (!title || !position || !questions?.length) {
      return NextResponse.json(
        { success: false, error: 'Eksik veri' } as ApiResponse,
        { status: 400 }
      )
    }

    // -----------------------------
    // CREATE INTERVIEW
    // -----------------------------
    const { data: interview, error: interviewError } = await supabase
      .from('interviews')
      .insert({
        user_id: user.id,
        title,
        position,
      })
      .select()
      .single()

    if (interviewError) {
      console.error('❌ Interview insert error:', interviewError)
      throw interviewError
    }

    // -----------------------------
    // INSERT QUESTIONS
    // -----------------------------
    const questionRows = questions.map((q: any) => ({
      interview_id: interview.id,
      question_text: q.question_text,
      order_num: q.order, // 🔥 KRİTİK SATIR
    }))

    const { error: questionsError } = await supabase
      .from('questions')
      .insert(questionRows)

    if (questionsError) {
      console.error('❌ Question insert error:', questionsError)
      throw questionsError
    }

    return NextResponse.json(
      {
        success: true,
        data: { interviewId: interview.id },
      } as ApiResponse,
      { status: 201 }
    )
  } catch (error) {
    console.error('💥 Interview create error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Soru üretimi başarısız',
      } as ApiResponse,
      { status: 500 }
    )
  }
}
