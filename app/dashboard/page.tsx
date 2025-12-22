'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import InterviewCard from '@/components/InterviewCard'
import { Interview } from '@/lib/types'
import { PlusCircle, LogOut } from 'lucide-react'
import { supabase } from '@/lib/supabase'

/**
 * Dashboard page showing user's interviews
 */
export default function DashboardPage() {
  const router = useRouter()
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    loadInterviews()
  }, [])

  const loadInterviews = async () => {
    try {
      setIsLoading(true)
      console.log('🔍 Loading interviews...')

      // Session kontrolü
      const {
        data: { session },
        error:  sessionError,
      } = await supabase.auth.getSession()

      if (sessionError || !session) {
        console.error('❌ No session, redirecting to login')
        router.push('/login')
        return
      }

      console.log('✅ Session found for:', session.user. email)
      setUserEmail(session.user.email || '')

      // Interviews çek
      const { data, error } = await supabase
        .from('interviews')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending:  false })

      if (error) {
        console.error('❌ Interviews fetch error:', error)
        throw error
      }

      console.log('📊 Interviews loaded:', data?.length || 0)
      setInterviews(data || [])
    } catch (err) {
      console.error('💥 Load interviews error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      console.log('🚪 Logging out...')
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('❌ Logout error:', error)
    }
  }

  const handleDeleteInterview = async (id: string) => {
    try {
      console.log('🗑️ Deleting interview:', id)

      const { error } = await supabase. from('interviews').delete().eq('id', id)

      if (error) {
        console.error('❌ Delete error:', error)
        throw error
      }

      console.log('✅ Interview deleted')
      
      // Liste yenile
      await loadInterviews()
    } catch (error) {
      console.error('💥 Delete interview error:', error)
      alert('Mülakat silinemedi')
    }
  }

  const handleContinueInterview = async (id: string) => {
    console.log('▶️ Continuing interview:', id)
    
    // Önce listeyi yenile (son durumu al)
    await loadInterviews()
    
    // Interview bul
    const interview = interviews.find((i) => i.id === id)
    
    if (interview?. status === 'completed') {
      console.log('✅ Interview already completed, viewing results')
      router.push(`/interview/${id}`)
    } else {
      console.log('🔄 Interview in progress, continuing')
      router.push(`/interview/${id}`)
    }
  }

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
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg: px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Kontrol Paneli</h1>
            <p className="mt-2 text-gray-600">Hoş geldiniz, {userEmail}</p>
          </div>
          <div className="flex space-x-4">
            <Button onClick={() => router.push('/interview/new')} className="flex items-center">
              <PlusCircle className="mr-2 h-5 w-5" />
              Yeni Mülakat
            </Button>
            <Button onClick={handleLogout} variant="outline" className="flex items-center">
              <LogOut className="mr-2 h-5 w-5" />
              Çıkış
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">
                Toplam Mülakat
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-900">{interviews.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Tamamlanan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">
                {interviews.filter((i) => i.status === 'completed').length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Devam Eden</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">
                {interviews. filter((i) => i.status === 'in_progress').length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Ortalama Puan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary-600">
                {interviews.filter((i) => i.score).length > 0
                  ? Math.round(
                      interviews
                        .filter((i) => i.score)
                        . reduce((sum, i) => sum + (i.score || 0), 0) /
                        interviews.filter((i) => i.score).length
                    )
                  : 0}
                %
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Interviews List */}
        <div>
          <h2 className="mb-6 text-2xl font-bold text-gray-900">Mülakatlarım</h2>

          {interviews.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-gray-600">Henüz mülakat oluşturmadınız</p>
                <Button
                  onClick={() => router.push('/interview/new')}
                  className="mt-4 flex items-center"
                >
                  <PlusCircle className="mr-2 h-5 w-5" />
                  İlk Mülakatınızı Oluşturun
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {interviews.map((interview) => (
                <InterviewCard
                  key={interview.id}
                  interview={interview}
                  onContinue={() => handleContinueInterview(interview.id)}
                  onDelete={() => handleDeleteInterview(interview.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
