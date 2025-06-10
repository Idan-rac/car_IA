"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/contexts/language-context"
import { Loader2, Car, Link as LinkIcon } from "lucide-react"

interface CarFormData {
  title: string
  mileage: string
  price: string
  ownership: string
  gearbox: string
  engineType: string
  year: string
}

export default function EvaluatePage() {
  const router = useRouter()
  const { toast } = useToast()
  const { t, isRTL, language } = useLanguage()
  const [isLoading, setIsLoading] = useState(false)
  const [yad2Url, setYad2Url] = useState("")
  const [formData, setFormData] = useState<CarFormData>({
    title: "",
    mileage: "",
    price: "",
    ownership: "",
    gearbox: "",
    engineType: "",
    year: ""
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validateForm = (data: CarFormData) => {
    const errors: string[] = []

    if (!data.title) errors.push(t("evaluate.errors.titleRequired"))
    if (!data.mileage) errors.push(t("evaluate.errors.mileageRequired"))
    if (!data.price) errors.push(t("evaluate.errors.priceRequired"))
    if (!data.year) errors.push(t("evaluate.errors.yearRequired"))

    if (data.mileage && isNaN(Number(data.mileage))) {
      errors.push(t("evaluate.errors.mileageInvalid"))
    }
    if (data.price && isNaN(Number(data.price))) {
      errors.push(t("evaluate.errors.priceInvalid"))
    }
    if (data.year && (isNaN(Number(data.year)) || Number(data.year) < 1900 || Number(data.year) > new Date().getFullYear())) {
      errors.push(t("evaluate.errors.yearInvalid"))
    }

    return errors
  }

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const errors = validateForm(formData)
    if (errors.length > 0) {
      toast({
        title: t("evaluate.errors.validationError"),
        description: errors.join("\n"),
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          carData: {
            ...formData,
            mileage: Number(formData.mileage),
            price: Number(formData.price),
            ownership: Number(formData.ownership) || 1,
            year: Number(formData.year)
          },
          language: language
        })
      })

      if (!response.ok) {
        throw new Error("Failed to evaluate car")
      }

      const data = await response.json()
      router.push(`/results?data=${encodeURIComponent(JSON.stringify(data))}`)
    } catch (error) {
      toast({
        title: t("evaluate.errors.evaluationError"),
        description: error instanceof Error ? error.message : t("evaluate.errors.unknownError"),
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleYad2Submit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!yad2Url) {
      toast({
        title: t("evaluate.errors.urlRequired"),
        variant: "destructive"
      })
      return
    }

    if (!yad2Url.includes("yad2.co.il")) {
      toast({
        title: t("evaluate.errors.invalidUrl"),
        description: t("evaluate.errors.yad2Only"),
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          yad2Url,
          language: language
        })
      })

      if (!response.ok) {
        throw new Error("Failed to evaluate car")
      }

      const data = await response.json()
      router.push(`/results?data=${encodeURIComponent(JSON.stringify(data))}`)
    } catch (error) {
      toast({
        title: t("evaluate.errors.evaluationError"),
        description: error instanceof Error ? error.message : t("evaluate.errors.unknownError"),
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 ${isRTL ? "rtl" : "ltr"}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">{t("evaluate.title")}</h1>
          <p className="text-center text-gray-600 mb-8">{t("evaluate.subtitle")}</p>

          <Tabs defaultValue="manual" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="manual" className="flex items-center justify-center">
                <Car className="w-4 h-4 mr-2" />
                {t("evaluate.manualInput")}
              </TabsTrigger>
              <TabsTrigger value="yad2" className="flex items-center justify-center">
                <LinkIcon className="w-4 h-4 mr-2" />
                {t("evaluate.yad2Url")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="manual">
              <Card>
                <CardHeader>
                  <CardTitle>{t("evaluate.enterDetails")}</CardTitle>
                  <CardDescription>{t("evaluate.enterDetailsDesc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleManualSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="title">{t("evaluate.fields.title")}</Label>
                      <Input
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder={t("evaluate.fields.titlePlaceholder")}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="mileage">{t("evaluate.fields.mileage")}</Label>
                        <Input
                          id="mileage"
                          name="mileage"
                          type="number"
                          value={formData.mileage}
                          onChange={handleInputChange}
                          placeholder={t("evaluate.fields.mileagePlaceholder")}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="price">{t("evaluate.fields.price")}</Label>
                        <Input
                          id="price"
                          name="price"
                          type="number"
                          value={formData.price}
                          onChange={handleInputChange}
                          placeholder={t("evaluate.fields.pricePlaceholder")}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="year">{t("evaluate.fields.year")}</Label>
                        <Input
                          id="year"
                          name="year"
                          type="number"
                          value={formData.year}
                          onChange={handleInputChange}
                          placeholder={t("evaluate.fields.yearPlaceholder")}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="ownership">{t("evaluate.fields.ownership")}</Label>
                        <Input
                          id="ownership"
                          name="ownership"
                          type="number"
                          value={formData.ownership}
                          onChange={handleInputChange}
                          placeholder={t("evaluate.fields.ownershipPlaceholder")}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="gearbox">{t("evaluate.fields.gearbox")}</Label>
                        <Input
                          id="gearbox"
                          name="gearbox"
                          value={formData.gearbox}
                          onChange={handleInputChange}
                          placeholder={t("evaluate.fields.gearboxPlaceholder")}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="engineType">{t("evaluate.fields.engineType")}</Label>
                        <Input
                          id="engineType"
                          name="engineType"
                          value={formData.engineType}
                          onChange={handleInputChange}
                          placeholder={t("evaluate.fields.engineTypePlaceholder")}
                        />
                      </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {t("evaluate.evaluating")}
                        </>
                      ) : (
                        t("evaluate.evaluate")
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="yad2">
              <Card>
                <CardHeader>
                  <CardTitle>{t("evaluate.fields.yad2Url")}</CardTitle>
                  <CardDescription>{t("evaluate.enterDetailsDesc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleYad2Submit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="yad2Url">{t("evaluate.fields.yad2Url")}</Label>
                      <Input
                        id="yad2Url"
                        value={yad2Url}
                        onChange={(e) => setYad2Url(e.target.value)}
                        placeholder={t("evaluate.fields.yad2UrlPlaceholder")}
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {t("evaluate.evaluating")}
                        </>
                      ) : (
                        t("evaluate.evaluate")
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
