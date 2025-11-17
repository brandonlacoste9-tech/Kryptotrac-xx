"use client"

import { Card } from "@/components/ui/card"
import { Star } from 'lucide-react'
import { useState, useEffect } from 'react'

const testimonials = [
  {
    name: "Alex M.",
    role: "Day Trader",
    content: "KryptoTrac is the cleanest crypto tracker I've used. The real-time alerts saved me from a bad trade last week. Worth every penny of Pro.",
    rating: 5,
    avatar: "AM"
  },
  {
    name: "Sarah K.",
    role: "Long-term Holder",
    content: "Finally, a tracker that respects my privacy and doesn't sell my data. The portfolio analytics help me stay disciplined.",
    rating: 5,
    avatar: "SK"
  },
  {
    name: "Jordan L.",
    role: "Crypto Beginner",
    content: "I was overwhelmed by other platforms. KryptoTrac makes it simple to track my coins without the noise. The free tier is perfect for learning.",
    rating: 5,
    avatar: "JL"
  }
]

export function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % testimonials.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
            Trusted by Crypto Investors Worldwide
          </h2>
          <p className="text-gray-400 text-lg">Real feedback from real users</p>
        </div>

        <div className="hidden md:grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, i) => (
            <Card key={i} className="p-6 bg-black/40 backdrop-blur-xl border border-white/10 hover:border-red-500/30 transition-all">
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                ))}
              </div>

              <p className="text-gray-300 mb-6 leading-relaxed">"{testimonial.content}"</p>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-semibold text-white">{testimonial.name}</p>
                  <p className="text-sm text-gray-400">{testimonial.role}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="md:hidden relative h-80">
          {testimonials.map((testimonial, i) => (
            <Card
              key={i}
              className={`absolute inset-0 p-6 bg-black/40 backdrop-blur-xl border border-white/10 transition-all duration-500 ${
                i === activeIndex ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
              }`}
            >
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                ))}
              </div>

              <p className="text-gray-300 mb-6 leading-relaxed">"{testimonial.content}"</p>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-semibold text-white">{testimonial.name}</p>
                  <p className="text-sm text-gray-400">{testimonial.role}</p>
                </div>
              </div>
            </Card>
          ))}

          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === activeIndex ? "bg-red-500 w-8" : "bg-gray-600"
                }`}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="mt-16 md:mt-12 text-center">
          <p className="text-sm text-gray-500">
            Names and details anonymized for privacy. Testimonials reflect genuine user feedback.
          </p>
        </div>
      </div>
    </section>
  )
}
