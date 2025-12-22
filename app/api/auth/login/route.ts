import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { ApiResponse } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    console.log('🔐 Login attempt for:', email)

    if (!email || !password) {
      console.log('❌ Missing email or password')
      return NextResponse.json(
        { success: false, error: 'E-posta ve şifre gerekli' } as ApiResponse,
        { status: 400 }
      )
    }

    console.log('📞 Calling Supabase signInWithPassword...')

    // Sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    console.log('📥 Supabase response:', {
      hasData: !!data,
      hasUser: !!data?.user,
      hasSession: !!data?.session,
      error:  error?.message
    })

    if (error) {
      console.error('❌ Supabase auth error:', error. message)
      return NextResponse. json(
        { success: false, error: error.message } as ApiResponse,
        { status:  401 }
      )
    }

    if (!data. user || !data.session) {
      console.error('❌ No user or session returned')
      return NextResponse.json(
        { success: false, error: 'Giriş başarısız' } as ApiResponse,
        { status: 401 }
      )
    }

    console.log('✅ Login successful for:', data.user.email)

    return NextResponse.json({
      success: true,
      data: {
        id: data. user.id,
        email: data.user.email,
        session: data.session,
      },
    } as ApiResponse)
  } catch (error) {
    console.error('💥 Login error:', error)
    return NextResponse.json(
      { success: false, error:  'Sunucu hatası' } as ApiResponse,
      { status: 500 }
    )
  }
}
