"use client"

import { useEffect, useRef, useState } from "react"
import "./CustomCursor.module.css"

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  const positionRef = useRef({ x: 0, y: 0 })
  const targetRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const checkTouch = () => {
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0)
    }
    checkTouch()

    if (isTouchDevice) return

    let animationFrameId: number

    const updatePosition = () => {
      if (!cursorRef.current) return

      const lerp = 0.15
      positionRef.current.x += (targetRef.current.x - positionRef.current.x) * lerp
      positionRef.current.y += (targetRef.current.y - positionRef.current.y) * lerp

      cursorRef.current.style.transform = `translate(${positionRef.current.x}px, ${positionRef.current.y}px)`

      animationFrameId = requestAnimationFrame(updatePosition)
    }

    const handleMouseMove = (e: MouseEvent) => {
      targetRef.current.x = e.clientX - 12
      targetRef.current.y = e.clientY - 12
    }

    window.addEventListener('mousemove', handleMouseMove)
    animationFrameId = requestAnimationFrame(updatePosition)

    document.body.classList.add('with-orb')

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(animationFrameId)
      document.body.classList.remove('with-orb')
    }
  }, [isTouchDevice])

  if (isTouchDevice) return null

  return (
    <div
      ref={cursorRef}
      className="custom-cursor"
      aria-hidden="true"
    />
  )
}
