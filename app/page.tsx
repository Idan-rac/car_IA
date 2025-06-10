"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Upload, LinkIcon, Smartphone, Globe, Shield } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { LanguageToggle } from "@/components/language-toggle"

export default function HomePage() {
  const { t, isRTL } = useLanguage()
  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 ${isRTL ? "rtl" : "ltr"}`}>
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">CarCheck</span>
          </div>
          <div className="flex items-center space-x-4">
            <LanguageToggle />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            {t("home.title")}
            <span className="text-blue-600">{t("home.titleHighlight")}</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">{t("home.subtitle")}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/evaluate">
              <Button size="lg" className="text-lg px-8 py-6">
                {t("home.startEvaluation")}
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6">
              {t("home.learnMore")}
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">{t("home.howItWorks")}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>{t("home.uploadData")}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{t("home.uploadDataDesc")}</CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>{t("home.aiAnalysis")}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{t("home.aiAnalysisDesc")}</CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>{t("home.getRecommendation")}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{t("home.getRecommendationDesc")}</CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">{t("home.whyChoose")}</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Smartphone className="w-6 h-6 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{t("home.mobileOptimized")}</h3>
                    <p className="text-gray-600">{t("home.mobileOptimizedDesc")}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Globe className="w-6 h-6 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{t("home.multiLanguage")}</h3>
                    <p className="text-gray-600">{t("home.multiLanguageDesc")}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <LinkIcon className="w-6 h-6 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{t("home.multipleInputs")}</h3>
                    <p className="text-gray-600">{t("home.multipleInputDesc")}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">95%</div>
                <p className="text-gray-600 mb-4">{t("home.accuracyRate")}</p>
                <div className="text-4xl font-bold text-green-600 mb-2">10K+</div>
                <p className="text-gray-600 mb-4">{t("home.carsEvaluated")}</p>
                <div className="text-4xl font-bold text-purple-600 mb-2">4.8★</div>
                <p className="text-gray-600">{t("home.userRating")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-blue-600">
        <div className="container mx-auto text-center max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">{t("home.readyToFind")}</h2>
          <p className="text-xl text-blue-100 mb-8">{t("home.readyToFindDesc")}</p>
          <Link href="/evaluate">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
              {t("home.startNow")}
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">CarCheck</span>
              </div>
              <p className="text-gray-400">{t("home.footerDesc")}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">{t("home.features")}</h3>
              <ul className="space-y-2 text-gray-400">
                <li>{t("home.carEvaluationFeature")}</li>
                <li>{t("home.imageAnalysis")}</li>
                <li>{t("home.marketComparison")}</li>
                <li>{t("home.mobileApp")}</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">{t("home.support")}</h3>
              <ul className="space-y-2 text-gray-400">
                <li>{t("home.helpCenter")}</li>
                <li>{t("home.contactUs")}</li>
                <li>{t("home.faq")}</li>
                <li>{t("home.privacyPolicy")}</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">{t("home.company")}</h3>
              <ul className="space-y-2 text-gray-400">
                <li>{t("home.aboutUs")}</li>
                <li>{t("home.blog")}</li>
                <li>{t("home.careers")}</li>
                <li>{t("home.termsOfService")}</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 CarCheck. {t("home.allRightsReserved")}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
