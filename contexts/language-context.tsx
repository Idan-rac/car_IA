"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

type Language = "en" | "he"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
  isRTL: boolean
}

const translations = {
  en: {
    // Header
    "header.back": "Back",
    "header.carEvaluation": "Car Evaluation",
    "header.analysisResults": "Analysis Results",
    "header.newEvaluation": "New Evaluation",

    // Homepage
    "home.title": "Smart Used Car",
    "home.titleHighlight": " Evaluation",
    "home.subtitle":
      "Make informed decisions when buying used cars. Our AI-powered platform analyzes car data and provides clear recommendations to help you find the best deals.",
    "home.startEvaluation": "Start Car Evaluation",
    "home.learnMore": "Learn More",
    "home.howItWorks": "How It Works",
    "home.uploadData": "Upload or Enter Data",
    "home.uploadDataDesc":
      "Manually enter car details, upload a screenshot from car listings, or paste a link to the listing.",
    "home.aiAnalysis": "AI Analysis",
    "home.aiAnalysisDesc":
      "Our advanced AI analyzes the car data against market trends, condition factors, and pricing benchmarks.",
    "home.getRecommendation": "Get Recommendation",
    "home.getRecommendationDesc":
      "Receive a clear recommendation: Good Deal, Neutral, or Bad Deal with detailed explanations.",
    "home.whyChoose": "Why Choose CarCheck?",
    "home.mobileOptimized": "Mobile Optimized",
    "home.mobileOptimizedDesc": "Works perfectly on Android and iPhone devices",
    "home.multiLanguage": "Multi-Language Support",
    "home.multiLanguageDesc": "Available in Hebrew and English with RTL/LTR support",
    "home.multipleInput": "Multiple Input Methods",
    "home.multipleInputDesc": "Manual entry, image upload, or link integration",
    "home.accuracyRate": "Accuracy Rate",
    "home.carsEvaluated": "Cars Evaluated",
    "home.userRating": "User Rating",
    "home.readyToFind": "Ready to Find Your Perfect Car?",
    "home.readyToFindDesc": "Join thousands of smart buyers who use CarCheck to make informed decisions.",
    "home.startNow": "Start Your Evaluation Now",
    "home.features": "Features",
    "home.carEvaluationFeature": "Car Evaluation",
    "home.imageAnalysis": "Image Analysis",
    "home.marketComparison": "Market Comparison",
    "home.mobileApp": "Mobile App",
    "home.support": "Support",
    "home.helpCenter": "Help Center",
    "home.contactUs": "Contact Us",
    "home.faq": "FAQ",
    "home.privacyPolicy": "Privacy Policy",
    "home.company": "Company",
    "home.aboutUs": "About Us",
    "home.blog": "Blog",
    "home.careers": "Careers",
    "home.termsOfService": "Terms of Service",
    "home.allRightsReserved": "All rights reserved.",
    "home.footerDesc": "Smart car evaluation platform for informed buying decisions.",

    // Evaluate Page
    "evaluate.title": "Evaluate Your Car",
    "evaluate.subtitle": "Choose how you'd like to provide car information for analysis",
    "evaluate.manualInput": "Manual Input",
    "evaluate.yad2Url": "Yad2 URL",
    "evaluate.enterDetails": "Enter Car Details",
    "evaluate.enterDetailsDesc": "Fill in the car information manually for detailed analysis",
    "evaluate.fields.title": "Car Title",
    "evaluate.fields.titlePlaceholder": "e.g., Toyota Corolla 2020",
    "evaluate.fields.mileage": "Mileage",
    "evaluate.fields.mileagePlaceholder": "Enter mileage in km",
    "evaluate.fields.price": "Price",
    "evaluate.fields.pricePlaceholder": "Enter price in ₪",
    "evaluate.fields.year": "Year",
    "evaluate.fields.yearPlaceholder": "Enter year",
    "evaluate.fields.ownership": "Ownership",
    "evaluate.fields.ownershipPlaceholder": "Number of previous owners",
    "evaluate.fields.gearbox": "Gearbox",
    "evaluate.fields.gearboxPlaceholder": "e.g., Automatic, Manual",
    "evaluate.fields.engineType": "Engine Type",
    "evaluate.fields.engineTypePlaceholder": "e.g., Petrol, Diesel, Hybrid",
    "evaluate.fields.yad2Url": "Yad2 URL",
    "evaluate.fields.yad2UrlPlaceholder": "Paste Yad2 car listing URL",
    "evaluate.evaluate": "Evaluate Car",
    "evaluate.evaluating": "Evaluating...",
    "evaluate.errors.validationError": "Validation Error",
    "evaluate.errors.titleRequired": "Car title is required",
    "evaluate.errors.mileageRequired": "Mileage is required",
    "evaluate.errors.priceRequired": "Price is required",
    "evaluate.errors.yearRequired": "Year is required",
    "evaluate.errors.mileageInvalid": "Mileage must be a valid number",
    "evaluate.errors.priceInvalid": "Price must be a valid number",
    "evaluate.errors.yearInvalid": "Year must be between 1900 and current year",
    "evaluate.errors.urlRequired": "Yad2 URL is required",
    "evaluate.errors.invalidUrl": "Invalid URL",
    "evaluate.errors.yad2Only": "Only Yad2 URLs are supported",
    "evaluate.errors.evaluationError": "Evaluation Error",
    "evaluate.errors.unknownError": "An unknown error occurred",

    // Results Page
    "results.back": "Back",
    "results.share": "Share",
    "results.download": "Download",
    "results.recommendation": "Recommendation",
    "results.carDetails": "Car Details",
    "results.fields.title": "Title",
    "results.fields.year": "Year",
    "results.fields.mileage": "Mileage",
    "results.fields.price": "Price",
    "results.fields.ownership": "Ownership",
    "results.fields.gearbox": "Gearbox",
    "results.fields.engineType": "Engine Type",
    "results.loading": "Loading Results",
    "results.noData": "No evaluation data found",
    "results.backToEvaluate": "Back to Evaluation",
    "results.share.title": "Car Evaluation Results",
    "results.share.text": "Check out my car evaluation results!",
    "results.share.error": "Share Error",
    "results.share.errorDesc": "Failed to share results",
    "results.errors.invalidData": "Invalid Data",
    "results.errors.tryAgain": "Please try evaluating again",
    "results.scoreChartTitle": "Car Evaluation Score",
    "results.scoreLabelRecommended": "Recommended – car appears to be in good condition",
    "results.scoreLabelWorthChecking": "Worth checking, but has some potential concerns",
    "results.scoreLabelNotRecommended": "Not recommended – significant risks identified",
    "results.scoreRange0_29": "0-29",
    "results.scoreRange30_59": "30-59",
    "results.scoreRange60_100": "60-100",
  },
  he: {
    // Header
    "header.back": "חזור",
    "header.carEvaluation": "הערכת רכב",
    "header.analysisResults": "תוצאות הניתוח",
    "header.newEvaluation": "הערכה חדשה",

    // Homepage
    "home.title": "הערכת רכבים יד שנייה",
    "home.titleHighlight": " חכמה",
    "home.subtitle":
      "קבלו החלטות מושכלות בעת רכישת רכבים יד שנייה. הפלטפורמה שלנו מונעת בינה מלאכותית מנתחת נתוני רכב ומספקת המלצות ברורות כדי לעזור לכם למצוא את העסקאות הטובות ביותר.",
    "home.startEvaluation": "התחל הערכת רכב",
    "home.learnMore": "למד עוד",
    "home.howItWorks": "איך זה עובד",
    "home.uploadData": "העלה או הזן נתונים",
    "home.uploadDataDesc": "הזינו פרטי רכב באופן ידני, העלו צילום מסך ממודעות רכב, או הדביקו קישור למודעה.",
    "home.aiAnalysis": "ניתוח בינה מלאכותית",
    "home.aiAnalysisDesc": "הבינה המלאכותית המתקדמת שלנו מנתחת את נתוני הרכב מול מגמות שוק, גורמי מצב ומדדי תמחור.",
    "home.getRecommendation": "קבל המלצה",
    "home.getRecommendationDesc": "קבלו המלצה ברורה: עסקה טובה, ניטרלי, או עסקה רעה עם הסברים מפורטים.",
    "home.whyChoose": "למה לבחור ב-CarCheck?",
    "home.mobileOptimized": "מותאם לנייד",
    "home.mobileOptimizedDesc": "עובד בצורה מושלמת על מכשירי אנדרואיד ואייפון",
    "home.multiLanguage": "תמיכה רב-לשונית",
    "home.multiLanguageDesc": "זמין בעברית ובאנגלית עם תמיכה RTL/LTR",
    "home.multipleInput": "שיטות קלט מרובות",
    "home.multipleInputDesc": "הזנה ידנית, העלאת תמונה, או אינטגרציית קישור",
    "home.accuracyRate": "שיעור דיוק",
    "home.carsEvaluated": "רכבים שהוערכו",
    "home.userRating": "דירוג משתמשים",
    "home.readyToFind": "מוכנים למצוא את הרכב המושלם שלכם?",
    "home.readyToFindDesc": "הצטרפו לאלפי קונים חכמים שמשתמשים ב-CarCheck כדי לקבל החלטות מושכלות.",
    "home.startNow": "התחילו את ההערכה שלכם עכשיו",
    "home.features": "תכונות",
    "home.carEvaluationFeature": "הערכת רכב",
    "home.imageAnalysis": "ניתוח תמונה",
    "home.marketComparison": "השוואת שוק",
    "home.mobileApp": "אפליקציית נייד",
    "home.support": "תמיכה",
    "home.helpCenter": "מרכז עזרה",
    "home.contactUs": "צור קשר",
    "home.faq": "שאלות נפוצות",
    "home.privacyPolicy": "מדיניות פרטיות",
    "home.company": "החברה",
    "home.aboutUs": "אודותינו",
    "home.blog": "בלוג",
    "home.careers": "קריירה",
    "home.termsOfService": "תנאי שירות",
    "home.allRightsReserved": "כל הזכויות שמורות.",
    "home.footerDesc": "פלטפורמה חכמה להערכת רכבים לקבלת החלטות קנייה מושכלות.",

    // Evaluate Page
    "evaluate.title": "הערך את הרכב שלך",
    "evaluate.subtitle": "בחרו איך תרצו לספק מידע על הרכב לניתוח",
    "evaluate.manualInput": "הזנה ידנית",
    "evaluate.yad2Url": "כתובת יד2",
    "evaluate.enterDetails": "הזן פרטי רכב",
    "evaluate.enterDetailsDesc": "מלאו את מידע הרכב באופן ידני לניתוח מפורט",
    "evaluate.fields.title": "כותרת הרכב",
    "evaluate.fields.titlePlaceholder": "לדוגמה: טויוטה קורולה 2020",
    "evaluate.fields.mileage": "קילומטראז'",
    "evaluate.fields.mileagePlaceholder": "הזן קילומטראז' בק\"מ",
    "evaluate.fields.price": "מחיר",
    "evaluate.fields.pricePlaceholder": "הזן מחיר ב-₪",
    "evaluate.fields.year": "שנה",
    "evaluate.fields.yearPlaceholder": "הזן שנה",
    "evaluate.fields.ownership": "בעלות",
    "evaluate.fields.ownershipPlaceholder": "מספר בעלים קודמים",
    "evaluate.fields.gearbox": "תיבת הילוכים",
    "evaluate.fields.gearboxPlaceholder": "לדוגמה: אוטומטית, ידנית",
    "evaluate.fields.engineType": "סוג מנוע",
    "evaluate.fields.engineTypePlaceholder": "לדוגמה: בנזין, דיזל, היברידי",
    "evaluate.fields.yad2Url": "קישור יד2",
    "evaluate.fields.yad2UrlPlaceholder": "הדבק קישור למודעת רכב מיד2",
    "evaluate.evaluate": "הערך רכב",
    "evaluate.evaluating": "מעריך...",
    "evaluate.errors.validationError": "שגיאת אימות",
    "evaluate.errors.titleRequired": "כותרת הרכב נדרשת",
    "evaluate.errors.mileageRequired": "קילומטראז' נדרש",
    "evaluate.errors.priceRequired": "מחיר נדרש",
    "evaluate.errors.yearRequired": "שנה נדרשת",
    "evaluate.errors.mileageInvalid": "קילומטראז' חייב להיות מספר תקין",
    "evaluate.errors.priceInvalid": "מחיר חייב להיות מספר תקין",
    "evaluate.errors.yearInvalid": "שנה חייבת להיות בין 1900 לשנה הנוכחית",
    "evaluate.errors.urlRequired": "קישור יד2 נדרש",
    "evaluate.errors.invalidUrl": "קישור לא תקין",
    "evaluate.errors.yad2Only": "רק קישורי יד2 נתמכים",
    "evaluate.errors.evaluationError": "שגיאת הערכה",
    "evaluate.errors.unknownError": "אירעה שגיאה בלתי צפויה",

    // Results Page
    "results.back": "חזור",
    "results.share": "שתף",
    "results.download": "הורד",
    "results.recommendation": "המלצה",
    "results.carDetails": "פרטי רכב",
    "results.fields.title": "כותרת",
    "results.fields.year": "שנה",
    "results.fields.mileage": "קילומטראז'",
    "results.fields.price": "מחיר",
    "results.fields.ownership": "בעלות",
    "results.fields.gearbox": "תיבת הילוכים",
    "results.fields.engineType": "סוג מנוע",
    "results.loading": "טוען תוצאות",
    "results.noData": "לא נמצאו נתוני הערכה",
    "results.backToEvaluate": "חזרה להערכה",
    "results.share.title": "תוצאות הערכת רכב",
    "results.share.text": "בדקו את תוצאות הערכת הרכב שלי!",
    "results.share.error": "שגיאת שיתוף",
    "results.share.errorDesc": "השיתוף נכשל",
    "results.errors.invalidData": "נתונים לא תקינים",
    "results.errors.tryAgain": "אנא נסה להעריך שוב",
    "results.scoreChartTitle": "ציון הערכת רכב",
    "results.scoreLabelRecommended": "מומלץ – הרכב נראה במצב טוב",
    "results.scoreLabelWorthChecking": "שווה בדיקה, אך עם חששות פוטנציאליים",
    "results.scoreLabelNotRecommended": "לא מומלץ – זוהו סיכונים משמעותיים",
    "results.scoreRange0_29": "0-29",
    "results.scoreRange30_59": "30-59",
    "results.scoreRange60_100": "60-100",
  },
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => { },
  t: () => "",
  isRTL: false,
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage) {
      setLanguage(savedLanguage)
    } else {
      // Try to detect browser language
      const browserLang = navigator.language.split("-")[0]
      if (browserLang === "he") {
        setLanguage("he")
      }
    }
  }, [])

  const t = (key: string): string => {
    return translations[language]?.[key] || key
  }

  const isRTL = language === "he"

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
