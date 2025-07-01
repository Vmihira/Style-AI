"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, Sparkles, Palette, Shirt, RefreshCw } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface FashionItem {
  id: string
  category: string
  name: string
  description: string
  color: string
  theme: string
  image: string
}

interface StyleAnalysis {
  total_items: number
  categories: string[]
  dominant_colors: string[]
  style_themes: string[]
  items_used: string[]
}

interface ImageData {
  base64: string
  filename: string
  image_id: string
  mime_type: string
}

interface GeneratedStyleResponse {
  success: boolean
  message?: string
  generated_description?: string
  style_analysis?: StyleAnalysis
  image_url?: string
  image_data?: ImageData
  error?: string
}

export default function ResultPage() {
  const [selectedItems, setSelectedItems] = useState<FashionItem[]>([])
  const [generatedImage, setGeneratedImage] = useState<string>("")
  const [generatedImageBase64, setGeneratedImageBase64] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(true)
  const [generatedDescription, setGeneratedDescription] = useState<string>("")
  const [styleAnalysis, setStyleAnalysis] = useState<StyleAnalysis | null>(null)
  const [error, setError] = useState<string>("")
  const [imageData, setImageData] = useState<ImageData | null>(null)

  useEffect(() => {
    const items = localStorage.getItem("selectedItems")
    if (items) {
      const parsedItems = JSON.parse(items)
      setSelectedItems(parsedItems)
      generateStyleWithAI(parsedItems)
    } else {
      setError("No items selected. Please go back to the gallery.")
      setIsGenerating(false)
    }
  }, [])

  const generateStyleWithAI = async (items: FashionItem[]) => {
    try {
      setIsGenerating(true)
      setError("")
      setGeneratedImage("")
      setGeneratedImageBase64("")

      console.log("Sending request to backend...")

      // Call the Flask backend
      const response = await fetch("http://localhost:5000/generate-style", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          selectedItems: items,
        }),
      })

      const data: GeneratedStyleResponse = await response.json()

      if (data.success) {
        console.log("Successfully received generated style")

        // Set the generated image data
        if (data.image_data) {
          setImageData(data.image_data)
          setGeneratedImageBase64(`data:${data.image_data.mime_type};base64,${data.image_data.base64}`)
          setGeneratedImage(data.image_url || "")
        }

        setGeneratedDescription(data.generated_description || "")
        setStyleAnalysis(data.style_analysis || null)
      } else {
        console.error("Backend error:", data.error)
        setError(data.error || "Failed to generate style")
        // Fallback to default image
        setGeneratedImage("/images/generated-style.png")
      }
    } catch (err) {
      console.error("Error generating style:", err)
      setError("Failed to connect to AI service. Please check if the backend is running.")
      // Fallback to default image
      setGeneratedImage("/images/generated-style.png")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleRegenerate = () => {
    if (selectedItems.length > 0) {
      generateStyleWithAI(selectedItems)
    }
  }

  const handleDownload = () => {
    try {
      if (generatedImageBase64) {
        // Download the AI-generated image
        const link = document.createElement("a")
        link.href = generatedImageBase64
        link.download = imageData?.filename || "ai-generated-style.jpg"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else if (generatedImage) {
        // Fallback to regular image download
        const link = document.createElement("a")
        link.href = generatedImage
        link.download = "my-ai-style.png"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (error) {
      console.error("Error downloading image:", error)
      alert("Failed to download image. Please try again.")
    }
  }

  const generateStyleDescription = () => {
    if (generatedDescription) {
      return generatedDescription
    }

    if (selectedItems.length === 0) return ""

    const themes = [...new Set(selectedItems.map((item) => item.theme))]
    const colors = [...new Set(selectedItems.map((item) => item.color))]

    return `This AI-generated style combines ${themes.join(", ")} aesthetics with a ${colors.join(", ")} color palette. The outfit features ${selectedItems.map((item) => item.name.toLowerCase()).join(", ")}, creating a harmonious and fashionable look that reflects your personal style preferences.`
  }

  const getDisplayImage = () => {
    if (generatedImageBase64) {
      return generatedImageBase64
    }
    if (generatedImage) {
      return generatedImage
    }
    return "/placeholder.svg"
  }

  if (error && selectedItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">No Items Selected</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/gallery">
            <Button className="bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white">
              Go to Gallery
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-rose-200/50 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/gallery" className="flex items-center space-x-2">
              <ArrowLeft className="h-6 w-6 text-rose-500" />
              <span className="text-xl font-bold bg-gradient-to-r from-rose-500 to-purple-600 bg-clip-text text-transparent">
                Your AI Style
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              {!isGenerating && (
                <>
                  <Button
                    onClick={handleRegenerate}
                    variant="outline"
                    className="border-rose-300 text-rose-600 hover:bg-rose-50 bg-transparent"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Regenerate
                  </Button>
                  <Button
                    onClick={handleDownload}
                    className="bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white border-0 shadow-lg"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Style
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-rose-500 to-purple-600 bg-clip-text text-transparent">
            Your Personalized Style
          </h1>
          <p className="text-gray-600 text-xl max-w-2xl mx-auto">
            AI-generated outfit based on your fashion preferences
          </p>
          {error && (
            <div className="mt-4 p-4 bg-yellow-100 border border-yellow-300 rounded-lg text-yellow-800">
              <p className="text-sm">{error}</p>
            </div>
          )}
          {generatedImageBase64 && (
            <div className="mt-4 p-4 bg-green-100 border border-green-300 rounded-lg text-green-800">
              <p className="text-sm">✨ New AI-generated style created successfully!</p>
            </div>
          )}
        </div>

        {/* Generated Image Section */}
        <div className="flex justify-center mb-16">
          <div className="relative">
            {isGenerating ? (
              <div className="w-96 h-[600px] bg-white/60 backdrop-blur-sm rounded-3xl border border-rose-200/50 flex items-center justify-center shadow-2xl">
                <div className="text-center">
                  <Sparkles className="h-20 w-20 text-rose-500 mx-auto mb-6 animate-spin" />
                  <h3 className="text-2xl font-semibold mb-4 text-gray-800">Generating Your Style...</h3>
                  <p className="text-gray-600 text-lg">AI is creating your perfect outfit</p>
                  <div className="mt-6 flex justify-center">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-rose-400 rounded-full animate-bounce"></div>
                      <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce delay-100"></div>
                      <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-4">This may take 30-60 seconds...</p>
                </div>
              </div>
            ) : (
              <div className="relative group">
                <Image
                  src={getDisplayImage() || "/placeholder.svg"}
                  alt="AI Generated Style"
                  width={400}
                  height={600}
                  className="rounded-3xl border border-rose-200/50 shadow-2xl"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Floating buttons on image */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-2">
                  <Button
                    onClick={handleRegenerate}
                    size="sm"
                    className="bg-white/90 hover:bg-white text-gray-800 border-0 shadow-lg backdrop-blur-sm"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={handleDownload}
                    size="sm"
                    className="bg-white/90 hover:bg-white text-gray-800 border-0 shadow-lg backdrop-blur-sm"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>

                {/* AI Generated Badge */}
                {generatedImageBase64 && (
                  <div className="absolute bottom-4 left-4">
                    <Badge className="bg-gradient-to-r from-rose-500 to-purple-600 text-white border-0 shadow-lg">
                      ✨ AI Generated
                    </Badge>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Content Grid */}
        {!isGenerating && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Selected Items Section */}
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 border border-rose-200/50 shadow-lg">
              <div className="flex items-center mb-6">
                <Shirt className="h-6 w-6 text-rose-500 mr-3" />
                <h2 className="text-2xl font-semibold text-gray-800">Selected Items</h2>
              </div>

              <div className="space-y-6">
                {selectedItems.map((item) => (
                  <div key={item.id} className="bg-white/80 rounded-2xl p-4 border border-rose-200/30 shadow-sm">
                    <div className="flex items-center space-x-4">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden">
                        <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 mb-1">{item.name}</h4>
                        <Badge variant="outline" className="text-xs border-rose-300 text-rose-600 mb-2">
                          {item.category}
                        </Badge>
                        <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Style Analysis Section */}
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 border border-rose-200/50 shadow-lg">
              <div className="flex items-center mb-6">
                <Palette className="h-6 w-6 text-rose-500 mr-3" />
                <h2 className="text-2xl font-semibold text-gray-800">Style Analysis</h2>
              </div>

              <div className="space-y-8">
                {/* AI Generated Analysis */}
                {styleAnalysis && (
                  <div>
                    <h3 className="font-semibold mb-4 text-rose-600 text-lg">AI Analysis</h3>
                    <div className="bg-white/80 rounded-xl p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Total Items:</span>
                        <span className="font-medium">{styleAnalysis.total_items}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Categories:</span>
                        <span className="font-medium">{styleAnalysis.categories.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Color Variations:</span>
                        <span className="font-medium">{styleAnalysis.dominant_colors.length}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Color Palette */}
                <div>
                  <h3 className="font-semibold mb-4 text-rose-600 text-lg">Color Palette</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[...new Set(selectedItems.map((item) => item.color))].map((color) => (
                      <div key={color} className="flex items-center space-x-3 bg-white/80 rounded-xl p-3">
                        <div className={`w-8 h-8 rounded-full bg-${color}-400 shadow-sm`}></div>
                        <span className="text-sm font-medium capitalize text-gray-700">{color}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Style Themes */}
                <div>
                  <h3 className="font-semibold mb-4 text-rose-600 text-lg">Style Themes</h3>
                  <div className="flex flex-wrap gap-3">
                    {[...new Set(selectedItems.map((item) => item.theme))].map((theme) => (
                      <Badge
                        key={theme}
                        variant="outline"
                        className="text-sm border-rose-300 text-rose-600 px-4 py-2 bg-white/80"
                      >
                        {theme}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Style Description */}
                <div>
                  <h3 className="font-semibold mb-4 text-rose-600 text-lg">Style Description</h3>
                  <div className="bg-white/80 rounded-xl p-4">
                    <p className="text-gray-700 leading-relaxed">{generateStyleDescription()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Style Summary Section */}
        {!isGenerating && (
          <div className="bg-gradient-to-r from-rose-100 to-purple-100 backdrop-blur-sm rounded-3xl p-8 border border-rose-200/50 shadow-lg">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Complete Style Breakdown</h2>
              <p className="text-gray-600 text-lg">Your personalized outfit components and styling details</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Outfit Components */}
              <div className="bg-white/80 rounded-2xl p-6">
                <h3 className="font-semibold mb-4 text-rose-600 text-lg">Outfit Components</h3>
                <ul className="space-y-3">
                  {selectedItems.map((item) => (
                    <li key={item.id} className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-rose-400 rounded-full"></div>
                      <span className="text-gray-700 text-sm">
                        <span className="font-medium">{item.name}</span>
                        <span className="text-gray-500"> ({item.category})</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Style Stats */}
              <div className="bg-white/80 rounded-2xl p-6">
                <h3 className="font-semibold mb-4 text-rose-600 text-lg">Style Statistics</h3>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm text-gray-500">Total Items:</span>
                    <div className="text-2xl font-bold text-gray-800">{selectedItems.length}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Color Variations:</span>
                    <div className="text-2xl font-bold text-gray-800">
                      {[...new Set(selectedItems.map((item) => item.color))].length}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Style Themes:</span>
                    <div className="text-2xl font-bold text-gray-800">
                      {[...new Set(selectedItems.map((item) => item.theme))].length}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="bg-white/80 rounded-2xl p-6">
                <h3 className="font-semibold mb-4 text-rose-600 text-lg">Actions</h3>
                <div className="space-y-3">
                  <Button
                    onClick={handleRegenerate}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white border-0"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Regenerate Style
                  </Button>
                  <Button
                    onClick={handleDownload}
                    className="w-full bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white border-0"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Image
                  </Button>
                  <Link href="/gallery" className="block">
                    <Button
                      variant="outline"
                      className="w-full border-rose-300 text-rose-600 hover:bg-rose-50 bg-transparent"
                    >
                      Create New Style
                    </Button>
                  </Link>
                  <Link href="/" className="block">
                    <Button variant="ghost" className="w-full text-gray-600 hover:bg-gray-50">
                      Back to Home
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
