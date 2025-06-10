"use client"

import { useEffect, useRef } from "react"
import { useLanguage } from "@/contexts/language-context"

interface RatingGraphProps {
    score: number
    recommendation: "Good deal" | "Not recommended" | "Neutral – depends"
}

export function RatingGraph({ score, recommendation }: RatingGraphProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const { t } = useLanguage()

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        // Set canvas size
        canvas.width = 300
        canvas.height = 150

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
        const fillWidth = (score / 100) * barWidth
        let fillColor = "#22c55e" // Green for good deal
        if (recommendation === "Not recommended") {
            fillColor = "#ef4444" // Red for bad deal
        } else if (recommendation === "Neutral – depends") {
            fillColor = "#f59e0b" // Yellow for neutral
        }
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
        ctx.fillText(`${score}%`, canvas.width / 2, barY - 15)

        // Reset shadow
        ctx.shadowColor = "transparent"
        ctx.shadowBlur = 0
        ctx.shadowOffsetY = 0

        // Draw labels
        ctx.font = "14px Arial"
        ctx.fillStyle = "#6b7280"
        ctx.textAlign = "left"
        ctx.fillText("0", barX - 10, barY + barHeight + 20)
        ctx.textAlign = "right"
        ctx.fillText("100", barX + barWidth + 10, barY + barHeight + 20)

        // Draw recommendation text
        ctx.font = "16px Arial"
        ctx.fillStyle = fillColor
        ctx.textAlign = "center"
        ctx.fillText(recommendation, canvas.width / 2, barY + barHeight + 40)
    }, [score, recommendation])

    return (
        <div className="w-full max-w-md mx-auto">
            <h3 className="text-xl font-semibold text-center mb-6">Car Evaluation Score</h3>
            <canvas ref={canvasRef} className="w-full" />
        </div>
    )
} 