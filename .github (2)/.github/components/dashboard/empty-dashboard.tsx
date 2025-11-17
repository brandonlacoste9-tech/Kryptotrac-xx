'use client'

import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { Rocket, TrendingUp, Bell, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface EmptyDashboardProps {
  user: User
}

export function EmptyDashboard({ user }: EmptyDashboardProps) {
  const steps = [
    {
      icon: Search,
      title: 'Build Your Watchlist',
      description: 'Add cryptocurrencies you want to track',
      action: 'Browse Coins',
      href: '/'
    },
    {
      icon: TrendingUp,
      title: 'Track Your Portfolio',
      description: 'Record your holdings and see real-time performance',
      action: 'Add Holdings',
      href: '/dashboard'
    },
    {
      icon: Bell,
      title: 'Set Price Alerts',
      description: 'Get notified when prices hit your targets',
      action: 'Create Alert',
      href: '/alerts'
    }
  ]

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Rocket className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Welcome to KryptoTrac!</h1>
          <p className="text-xl text-muted-foreground">
            Let's get you set up in 3 simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-all duration-200"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                <step.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{step.description}</p>
              <Button asChild className="w-full">
                <Link href={step.href}>{step.action}</Link>
              </Button>
            </div>
          ))}
        </div>

        <div className="bg-card/50 border border-border rounded-lg p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Need help getting started?{' '}
            <Link href="/docs" className="text-primary hover:underline">
              Check out our guide
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
