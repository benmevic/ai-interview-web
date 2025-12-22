'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { LogIn } from 'lucide-react'

/**
 * Login page with email/password authentication
 */
export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React. FormEvent) => {
  e.preventDefault()
  setError('')
  setIsLoading(true)

  try {
    const response = await fetch('/api/auth/login', {
      method:  'POST',
      headers:  { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (! response.ok) {
      throw new Error(data.error || 'Login failed')
    }

    // ❌ KALDIR: localStorage. setItem('user_session', JSON.stringify(data.data))
    
    // ✅ Direkt yönlendir (Supabase session otomatik set ediyor)
    router.push('/dashboard')
  } catch (err) {
    setError(err instanceof Error ? err.message : 'An error occurred')
  } finally {
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
                onChange={(e) => setPassword(e.target.value)}
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
                Hesabınız yok mu?{' '}
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
