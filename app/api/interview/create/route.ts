import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { ApiResponse } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const { title, position, cvText } = await request.json()

    if (!title || !position || !cvText) {
      return NextResponse.json(
        { success: false, error: 'Eksik alanlar var' } as ApiResponse,
        { status: 400 }
      )
    }

    // 🔐 Auth user al
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Yetkisiz' } as ApiResponse,
        { status: 401 }
      )
    }

    // 🧠 Interview oluştur
    const { data: interview, error: interviewError } = await supabase
      .from('interviews')
      .insert({
        user_id: user.id,
        title,
        position,
        cv_text: cvText,
        status: 'pending',
      })
      .select()
      .single()

    if (interviewError) {
      console.error('❌ Interview insert error:', interviewError)
      throw interviewError
    }

    return NextResponse.json(
      {
        success: true,
        data: { interview },
      } as ApiResponse,
      { status: 200 }
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
