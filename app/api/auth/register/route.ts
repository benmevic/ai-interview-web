import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { ApiResponse } from '@/lib/types'

/**
 * Registration API endpoint
 * Creates a new user with email and password
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' } as ApiResponse,
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' } as ApiResponse,
        { status: 400 }
      )
    }

    // Sign up with Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message } as ApiResponse,
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: data.user?.id,
        email: data.user?.email,
        session: data.session,
      },
    } as ApiResponse)
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' } as ApiResponse,
      { status: 500 }
    )
  }
}
