"use client"

import { useEffect, useRef, useState } from "react"
import { useLanguage } from "@/contexts/language-context"
import { motion, useSpring, useTransform } from "framer-motion"

interface RatingGraphProps {
    score: number
    recommendation: "Good deal" | "Not recommended" | "Neutral – depends"
}

export function RatingGraph({ score, recommendation }: RatingGraphProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const { t, isRTL } = useLanguage()

    const animatedScore = useSpring(0, {
        stiffness: 50,
        damping: 20,
        duration: 1.5
    })

    useEffect(() => {
        animatedScore.set(score)
    }, [score])

    const getScoreColor = (currentScore: number) => {
        if (currentScore >= 60) return "#22c55e" // Green
        if (currentScore >= 30) return "#f59e0b" // Orange
        return "#ef4444" // Red
    }

    const getScoreLabel = (currentScore: number) => {
        if (currentScore >= 60) return t("results.scoreLabelRecommended")
        if (currentScore >= 30) return t("results.scoreLabelWorthChecking")
        return t("results.scoreLabelNotRecommended")
    }

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        // Set canvas size
        canvas.width = 300
        canvas.height = 180

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // Draw background
        ctx.fillStyle = "#f3f4f6"
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Draw score bar
        const barWidth = canvas.width - 40
        const barHeight = 24
        const barX = 20
        const barY = canvas.height / 2 - barHeight / 2

        // Draw bar background with rounded corners
        ctx.fillStyle = "#e5e7eb"
        ctx.beginPath()
        ctx.roundRect(barX, barY, barWidth, barHeight, 12)
        ctx.fill()

        // Draw score fill with rounded corners
        const currentAnimatedScore = animatedScore.get()
        const fillWidth = (currentAnimatedScore / 100) * barWidth
        const fillColor = getScoreColor(currentAnimatedScore)
        ctx.fillStyle = fillColor
        ctx.beginPath()
        ctx.roundRect(barX, barY, fillWidth, barHeight, 12)
        ctx.fill()

        // Draw score text with shadow
        ctx.shadowColor = "rgba(0, 0, 0, 0.1)"
        ctx.shadowBlur = 4
        ctx.shadowOffsetY = 2
        ctx.fillStyle = "#1f2937"
        ctx.font = "bold 32px Arial"
        ctx.textAlign = "center"
        ctx.fillText(`${Math.round(currentAnimatedScore)}%`, canvas.width / 2, barY - 15)

        // Reset shadow
        ctx.shadowColor = "transparent"
        ctx.shadowBlur = 0
        ctx.shadowOffsetY = 0

        // Draw 0 and 100 labels
        ctx.font = "14px Arial"
        ctx.fillStyle = "#6b7280"
        ctx.textAlign = isRTL ? "right" : "left"
        ctx.fillText("0", isRTL ? barX + barWidth + 10 : barX - 10, barY + barHeight + 20)

        ctx.textAlign = isRTL ? "left" : "right"
        ctx.fillText("100", isRTL ? barX - 10 : barX + barWidth + 10, barY + barHeight + 20)

        // Draw score range labels (0-29, 30-59, 60-100)
        ctx.font = "12px Arial"
        ctx.fillStyle = "#6b7280"

        // 0-29 label
        ctx.textAlign = isRTL ? "right" : "left";
        ctx.fillText(t("results.scoreRange0_29"), isRTL ? barX + barWidth : barX, barY + barHeight + 40);

        // 30-59 label
        ctx.textAlign = "center";
        ctx.fillText(t("results.scoreRange30_59"), canvas.width / 2, barY + barHeight + 40);

        // 60-100 label
        ctx.textAlign = isRTL ? "left" : "right";
        ctx.fillText(t("results.scoreRange60_100"), isRTL ? barX : barX + barWidth, barY + barHeight + 40);


        // Draw score explanation
        ctx.font = "14px Arial"
        ctx.fillStyle = fillColor
        ctx.textAlign = "center"
        ctx.fillText(getScoreLabel(currentAnimatedScore), canvas.width / 2, barY + barHeight + 70)
    }, [animatedScore, isRTL, t, getScoreColor, getScoreLabel])

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md mx-auto"
        >
            <h3 className="text-2xl font-bold text-center mb-6">{t("results.scoreChartTitle")}</h3>
            <canvas ref={canvasRef} className="w-full" />
        </motion.div>
    )
}