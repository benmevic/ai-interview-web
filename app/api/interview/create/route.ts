import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { ApiResponse } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    // 🔐 Authorization header al
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token yok' } as ApiResponse,
        { status: 401 }
      )
    }

    // 🔥 TOKEN İLE SERVER SUPABASE CLIENT
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    )

    const { title, position, cvText } = await request.json()

    if (!title || !position || !cvText) {
      return NextResponse.json(
        { success: false, error: 'Eksik alanlar' } as ApiResponse,
        { status: 400 }
      )
    }

    // 👤 User artık GERÇEKTEN geliyor
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Yetkisiz kullanıcı' } as ApiResponse,
        { status: 401 }
      )
    }

    // 💾 Interview insert
    const { data: interview, error: insertError } = await supabase
      .from('interviews')
      .insert(
        {
          user_id: user.id,
          title,
          position,
          cv_text: cvText,
          status: 'pending',
        } as any
      )
      .select()
      .single()

    if (insertError) {
      console.error('❌ Insert error:', insertError)
      throw insertError
    }

    return NextResponse.json(
      {
        success: true,
        data: { interview },
      } as ApiResponse,
      { status: 200 }
    )
  } catch (error) {
    console.error('💥 API Error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Interview oluşturulamadı',
      } as ApiResponse,
      { status: 500 }
    )
  }
}
