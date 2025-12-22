'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { LogIn } from 'lucide-react'
import { supabase } from '@/lib/supabase'

/**
 * Login page with email/password authentication
 */
export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e:  React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    console.log('🚀 Login started for:', email)

    try {
      // ✅ Direkt Supabase kullan (API route değil)
      const { data, error:  signInError } = await supabase. auth.signInWithPassword({
        email,
        password,
      })

      console.log('📥 Supabase response:', { data, error: signInError })

      if (signInError) {
        throw new Error(signInError. message || 'Giriş başarısız')
      }

      if (! data.session) {
        throw new Error('Oturum oluşturulamadı')
      }

      console.log('✅ Login successful, session set!')

      // Direkt yönlendir
      window.location.href = '/dashboard'
    } catch (err) {
      console.error('❌ Login error:', err)
      setError(err instanceof Error ? err.message :  'Bir hata oluştu')
      setIsLoading(false)
    }
  }

  return (
    <div className="gradient-bg flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <LogIn className="mx-auto h-12 w-12 text-primary-600" />
            <CardTitle className="mt-4 text-2xl">Tekrar Hoş Geldiniz</CardTitle>
            <p className="mt-2 text-sm text-gray-600">
              Mülakat pratiğinize devam etmek için giriş yapın
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="E-posta"
                type="email"
                placeholder="ornek@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                label="Şifre"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target. value)}
                required
              />

              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Hesabınız yok mu? {' '}
                <Link href="/register" className="font-medium text-primary-600 hover:text-primary-700">
                  Kayıt Ol
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
