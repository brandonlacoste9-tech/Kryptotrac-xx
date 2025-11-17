"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { triggerHaptic } from '@/lib/haptics'

interface BBWelcomeProps {
  onComplete: () => void
}

const welcomeMessages = [
  {
    message: "Yo! I'm BB, your crypto buddy. 🐝",
    haptic: [30, 20, 30] as [number, number, number],
    delay: 0
  },
  {
    message: "I speak YOUR language - literally. Over 100 languages. Try me in any language you want.",
    haptic: [30, 20, 30] as [number, number, number],
    delay: 2000
  },
  {
    message: "I watch the markets 24/7 and sometimes I'll pop up with tips when I notice something important. 👀",
    haptic: [50, 30, 100] as [number, number, number],
    delay: 4000
  },
  {
    message: "Ask me anything about crypto. I got you. 🐝",
    haptic: [30, 20, 30] as [number, number, number],
    delay: 6000
  }
]

export function BBWelcome({ onComplete }: BBWelcomeProps) {
  const [currentMessage, setCurrentMessage] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (currentMessage >= welcomeMessages.length) {
      setTimeout(() => {
        setIsVisible(false)
        setTimeout(onComplete, 500)
      }, 2000)
      return
    }

    const message = welcomeMessages[currentMessage]
    const timer = setTimeout(() => {
      triggerHaptic(...message.haptic)
      setCurrentMessage(currentMessage + 1)
    }, message.delay + (currentMessage === 0 ? 0 : 2000))

    return () => clearTimeout(timer)
  }, [currentMessage, onComplete])

  if (!isVisible) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="relative w-full max-w-md glass-card p-8 space-y-6"
      >
        <button
          onClick={() => {
            setIsVisible(false)
            onComplete()
          }}
          className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <motion.div
            animate={{
              rotate: [0, -10, 10, -10, 0],
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              repeatDelay: 2
            }}
            className="text-6xl mb-4"
          >
            🐝
          </motion.div>
        </div>

        <AnimatePresence mode="wait">
          {welcomeMessages.slice(0, currentMessage + 1).map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <p className="text-white text-lg leading-relaxed">
                {msg.message}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>

        {currentMessage >= welcomeMessages.length && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => {
              setIsVisible(false)
              onComplete()
            }}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg font-medium text-white shadow-lg hover:shadow-xl transition-all"
          >
            Let's Go!
          </motion.button>
        )}
      </motion.div>
    </motion.div>
  )
}
