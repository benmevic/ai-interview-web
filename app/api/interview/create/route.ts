import { NextRequest, NextResponse } from 'next/server'
import { ApiResponse, Interview, Question } from '@/lib/types'
import pdf from 'pdf-parse'

/**
 * Create new interview API endpoint
 * Handles CV upload, text extraction, and interview creation
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Create interview started')

    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    console.log('🔐 Token:', token ?  'exists' : 'missing')

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Yetkilendirme gerekli' } as ApiResponse,
        { status: 401 }
      )
    }

    const { data:  { user }, error:  authError } = await supabase.auth.getUser(token)
    
    console.log('👤 User:', user?.email, 'Error:', authError?. message)

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz token' } as ApiResponse,
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('cv') as File
    const title = formData.get('title') as string
    const position = formData.get('position') as string

    console.log('📋 Form data:', { title, position, hasFile: !!file })

    if (!file || !title || !position) {
      return NextResponse.json(
        { success: false, error: 'Eksik alanlar' } as ApiResponse,
        { status: 400 }
      )
    }

    // PDF parse kısmı
    console.log('📄 Parsing PDF...')
    const buffer = Buffer.from(await file.arrayBuffer())
    const pdfData = await pdf(buffer)
    const cvText = pdfData.text
    
    console.log('✅ PDF parsed, text length:', cvText.length)

    // ...  geri kalan kod

  } catch (error) {
    console.error('💥 Create interview error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create interview' } as ApiResponse,
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('cv') as File
    const title = formData.get('title') as string
    const position = formData.get('position') as string

    if (!file || !title || !position) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' } as ApiResponse,
        { status: 400 }
      )
    }

    // Extract text from PDF
    const buffer = Buffer.from(await file.arrayBuffer())
    const pdfData = await pdf(buffer)
    const cvText = pdfData.text

    // Generate interview ID (in a real app, this would be from the database)
    const interviewId = Math.random().toString(36).substring(7)

    // Analyze CV and generate questions (will be done via OpenAI API)
    const analysisResponse = await fetch(
      `${request.nextUrl.origin}/api/openai/analyze-cv`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvText, position }),
      }
    )

    if (!analysisResponse.ok) {
      throw new Error('Failed to analyze CV')
    }

    const questionsResponse = await fetch(
      `${request.nextUrl.origin}/api/openai/generate-questions`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvText, position }),
      }
    )

    if (!questionsResponse.ok) {
      throw new Error('Failed to generate questions')
    }

    const { data: questionsData } = await questionsResponse.json()

    // Create interview object (in a real app, save to database)
    const interview: Interview = {
      id: interviewId,
      user_id: 'user-123', // Would come from auth session
      title,
      position,
      cv_text: cvText,
      status: 'in_progress',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Store in localStorage or database
    // For demo purposes, we'll return the data
    return NextResponse.json({
      success: true,
      data: {
        id: interviewId,
        interview,
        questions: questionsData.questions,
      },
    } as ApiResponse)
  } catch (error) {
    console.error('Create interview error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create interview' } as ApiResponse,
      { status: 500 }
    )
  }
}
