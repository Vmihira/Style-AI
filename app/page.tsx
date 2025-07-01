"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Palette, Wand2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const heroImages = ["/images/hero-1.png", "/images/hero-2.png", "/images/hero-3.png", "/images/hero-4.png"]

export default function LandingPage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length)
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-rose-200/50 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-8 w-8 text-rose-500" />
              <span className="text-2xl font-bold bg-gradient-to-r from-rose-500 to-purple-600 bg-clip-text text-transparent">
                StyleAI
              </span>
            </div>
            <Link href="/gallery">
              <Button className="bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white border-0 shadow-lg">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="min-h-screen flex items-center pt-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Image */}
            <div className="relative">
              <div className="relative h-[600px] w-full rounded-3xl overflow-hidden shadow-2xl">
                {heroImages.map((image, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ${
                      index === currentImageIndex ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`Fashion hero ${index + 1}`}
                      fill
                      className="object-cover"
                      priority={index === 0}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>
                ))}
              </div>

              {/* Floating elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-r from-rose-400 to-pink-400 rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20 animate-pulse delay-1000"></div>
            </div>

            {/* Right Side - Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-6xl md:text-7xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-rose-500 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Style
                  </span>
                  <br />
                  <span className="text-gray-800">AI</span>
                </h1>
                <p className="text-2xl text-gray-600 font-light">Your Personal AI Fashion Stylist</p>
                <p className="text-lg text-gray-500 leading-relaxed max-w-lg">
                  Discover your perfect style with our AI-powered fashion recommendations. Mix, match, and create
                  stunning outfits tailored just for you.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/gallery">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white border-0 px-8 py-4 text-lg shadow-lg"
                  >
                    Start Styling
                    <Wand2 className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 gap-6 mt-12">
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-rose-200/50 shadow-lg">
                  <Palette className="h-12 w-12 text-rose-500 mb-4" />
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">Smart Curation</h3>
                  <p className="text-gray-600">AI-powered selection from thousands of fashion items</p>
                </div>
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-purple-200/50 shadow-lg">
                  <Wand2 className="h-12 w-12 text-purple-500 mb-4" />
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">Style Generation</h3>
                  <p className="text-gray-600">Generate unique outfits based on your preferences</p>
                </div>
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-pink-200/50 shadow-lg">
                  <Sparkles className="h-12 w-12 text-pink-500 mb-4" />
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">Personalized</h3>
                  <p className="text-gray-600">Tailored recommendations just for your style</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
