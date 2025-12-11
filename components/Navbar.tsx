'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Briefcase, LogOut } from 'lucide-react'
import { useState, useEffect } from 'react'

/**
 * Navigation bar component with authentication state
 */
export default function Navbar() {
  const pathname = usePathname()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    // Check if user is logged in (check localStorage for session)
    const session = localStorage.getItem('user_session')
    setIsLoggedIn(!!session)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('user_session')
    setIsLoggedIn(false)
    window.location.href = '/'
  }

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Briefcase className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              AI Interview
            </span>
          </Link>

          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className={`text-sm font-medium transition-colors hover:text-primary-600 ${
                    pathname === '/dashboard' ? 'text-primary-600' : 'text-gray-700'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/interview/new"
                  className={`text-sm font-medium transition-colors hover:text-primary-600 ${
                    pathname === '/interview/new' ? 'text-primary-600' : 'text-gray-700'
                  }`}
                >
                  New Interview
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
