/**
 * User type definition
 */
export interface User {
  id: string
  email: string
  created_at: string
}

/**
 * Interview type definition
 */
export interface Interview {
  id: string
  user_id: string
  title: string
  position: string
  cv_text?: string
  status: 'pending' | 'in_progress' | 'completed'
  score?: number
  created_at: string
  updated_at: string
}

/**
 * Question type definition
 */

export interface Question {
  id: string
  interview_id: string
  question_text:  string
  order_num: number  // ← 'order' yerine 'order_num'
  answer_text?: string
  score?: number
  feedback?:  string
  created_at: string
}

/**
 * CV Analysis result from OpenAI
 */
export interface CVAnalysis {
  skills: string[]
  experience: string[]
  education: string[]
  summary: string
}

/**
 * Interview evaluation result
 */
export interface Evaluation {
  score: number
  feedback: string
  strengths: string[]
  improvements: string[]
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}
