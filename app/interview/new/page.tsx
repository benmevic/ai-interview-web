'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import CVUpload from '@/components/CVUpload'
import { FileText } from 'lucide-react'
import { supabase } from '@/lib/supabase'

/**
 * Create new interview page with CV upload
 */
export default function NewInterviewPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [position, setPosition] = useState('')
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React. FormEvent) => {
    e.preventDefault()
    setError('')

    if (!title || !position) {
      setError('Lütfen tüm alanları doldurun')
      return
    }

    if (! cvFile) {
      setError('Lütfen CV yükleyin')
      return
    }

    try {
      setIsCreating(true)

      console.log('🚀 Creating interview.. .')

      // ✅ Session al
      const { data: { session }, error: sessionError } = await supabase. auth.getSession()

      console.log('🔐 Session:', session)

      if (sessionError || !session) {
        setError('Oturum sonlandı, lütfen tekrar giriş yapın')
        router.push('/login')
        return
      }

      const formData = new FormData()
      formData.append('cv', cvFile)
      formData.append('title', title)
      formData.append('position', position)

      console.log('📤 Sending request to API.. .')

      const response = await fetch('/api/interview/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: formData,
      })

      console.log('📥 Response status:', response.status)

      const data = await response.json()

      console.log('📥 Response data:', data)

      if (! response.ok) {
        throw new Error(data.error || 'Mülakat oluşturulamadı')
      }

      console.log('✅ Interview created!  ID:', data.data.id)

      // Başarılı - Interview sayfasına yönlendir
      router.push(`/interview/${data.data.id}`)
    } catch (err) {
      console.error('❌ Error:', err)
      setError(err instanceof Error ? err.message :  'Bir hata oluştu')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="gradient-bg min-h-[calc(100vh-4rem)] py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg: px-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-primary-600" />
              <CardTitle className="text-2xl">Yeni Mülakat Başlat</CardTitle>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              CV'nizi yükleyin ve kişiselleştirilmiş mülakat sorularınızı alın
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Mülakat Başlığı"
                type="text"
                placeholder="örn: Frontend Developer Mülakatı"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <Input
                label="İş Pozisyonu"
                type="text"
                placeholder="örn:  Senior React Developer"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                required
              />

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  CV Yükle (PDF)
                </label>
                <CVUpload onFileSelect={setCvFile} />
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
                  disabled={isCreating}
                  className="flex-1"
                >
                  İptal
                </Button>
                <Button
                  type="submit"
                  disabled={isCreating || !cvFile}
                  className="flex-1"
                >
                  {isCreating ? 'Oluşturuluyor...' : 'Mülakatı Başlat'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
