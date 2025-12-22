import { NextRequest, NextResponse } from 'next/server'
import { ApiResponse } from '@/lib/types'
import { supabase } from '@/lib/supabase'
import pdf from 'pdf-parse'

/**
 * Create new interview API endpoint
 * Handles CV upload, text extraction, and interview creation
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Create interview started')

    // Token kontrolü
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    console.log('🔐 Token:', token ?  'exists' : 'missing')

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Yetkilendirme gerekli' } as ApiResponse,
        { status: 401 }
      )
    }

    // User doğrulama
    const { data: { user }, error:  authError } = await supabase. auth.getUser(token)
    
    console.log('👤 User:', user?.email, 'Error:', authError?. message)

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
    const position = formData. get('position') as string

    console.log('📋 Form data:', { title, position, hasFile: !!file })

    if (!file || !title || ! position) {
      return NextResponse.json(
        { success: false, error: 'Eksik alanlar' } as ApiResponse,
        { status: 400 }
      )
    }

    // PDF parse
    console.log('📄 Parsing PDF...')
    const buffer = Buffer.from(await file.arrayBuffer())
    const pdfData = await pdf(buffer)
    const cvText = pdfData.text
    
    console.log('✅ PDF parsed, text length:', cvText.length)

    // OpenAI ile soru üret
    console.log('🤖 Generating questions...')
    const questionsResponse = await fetch(
      `${request.nextUrl.origin}/api/openai/generate-questions`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON. stringify({ cvText, position }),
      }
    )

    if (!questionsResponse.ok) {
      console.error('❌ Failed to generate questions')
      throw new Error('Soru üretimi başarısız')
    }

    const { data: questionsData } = await questionsResponse.json()
    console.log('✅ Questions generated:', questionsData.questions.length)

    // Interview'ı Supabase'e kaydet
    console.log('💾 Saving interview to database...')
    const { data: interview, error: interviewError } = await supabase
      .from('interviews')
      .insert({
        user_id: user.id,
        title,
        position,
        cv_text: cvText,
        status: 'in_progress',
      }) as any)
      .select()
      .single()

    if (interviewError) {
      console.error('❌ Interview save error:', interviewError)
      throw new Error('Interview kaydedilemedi:  ' + interviewError.message)
    }

    console.log('✅ Interview saved, ID:', interview.id)

    // Soruları Supabase'e kaydet
    console.log('💾 Saving questions to database.. .')
    const questionsToInsert = questionsData.questions.map((q:  any, index: number) => ({
      interview_id: interview.id,
      question_text: q.text || q.question_text || q,
      order_num: index + 1,
    }))

    const { error: questionsError } = await supabase
      .from('questions')
      .insert(questionsToInsert as any)

    if (questionsError) {
      console.error('❌ Questions save error:', questionsError)
      // Rollback:  Interview'ı sil
      await supabase.from('interviews').delete().eq('id', interview.id)
      throw new Error('Sorular kaydedilemedi: ' + questionsError.message)
    }

    console.log('✅ Questions saved!')

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
        error: error instanceof Error ? error.message : 'Mülakat oluşturulamadı',
      } as ApiResponse,
      { status: 500 }
    )
  }
}
