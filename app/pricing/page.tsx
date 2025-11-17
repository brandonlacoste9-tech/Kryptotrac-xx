"use client"

import { useState } from "react"
import { Check, Zap, Shield, CreditCard, Star } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { Metadata } from "next"
import PricingClient from "./pricing-client"

export const metadata: Metadata = {
  title: "KryptoTrac Pro - Pricing",
  description: "Upgrade to KryptoTrac Pro for unlimited alerts and advanced analytics",
}

export default function PricingPage() {
  return <PricingClient />
}
