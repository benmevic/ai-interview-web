'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import InterviewCard from '@/components/InterviewCard'
import { Interview } from '@/lib/types'
import { ArrowRight, CheckCircle, Zap, Award } from 'lucide-react'
import { supabase } from '@/lib/supabase'

/**
 * Landing page component
 */
export default function Home() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadRecentInterviews = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('interviews')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(3)

      if (error) throw error

      setInterviews(data || [])
    } catch (error) {
      console.error('Load interviews error:', error)
    }
  }, [])

  const checkAuth = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        setIsAuthenticated(true)
        await loadRecentInterviews(session.user.id)
      }
    } catch (error) {
      console.error('Auth check error:', error)
    } finally {
      setIsLoading(false)
    }
  }, [loadRecentInterviews])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const handleContinueInterview = (id: string) => {
    router.push(`/interview/${id}`)
  }

  const handleDeleteInterview = async (id: string) => {
    try {
      const { error } = await supabase. from('interviews').delete().eq('id', id)

      if (error) throw error

      // Liste yenile
      const {
        data: { session },
      } = await supabase. auth.getSession()
      if (session) {
        await loadRecentInterviews(session.user.id)
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Mülakat silinemedi')
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="gradient-bg">
      {/* Hero Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            AI Destekli
            <span className="block text-primary-600">Mülakat Deneyimi</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            CV&apos;nizi yükleyin, yapay zeka size özel sorular sorsun ve gerçek zamanlı geri
            bildirim alın.  Mülakat becerilerinizi geliştirmenin en akıllı yolu.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            {isAuthenticated ? (
              <>
                <Button onClick={() => router.push('/dashboard')} size="lg">
                  Kontrol Paneline Git
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button onClick={() => router.push('/interview/new')} variant="outline" size="lg">
                  Yeni Mülakat Başlat
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => router.push('/register')} size="lg">
                  Hemen Başla
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button onClick={() => router.push('/login')} variant="outline" size="lg">
                  Giriş Yap
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-20 sm: px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-3xl font-bold text-gray-900">Nasıl Çalışır?</h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <Card variant="gradient">
              <CardContent className="p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-600">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-gray-900">1. CV Yükleyin</h3>
                <p className="mt-4 text-gray-600">
                  PDF formatında CV&apos;nizi yükleyin. Yapay zekamız deneyimlerinizi analiz
                  edecek. 
                </p>
              </CardContent>
            </Card>

            <Card variant="gradient">
              <CardContent className="p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary-600">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-gray-900">2. AI Sorular Sorsun</h3>
                <p className="mt-4 text-gray-600">
                  CV&apos;nize özel, pozisyona uygun sorular otomatik olarak oluşturulur. 
                </p>
              </CardContent>
            </Card>

            <Card variant="gradient">
              <CardContent className="p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-600">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-gray-900">3. Geri Bildirim Alın</h3>
                <p className="mt-4 text-gray-600">
                  Her cevabınız için detaylı puanlama ve gelişim önerileri alın.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Recent Interviews (if authenticated) */}
      {isAuthenticated && interviews.length > 0 && (
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <h2 className="mb-8 text-3xl font-bold text-gray-900">Son Mülakatlarınız</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {interviews.map((interview) => (
                <InterviewCard
                  key={interview.id}
                  interview={interview}
                  onContinue={() => handleContinueInterview(interview.id)}
                  onDelete={() => handleDeleteInterview(interview.id)}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
