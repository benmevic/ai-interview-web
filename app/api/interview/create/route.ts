import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getServerSupabase } from '@/lib/supabase-server'
import { ApiResponse } from '@/lib/types'
import pdf from 'pdf-parse'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Interview create started')

    // ---------- AUTH ----------
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token gerekli' } as ApiResponse,
        { status: 401 }
      )
    }

    const {
      data: { user },
      error:  authError,
    } = await supabase.auth.getUser(token)

    if (authError || !user) {
      console.error('❌ Auth error:', authError)
      return NextResponse.json(
        { success: false, error: 'Geçersiz token' } as ApiResponse,
        { status: 401 }
      )
    }

    console.log('✅ User authenticated:', user.email)

    // ---------- FORM DATA ----------
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

    console.log('📋 Form data received:', { title, position, fileName: file.name })

    // ---------- PDF PARSE ----------
    console.log('📄 Parsing PDF...')
    const buffer = Buffer.from(await file.arrayBuffer())
    const pdfData = await pdf(buffer)
    const cvText = pdfData.text

    console.log('✅ PDF parsed, text length:', cvText.length)

    // ---------- INTERVIEW INSERT (SERVER SUPABASE) ----------
    console.log('💾 Inserting interview...')
    const serverSupabase = getServerSupabase()

    const { data: interview, error:  interviewError } = await serverSupabase
      .from('interviews')
      .insert({
        user_id: user.id,
        title,
        position,
        cv_text: cvText,
        status: 'in_progress',
      })
      .select()
      .single()

    if (interviewError || !interview) {
      console.error('❌ Interview insert error:', interviewError)
      throw new Error('Interview insert failed:  ' + interviewError?.message)
    }

    const interviewId = (interview as any).id
    console.log('✅ Interview created:', interviewId)

    // ---------- GENERATE QUESTIONS ----------
    let questions: any[] = []

    try {
      console.log('🤖 Generating questions...')
      const questionsRes = await fetch(
        `${request.nextUrl.origin}/api/openai/generate-questions`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cvText, position }),
        }
      )

      const questionsResult = await questionsRes.json()
      console.log('📥 Questions response:', questionsResult)

      if (questionsRes.ok && questionsResult?. data?.questions) {
        questions = questionsResult.data.questions
        console.log('✅ Questions generated:', questions.length)
      } else {
        console.warn('⚠️ Question generation failed, using empty array')
      }
    } catch (err) {
      console.error('⚠️ Question generation error:', err)
    }

    // ---------- INSERT QUESTIONS (SERVER SUPABASE) ----------
    if (questions.length > 0) {
      console.log('💾 Inserting questions...')
      const questionsToInsert = questions.map((q: any, index: number) => ({
        interview_id: interviewId,
        question_text: q.question_text || q.text || String(q),
        order_num: index + 1,
      }))

      const { error:  questionsError } = await serverSupabase
        .from('questions')
        .insert(questionsToInsert)

      if (questionsError) {
        console.error('❌ Questions insert error:', questionsError)
      } else {
        console.log('✅ Questions inserted:', questions.length)
      }
    }

    // ---------- RESPONSE ----------
    return NextResponse.json({
      success: true,
      data: {
        id: interviewId,
        interview,
        questions_count: questions.length,
      },
    } as ApiResponse)
  } catch (error) {
    console.error('💥 Create interview error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Interview oluşturulamadı',
      } as ApiResponse,
      { status: 500 }
    )
  }
}
