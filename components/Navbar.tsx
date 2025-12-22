'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { LogOut } from 'lucide-react'
import { supabase } from '@/lib/supabase'

/**
 * Navigation bar component
 */
export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Session kontrolü
    const checkSession = async () => {
      const { data: { session } } = await supabase. auth.getSession()
      setUser(session?. user || null)
    }

    checkSession()

    // Auth state değişikliklerini dinle
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription. unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/')
  }

  return (
    <nav className="border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              AI Mülakat Simülatörü
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors hover:text-primary-600 ${
                pathname === '/' ? 'text-primary-600' :  'text-gray-700'
              }`}
            >
              Ana Sayfa
            </Link>

            {user && (
              <Link
                href="/dashboard"
                className={`text-sm font-medium transition-colors hover:text-primary-600 ${
                  pathname === '/dashboard' ? 'text-primary-600' : 'text-gray-700'
                }`}
              >
                Panel
              </Link>
            )}

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <span className="text-sm text-gray-600">
                    {user.email?. split('@')[0]}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Çıkış
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="outline" size="sm">
                      Giriş Yap
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm">Kayıt Ol</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
