'use client'
import { useEffect, useState } from 'react'

export default function OrbCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [targetPosition, setTargetPosition] = useState({ x: 0, y: 0 })
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0)
    }
    if (isTouch) return

    const handleMouseMove = (e: MouseEvent) => {
      setTargetPosition({ x: e.clientX, y: e.clientY })
    }

    let frameId: number
    const animate = () => {
      setPosition(prev => ({
        x: prev.x + (targetPosition.x - prev.x) * 0.15,
        y: prev.y + (targetPosition.y - prev.y) * 0.15
      }))
      frameId = requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', handleMouseMove)
    frameId = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(frameId)
    }
  }, [targetPosition, isTouch])

  if (isTouch) return null

  return (
    <div
      className="fixed top-0 left-0 w-8 h-8 rounded-full pointer-events-none z-[9999]"
      style={{
        transform: `translate(${position.x - 16}px, ${position.y - 16}px)`,
        background: 'radial-gradient(circle, rgba(255, 176, 0, 0.6), rgba(255, 176, 0, 0.2))',
        boxShadow: '0 0 20px rgba(255, 176, 0, 0.6), 0 0 40px rgba(255, 176, 0, 0.3)'
      }}
    />
  )
}
