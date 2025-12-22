'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import InterviewCard from '@/components/InterviewCard'
import { Interview } from '@/lib/types'
import { Plus, TrendingUp } from 'lucide-react'
import { supabase } from '@/lib/supabase'

/**
 * Dashboard page showing user's interview history and statistics
 */
export default function DashboardPage() {
  const router = useRouter()
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Check authentication
    const session = localStorage.getItem('user_session')
    if (!session) {
      router.push('/login')
      return
    }

    const userData = JSON.parse(session)
    setUser(userData)

    // Fetch interviews (mock data for now)
   // ✅ YENİ KOD
const fetchInterviews = async () => {
  try {
    // Supabase session kontrolü
    const { data: { session }, error:  sessionError } = await supabase. auth.getSession()
    
    if (sessionError || !session) {
      router.push('/login')
      return
    }

    setUser(session.user)

    // Gerçek interview'ları çek
    const { data: interviewsData, error: interviewsError } = await supabase
      .from('interviews')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending:  false })

    if (interviewsError) {
      console.error('Interviews fetch error:', interviewsError)
      setInterviews([])
    } else {
      setInterviews(interviewsData || [])
    }
  } catch (error) {
    console.error('Error:', error)
  } finally {
    setIsLoading(false)
  }
}

fetchInterviews()

  const completedInterviews = interviews.filter((i) => i.status === 'completed')
  const averageScore =
    completedInterviews.length > 0
      ? Math.round(
          completedInterviews.reduce((sum, i) => sum + (i.score || 0), 0) /
            completedInterviews.length
        )
      : 0

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="gradient-bg min-h-[calc(100vh-4rem)] py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Tekrar hoş geldiniz{user?.email ? `, ${user.email.split('@')[0]}` : ''}!
          </h1>
          <p className="mt-2 text-gray-600">Mülakat ilerlemenizi takip edin ve yeni pratik oturumları başlatın</p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Toplam Mülakatlar</p>
                <p className="mt-1 text-3xl font-bold text-gray-900">{interviews.length}</p>
              </div>
              <div className="rounded-full bg-primary-100 p-3">
                <TrendingUp className="h-6 w-6 text-primary-600" />
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tamamlanan</p>
                <p className="mt-1 text-3xl font-bold text-gray-900">{completedInterviews.length}</p>
              </div>
              <div className="rounded-full bg-green-100 p-3">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ortalama Puan</p>
                <p className="mt-1 text-3xl font-bold text-gray-900">{averageScore}%</p>
              </div>
              <div className="rounded-full bg-secondary-100 p-3">
                <TrendingUp className="h-6 w-6 text-secondary-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mb-8">
          <Link href="/interview/new">
            <Button size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Yeni Mülakat Başlat
            </Button>
          </Link>
        </div>

        {/* Interview History */}
        <div>
          <h2 className="mb-6 text-2xl font-bold text-gray-900">Son Mülakatlar</h2>
          {interviews.length === 0 ? (
            <div className="rounded-xl bg-white p-12 text-center shadow-lg">
              <p className="text-gray-600">Henüz mülakat yok. İlk pratik oturumunuzu başlatın!</p>
              <Link href="/interview/new">
                <Button className="mt-4">
                  <Plus className="mr-2 h-5 w-5" />
                  Mülakat Başlat
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {interviews.map((interview) => (
                <InterviewCard key={interview.id} interview={interview} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
