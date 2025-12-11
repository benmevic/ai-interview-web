import Link from 'next/link'
import { Github, Twitter, Linkedin } from 'lucide-react'

/**
 * Footer component with links and social media
 */
export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">AI Interview</h3>
            <p className="mt-2 text-sm text-gray-600">
              Practice your interview skills with AI-powered feedback and personalized questions.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900">Quick Links</h3>
            <ul className="mt-2 space-y-2">
              <li>
                <Link href="/dashboard" className="text-sm text-gray-600 hover:text-primary-600">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/interview/new" className="text-sm text-gray-600 hover:text-primary-600">
                  Start Interview
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-sm text-gray-600 hover:text-primary-600">
                  Login
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900">Connect</h3>
            <div className="mt-2 flex space-x-4">
              <a href="#" className="text-gray-600 hover:text-primary-600">
                <Github className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-600 hover:text-primary-600">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-600 hover:text-primary-600">
                <Linkedin className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-8 text-center">
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} AI Interview. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
