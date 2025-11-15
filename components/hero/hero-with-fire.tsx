"use client"

import { useEffect, useRef } from "react"

export function HeroWithFire() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      life: number
      maxLife: number
      size: number
    }> = []

    const createParticle = (x: number) => {
      particles.push({
        x: x + (Math.random() - 0.5) * 60,
        y: canvas.height - 30,
        vx: (Math.random() - 0.5) * 3,
        vy: -Math.random() * 5 - 4,
        life: 1,
        maxLife: Math.random() * 100 + 70,
        size: Math.random() * 50 + 20,
      })
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const textWidth = canvas.width * 0.75
      const startX = canvas.width * 0.125

      // Generate more particles for dense fire effect
      for (let i = 0; i < 8; i++) {
        createParticle(startX + Math.random() * textWidth)
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.x += p.vx
        p.y += p.vy
        p.vy -= 0.09
        p.life--

        if (p.life <= 0) {
          particles.splice(i, 1)
          continue
        }

        const lifeRatio = p.life / p.maxLife
        const alpha = lifeRatio * 1

        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size)

        // Brighter, more intense flame colors
        if (lifeRatio > 0.65) {
          gradient.addColorStop(0, `rgba(255, 240, 150, ${alpha})`)
          gradient.addColorStop(0.2, `rgba(255, 180, 60, ${alpha})`)
          gradient.addColorStop(0.5, `rgba(255, 100, 30, ${alpha * 0.9})`)
        } else if (lifeRatio > 0.35) {
          gradient.addColorStop(0, `rgba(255, 140, 50, ${alpha})`)
          gradient.addColorStop(0.3, `rgba(240, 60, 30, ${alpha * 0.95})`)
          gradient.addColorStop(0.7, `rgba(180, 30, 20, ${alpha * 0.75})`)
        } else {
          gradient.addColorStop(0, `rgba(200, 50, 30, ${alpha})`)
          gradient.addColorStop(0.4, `rgba(120, 25, 20, ${alpha * 0.7})`)
          gradient.addColorStop(0.8, `rgba(60, 15, 10, ${alpha * 0.5})`)
        }
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)")

        ctx.fillStyle = gradient
        ctx.fillRect(p.x - p.size, p.y - p.size, p.size * 2, p.size * 2)
      }

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [])

  return (
    <div className="relative text-center space-y-6 py-20 md:py-24">
      <div className="relative inline-block">
        <canvas
          ref={canvasRef}
          className="absolute pointer-events-none"
          style={{
            left: "-15%",
            top: "-40px",
            width: "130%",
            height: "calc(100% + 120px)",
            zIndex: 1,
          }}
        />
        <h1
          className="relative text-7xl md:text-9xl font-bold tracking-tight"
          style={{
            zIndex: 2,
            background: "linear-gradient(to bottom, #ffb347 0%, #ff8c42 30%, #ff6b35 60%, #dc143c 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            filter: "drop-shadow(0 0 40px rgba(255, 100, 0, 0.6)) drop-shadow(0 0 20px rgba(255, 50, 0, 0.8))",
          }}
        >
          KryptoTrac
        </h1>
      </div>
      <h2 className="relative text-3xl md:text-5xl font-bold text-white mb-4" style={{ zIndex: 2 }}>
        Crypto moves fast. Now you do too.
      </h2>
      <p className="relative text-lg md:text-xl text-neutral-300 font-light max-w-3xl mx-auto" style={{ zIndex: 2 }}>
        Kryptotrac gives you the signal, not the noise – fast alerts, clean tracking, and simple insights for the next wave of crypto kings.
      </p>
      <div className="relative flex gap-4 justify-center pt-6" style={{ zIndex: 2 }}>
        <a
          href="/dashboard"
          className="inline-flex h-12 items-center justify-center rounded-md bg-gradient-to-r from-red-600 to-red-500 px-10 text-base font-semibold text-white shadow-lg shadow-red-500/50 hover:shadow-red-500/80 hover:from-red-500 hover:to-red-600 transition-all duration-200"
        >
          Launch app
        </a>
        <a
          href="/pricing"
          className="inline-flex h-12 items-center justify-center rounded-md border border-white/20 bg-black/50 backdrop-blur px-10 text-base font-medium text-white hover:bg-white/10 hover:border-white/30 transition-all duration-200"
        >
          See pricing
        </a>
      </div>
    </div>
  )
}
