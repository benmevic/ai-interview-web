import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Sparkles, Target, TrendingUp, Users } from 'lucide-react'

/**
 * Landing page with hero section, features, and CTA
 */
export default function Home() {
  return (
    <div className="gradient-bg">
      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            <span className="text-gradient">AI-Powered</span>
            <br />
            Interview Practice
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
            Practice your interview skills with AI-generated questions tailored to your CV.
            Get instant feedback and improve your performance.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link href="/register">
              <Button size="lg">Get Started Free</Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Why Choose AI Interview?
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Everything you need to ace your next interview
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <Sparkles className="h-12 w-12 text-primary-600" />
              <CardTitle className="mt-4">AI-Powered Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Get personalized interview questions based on your CV and target position
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Target className="h-12 w-12 text-secondary-600" />
              <CardTitle className="mt-4">Instant Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Receive detailed feedback on your answers with actionable improvement tips
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <TrendingUp className="h-12 w-12 text-primary-600" />
              <CardTitle className="mt-4">Track Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Monitor your improvement over time with detailed analytics and scores
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-12 w-12 text-secondary-600" />
              <CardTitle className="mt-4">Real-World Scenarios</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Practice with questions that mirror actual interview situations
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <Card variant="gradient" className="text-center">
          <CardContent className="py-12">
            <h2 className="text-3xl font-bold text-gray-900">
              Ready to Ace Your Next Interview?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Join thousands of professionals improving their interview skills
            </p>
            <div className="mt-8">
              <Link href="/register">
                <Button size="lg">Start Practicing Now</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
