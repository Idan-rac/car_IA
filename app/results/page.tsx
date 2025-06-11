"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/contexts/language-context"
import { ArrowLeft, Share2, Download, CheckCircle, XCircle, HelpCircle } from "lucide-react"
import Link from "next/link"
import { RatingGraph } from "@/components/rating-graph"
import { motion } from "framer-motion"

interface EvaluationResult {
  carData: {
    title: string
    mileage: number
    price: number
    ownership: number
    gearbox: string
    engineType: string
    year: number
  }
  evaluation: string
  recommendation: "Good deal" | "Not recommended" | "Neutral – depends"
  score: number
}

export default function ResultsPage() {
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { t, isRTL, language } = useLanguage()
  const [result, setResult] = useState<EvaluationResult | null>(null)

  useEffect(() => {
    const data = searchParams.get("data")
    if (data) {
      try {
        const parsedData = JSON.parse(decodeURIComponent(data))
        setResult(parsedData)
        console.log("Parsed evaluation result:", parsedData)
      } catch (error) {
        toast({
          title: t("results.errors.invalidData"),
          description: t("results.errors.tryAgain"),
          variant: "destructive"
        })
        console.error("Error parsing evaluation data:", error)
      }
    }
    console.log("ResultsPage - Current language:", language, "isRTL:", isRTL);
  }, [searchParams, toast, t, language, isRTL])

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case "Good deal":
        return <CheckCircle className="w-6 h-6 text-green-500" />
      case "Not recommended":
        return <XCircle className="w-6 h-6 text-red-500" />
      default:
        return <HelpCircle className="w-6 h-6 text-yellow-500" />
    }
  }

  const handleShare = async () => {
    try {
      await navigator.share({
        title: t("results.share.title"),
        text: t("results.share.text"),
        url: window.location.href
      })
    } catch (error) {
      toast({
        title: t("results.share.error"),
        description: t("results.share.errorDesc"),
        variant: "destructive"
      })
    }
  }

  const handleDownload = () => {
    if (!result) return

    const content = `
Car Evaluation Results
=====================

Car Details:
-----------
Title: ${result.carData.title}
Year: ${result.carData.year}
Mileage: ${result.carData.mileage}
Price: ${result.carData.price}
Ownership: ${result.carData.ownership}
Gearbox: ${result.carData.gearbox}
Engine Type: ${result.carData.engineType}

Evaluation:
----------
${result.evaluation}

Recommendation: ${result.recommendation}
Score: ${result.score}%
    `

    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "car-evaluation.txt"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">{t("results.loading")}</h2>
              <p className="text-gray-600">{t("results.noData")}</p>
              <Link href="/evaluate">
                <Button className="mt-4">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t("results.backToEvaluate")}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 ${isRTL ? "rtl" : "ltr"}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-between items-center mb-8"
          >
            <Link href="/evaluate">
              <Button variant="ghost">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t("results.back")}
              </Button>
            </Link>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                {t("results.share")}
              </Button>
              <Button variant="outline" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                {t("results.download")}
              </Button>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 gap-8">
            {/* Score Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <RatingGraph score={result.score} recommendation={result.recommendation} />
            </motion.div>

            {/* Recommendation Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{t("results.recommendation")}</CardTitle>
                    {getRecommendationIcon(result.recommendation)}
                  </div>
                  <CardDescription className="text-lg font-medium">
                    {result.recommendation}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    {result.evaluation.split("\n").map((paragraph, index) => (
                      <p key={index} className="mb-4">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Car Details Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>{t("results.carDetails")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">{t("results.fields.title")}</dt>
                      <dd className="mt-1 text-sm text-gray-900">{result.carData.title}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">{t("results.fields.year")}</dt>
                      <dd className="mt-1 text-sm text-gray-900">{result.carData.year}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">{t("results.fields.mileage")}</dt>
                      <dd className="mt-1 text-sm text-gray-900">{result.carData.mileage.toLocaleString()} km</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">{t("results.fields.price")}</dt>
                      <dd className="mt-1 text-sm text-gray-900">₪{result.carData.price.toLocaleString()}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">{t("results.fields.ownership")}</dt>
                      <dd className="mt-1 text-sm text-gray-900">{result.carData.ownership}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">{t("results.fields.gearbox")}</dt>
                      <dd className="mt-1 text-sm text-gray-900">{result.carData.gearbox}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">{t("results.fields.engineType")}</dt>
                      <dd className="mt-1 text-sm text-gray-900">{result.carData.engineType}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
