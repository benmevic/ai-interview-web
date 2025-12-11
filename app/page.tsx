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
            <span className="text-gradient">Yapay Zeka Destekli</span>
            <br />
            Mülakat Pratiği
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
            CV&apos;nize özel hazırlanmış yapay zeka sorularıyla mülakat becerilerinizi geliştirin.
            Anında geri bildirim alın ve performansınızı artırın.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link href="/register">
              <Button size="lg">Ücretsiz Başlayın</Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg">
                Giriş Yap
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Neden AI Mülakat Simülatörü?
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Bir sonraki mülakatınızı kazanmak için ihtiyacınız olan her şey
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <Sparkles className="h-12 w-12 text-primary-600" />
              <CardTitle className="mt-4">Yapay Zeka Destekli Sorular</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                CV&apos;nize ve hedef pozisyonunuza göre kişiselleştirilmiş mülakat soruları alın
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Target className="h-12 w-12 text-secondary-600" />
              <CardTitle className="mt-4">Anında Geri Bildirim</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Cevaplarınız için uygulanabilir iyileştirme önerileriyle detaylı geri bildirim alın
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <TrendingUp className="h-12 w-12 text-primary-600" />
              <CardTitle className="mt-4">İlerleme Takibi</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Detaylı analitikler ve puanlarla zaman içindeki gelişiminizi izleyin
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-12 w-12 text-secondary-600" />
              <CardTitle className="mt-4">Gerçek Senaryolar</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Gerçek mülakat durumlarını yansıtan sorularla pratik yapın
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
              Bir Sonraki Mülakatınızı Kazanmaya Hazır mısınız?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Mülakat becerilerini geliştiren binlerce profesyonele katılın
            </p>
            <div className="mt-8">
              <Link href="/register">
                <Button size="lg">Şimdi Pratik Yapmaya Başlayın</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
