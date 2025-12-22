import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getServerSupabase } from '@/lib/supabase-server'
import { ApiResponse, Interview, Question } from '@/lib/types'

/**
 * Get interview details API endpoint
 * Returns interview data and associated questions
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const interviewId = params.id

    console.log('📥 Fetching interview:', interviewId)

    // ---------- AUTH ----------
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token gerekli' } as ApiResponse,
        { status: 401 }
      )
    }

    // User doğrulama
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

    // ---------- FETCH INTERVIEW (Server Supabase) ----------
    const serverSupabase = getServerSupabase()

    const { data:  interview, error: interviewError } = await serverSupabase
      . from('interviews')
      .select('*')
      .eq('id', interviewId)
      .eq('user_id', user.id) // Sadece kendi mülakatını görebilir
      .single()

    if (interviewError || !interview) {
      console.error('❌ Interview not found:', interviewError)
      return NextResponse.json(
        { success: false, error: 'Mülakat bulunamadı' } as ApiResponse,
        { status: 404 }
      )
    }

    console.log('✅ Interview found:', interview.id)

    // ---------- FETCH QUESTIONS ----------
    const { data: questions, error: questionsError } = await serverSupabase
      .from('questions')
      .select('*')
      .eq('interview_id', interviewId)
      .order('order_num', { ascending: true })

    if (questionsError) {
      console.error('❌ Questions fetch error:', questionsError)
      // Continue without questions
    }

    console.log('✅ Questions fetched:', questions?. length || 0)

    return NextResponse.json({
      success: true,
      data: {
        interview,
        questions:  questions || [],
      },
    } as ApiResponse)
  } catch (error) {
    console.error('💥 Get interview error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Mülakat yüklenemedi',
      } as ApiResponse,
      { status: 500 }
    )
  }
}
