import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import pdf from 'pdf-parse'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Creating interview')

    // ---------------- AUTH ----------------
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ success: false, error: 'No token' }, { status: 401 })
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 })
    }

    // ---------------- FORM ----------------
    const formData = await request.formData()
    const file = formData.get('cv') as File
    const title = formData.get('title') as string
    const position = formData.get('position') as string

    if (!file || !title || !position) {
      return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 })
    }

    // ---------------- PDF ----------------
    const buffer = Buffer.from(await file.arrayBuffer())
    const pdfData = await pdf(buffer)
    const cvText = pdfData.text

    // ---------------- INTERVIEW INSERT ----------------
    const { data: interview, error: interviewError } = await supabase
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

    if (interviewError || !interview) {
      console.error('❌ Interview insert error:', interviewError)
      return NextResponse.json({ success: false, error: 'Interview insert failed' }, { status: 500 })
    }

    const interviewId = (interview as any).id
    console.log('✅ Interview created:', interviewId)

    // ---------------- QUESTIONS (FAIL SAFE) ----------------
    let questions: any[] = []

    try {
      const res = await fetch(
        `${request.nextUrl.origin}/api/openai/generate-questions`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cvText, position }),
        }
      )

      const result = await res.json()
      console.log('🧠 OpenAI response:', result)

      if (res.ok && result?.data?.questions) {
        questions = result.data.questions
      }
    } catch (err) {
      console.error('⚠️ Question generation failed:', err)
    }

    // ---------------- QUESTIONS INSERT ----------------
    if (questions.length > 0) {
      const questionsToInsert = questions.map((q: any, i: number) => ({
        interview_id: interviewId,
        question_text: q.question_text ?? q,
        order_num: i + 1,
      }))

      const { error: qErr } = await supabase
        .from('questions')
        .insert(questionsToInsert as any)

      if (qErr) {
        console.error('❌ Question insert error:', qErr)
      }
    }

    // ---------------- RESPONSE ----------------
    return NextResponse.json({
      success: true,
      data: {
        interview_id: interviewId,
        questions_created: questions.length,
      },
    })
  } catch (err) {
    console.error('💥 Create interview crashed:', err)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
