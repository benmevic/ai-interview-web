import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@/lib/openai'
import { ApiResponse, CVAnalysis } from '@/lib/types'

/**
 * Analyze CV with OpenAI API endpoint
 * Extracts skills, experience, and education from CV text
 */
export async function POST(request: NextRequest) {
  try {
    const { cvText, position } = await request.json()

    if (!cvText || !position) {
      return NextResponse.json(
        { success: false, error: 'CV text and position are required' } as ApiResponse,
        { status: 400 }
      )
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert HR professional analyzing CVs. Extract key information in a structured format.',
        },
        {
          role: 'user',
          content: `Analyze this CV for a ${position} position and extract:
1. Skills (as array)
2. Experience highlights (as array)
3. Education (as array)
4. Brief summary

CV Text:
${cvText}

Respond in JSON format with keys: skills, experience, education, summary`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    })

    const content = completion.choices[0].message.content || '{}'
    const analysis: CVAnalysis = JSON.parse(content)

    return NextResponse.json({
      success: true,
      data: analysis,
    } as ApiResponse)
  } catch (error) {
    console.error('CV analysis error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to analyze CV' } as ApiResponse,
      { status: 500 }
    )
  }
}
