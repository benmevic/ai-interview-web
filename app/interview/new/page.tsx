'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import CVUpload from '@/components/CVUpload'
import { Briefcase } from 'lucide-react'

/**
 * Start new interview page with CV upload and position input
 */
export default function NewInterviewPage() {
  const router = useRouter()
  const [step, setStep] = useState<'details' | 'upload'>('details')
  const [title, setTitle] = useState('')
  const [position, setPosition] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Check authentication
    const session = localStorage.getItem('user_session')
    if (!session) {
      router.push('/login')
    }
  }, [router])

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!title.trim() || !position.trim()) {
      setError('Lütfen tüm alanları doldurun')
      return
    }

    setStep('upload')
  }

  const handleFileUpload = async (file: File) => {
    setIsLoading(true)
    setError('')

    try {
      // Create FormData for file upload
      const formData = new FormData()
      formData.append('cv', file)
      formData.append('title', title)
      formData.append('position', position)

      const response = await fetch('/api/interview/create', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create interview')
      }

      // Redirect to interview page
      router.push(`/interview/${data.data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="gradient-bg flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Mülakatınız oluşturuluyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="gradient-bg min-h-[calc(100vh-4rem)] py-12">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <Briefcase className="mx-auto h-12 w-12 text-primary-600" />
          <h1 className="mt-4 text-3xl font-bold text-gray-900">Yeni Mülakat Başlat</h1>
          <p className="mt-2 text-gray-600">
            {step === 'details'
              ? 'Mülakat olmak istediğiniz pozisyon hakkında bize bilgi verin'
              : 'Kişiselleştirilmiş sorular için CV\'nizi yükleyin'}
          </p>
        </div>

        {step === 'details' ? (
          <Card>
            <CardHeader>
              <CardTitle>Mülakat Detayları</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleDetailsSubmit} className="space-y-4">
                <Input
                  label="Mülakat Başlığı"
                  placeholder="örn., Google Yazılım Mühendisi Mülakatı"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />

                <Input
                  label="Pozisyon"
                  placeholder="örn., Kıdemli Frontend Geliştirici"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  required
                />

                {error && (
                  <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full">
                  CV Yüklemeye Devam Et
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <div>
            <Card className="mb-4">
              <CardContent className="p-6">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Mülakat Başlığı</p>
                  <p className="font-semibold text-gray-900">{title}</p>
                  <p className="text-sm text-gray-600">Pozisyon</p>
                  <p className="font-semibold text-gray-900">{position}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-4"
                  onClick={() => setStep('details')}
                >
                  Detayları Düzenle
                </Button>
              </CardContent>
            </Card>

            <CVUpload onFileUpload={handleFileUpload} />

            {error && (
              <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
