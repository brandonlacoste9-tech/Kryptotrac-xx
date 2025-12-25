"use client"

import { useEffect, useRef } from "react"

interface BlockchainInternalsProps {
  opacity?: number
  className?: string
  active?: boolean
}

export function BlockchainInternals({ opacity = 0.3, className = "", active = true }: BlockchainInternalsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  useEffect(() => {
    if (!active) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number
    let width = canvas.width = canvas.offsetWidth
    let height = canvas.height = canvas.offsetHeight

    // Configuration
    const NODE_COUNT = 40
    const CONNECTION_DISTANCE = 150
    const PACKET_CHANCE = 0.02

    interface Node {
      x: number
      y: number
      vx: number
      vy: number
      radius: number
      pulse: number
    }

    interface Packet {
        from: Node
        to: Node
        progress: number
        speed: number
    }

    const nodes: Node[] = []
    const packets: Packet[] = []

    // Initialize Nodes
    for (let i = 0; i < NODE_COUNT; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1,
        pulse: Math.random() * Math.PI
      })
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      
      // Update and Draw Nodes
      ctx.fillStyle = `rgba(6, 182, 212, ${opacity})` // Cyan tint
      nodes.forEach(node => {
        // Movement
        node.x += node.vx
        node.y += node.vy

        // Bounce off walls
        if (node.x < 0 || node.x > width) node.vx *= -1
        if (node.y < 0 || node.y > height) node.vy *= -1

        // Pulse effect
        node.pulse += 0.05
        const currentRadius = node.radius + Math.sin(node.pulse) * 0.5

        ctx.beginPath()
        ctx.arc(node.x, node.y, currentRadius, 0, Math.PI * 2)
        ctx.fill()
      })

      // Draw Connections
      ctx.strokeStyle = `rgba(6, 182, 212, ${opacity * 0.5})`
      ctx.lineWidth = 1
      
      nodes.forEach((nodeA, i) => {
        nodes.slice(i + 1).forEach(nodeB => {
          const dx = nodeA.x - nodeB.x
          const dy = nodeA.y - nodeB.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < CONNECTION_DISTANCE) {
            ctx.beginPath()
            ctx.moveTo(nodeA.x, nodeA.y)
            ctx.lineTo(nodeB.x, nodeB.y)
            ctx.stroke()

            // Spawn Packet?
            if (active && Math.random() < PACKET_CHANCE && packets.length < 20) {
               packets.push({
                   from: nodeA,
                   to: nodeB,
                   progress: 0,
                   speed: 0.02 + Math.random() * 0.03
               })
            }
          }
        })
      })

      // Draw Packets (Data flow)
      packets.forEach((packet, index) => {
          packet.progress += packet.speed
          if (packet.progress >= 1) {
              packets.splice(index, 1)
              return
          }

          const currentX = packet.from.x + (packet.to.x - packet.from.x) * packet.progress
          const currentY = packet.from.y + (packet.to.y - packet.from.y) * packet.progress

          ctx.fillStyle = "#fff" // White hot data
          ctx.beginPath()
          ctx.arc(currentX, currentY, 2, 0, Math.PI * 2)
          ctx.fill()
          
          // Glow
          ctx.shadowBlur = 10
          ctx.shadowColor = "#06b6d4"
          ctx.fill()
          ctx.shadowBlur = 0 // Reset
      })

      animationFrameId = requestAnimationFrame(draw)
    }

    const handleResize = () => {
        width = canvas.width = canvas.offsetWidth
        height = canvas.height = canvas.offsetHeight
    }

    window.addEventListener('resize', handleResize)
    draw()

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [opacity, active])

  return (
    <canvas 
        ref={canvasRef} 
        className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
    />
  )
}
