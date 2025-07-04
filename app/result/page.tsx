"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, Sparkles, Palette, Shirt, RefreshCw, AlertCircle } from "lucide-react"
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

interface GeneratedImageData {
  base64: string
  filename: string
  image_id: string
  mime_type: string
}

interface StyleAnalysis {
  total_items: number
  categories: string[]
  dominant_colors: string[]
  style_themes: string[]
  items_used: string[]
}

interface ApiResponse {
  success: boolean
  message?: string
  error?: string
  generated_description?: string
  style_analysis?: StyleAnalysis
  image_data?: GeneratedImageData
  image_url?: string
}

export default function ResultPage() {
  const [selectedItems, setSelectedItems] = useState<FashionItem[]>([])
  const [generatedImageData, setGeneratedImageData] = useState<GeneratedImageData | null>(null)
  const [isGenerating, setIsGenerating] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [styleAnalysis, setStyleAnalysis] = useState<StyleAnalysis | null>(null)
  const [generatedDescription, setGeneratedDescription] = useState<string>("")
  const [imageLoadError, setImageLoadError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageUrl, setImageUrl] = useState<string>("")

  useEffect(() => {
    const items = localStorage.getItem("selectedItems")
    if (items) {
      const parsedItems = JSON.parse(items)
      setSelectedItems(parsedItems)
      generateStyleImage(parsedItems)
    } else {
      setError("No items selected. Please go back and select some items.")
      setIsGenerating(false)
    }
  }, [])

  const generateStyleImage = async (items: FashionItem[]) => {
    try {
      setIsGenerating(true)
      setError(null)
      setImageLoadError(false)
      setImageLoaded(false)
      setGeneratedImageData(null)
      setImageUrl("")

      console.log("Sending items to backend:", items)

      const response = await fetch("https://style-ai-hfip.onrender.com/generate-style", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          selectedItems: items,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: ApiResponse = await response.json()

      console.log("Backend response:", data)

      if (data.success && data.image_data) {
        // Set the generated image data
        setGeneratedImageData(data.image_data)
        setStyleAnalysis(data.style_analysis || null)
        setGeneratedDescription(data.generated_description || "")

        // Create image URL with timestamp to avoid caching issues
        const timestamp = new Date().getTime()
        const imageUrl = `https://style-ai-hfip.onrender.com/recent-image?t=${timestamp}`
        setImageUrl(imageUrl)

        console.log("Image generation completed successfully!")
        console.log("Image URL:", imageUrl)
      } else {
        setError(data.error || "Failed to generate image. Please try again.")
        console.error("Generation failed:", data.error)
      }
    } catch (err) {
      console.error("Error generating image:", err)
      setError("Failed to connect to the AI service. Please make sure the backend is running on https://style-ai-hfip.onrender.com")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleRegenerate = () => {
    if (selectedItems.length > 0) {
      generateStyleImage(selectedItems)
    }
  }

  const handleDownload = async () => {
    if (imageUrl) {
      try {
        // Fetch the image from the backend
        const response = await fetch(imageUrl)
        const blob = await response.blob()

        // Create download link
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `ai-style-${Date.now()}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      } catch (err) {
        console.error("Download failed:", err)
        alert("Failed to download image. Please try again.")
      }
    } else if (generatedImageData && generatedImageData.base64) {
      try {
        // Fallback to base64 download
        const link = document.createElement("a")
        link.href = `data:${generatedImageData.mime_type};base64,${generatedImageData.base64}`
        link.download = `ai-style-${generatedImageData.image_id}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } catch (err) {
        console.error("Download failed:", err)
        alert("Failed to download image. Please try again.")
      }
    }
  }

  const handleImageLoad = () => {
    setImageLoaded(true)
    setImageLoadError(false)
    console.log("Image loaded successfully!")
  }

  const handleImageError = () => {
    setImageLoadError(true)
    setImageLoaded(false)
    console.error("Failed to load generated image")
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
            <div className="flex items-center space-x-3">
              {!isGenerating && !error && (
                <Button
                  onClick={handleRegenerate}
                  variant="outline"
                  className="border-rose-300 text-rose-600 hover:bg-rose-50 bg-transparent"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Regenerate
                </Button>
              )}
              {(imageUrl || generatedImageData) && imageLoaded && (
                <Button
                  onClick={handleDownload}
                  className="bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white border-0 shadow-lg"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Style
                </Button>
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
        </div>

        {/* Success/Error Messages */}
        {!isGenerating && (imageUrl || generatedImageData) && imageLoaded && (
          <div className="mb-8 bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded-lg text-center">
            ✨ New AI-generated style created successfully!
          </div>
        )}

        {error && (
          <div className="mb-8 bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-center">
            <AlertCircle className="inline-block mr-2 h-5 w-5" />
            {error}
          </div>
        )}

        {imageLoadError && (imageUrl || generatedImageData) && (
          <div className="mb-8 bg-yellow-100 border border-yellow-300 text-yellow-700 px-4 py-3 rounded-lg text-center">
            <AlertCircle className="inline-block mr-2 h-5 w-5" />
            Failed to display the generated image. Please try regenerating.
          </div>
        )}

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
                </div>
              </div>
            ) : error ? (
              <div className="w-96 h-[600px] bg-white/60 backdrop-blur-sm rounded-3xl border border-red-200/50 flex items-center justify-center shadow-2xl">
                <div className="text-center p-8">
                  <AlertCircle className="h-20 w-20 text-red-500 mx-auto mb-6" />
                  <h3 className="text-2xl font-semibold mb-4 text-gray-800">Generation Failed</h3>
                  <p className="text-gray-600 text-lg mb-6">{error}</p>
                  <Button
                    onClick={handleRegenerate}
                    className="bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white border-0"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Again
                  </Button>
                </div>
              </div>
            ) : imageUrl || generatedImageData ? (
              <div className="relative group">
                {/* Loading overlay while image loads */}
                {!imageLoaded && !imageLoadError && (
                  <div className="absolute inset-0 w-96 h-[600px] bg-white/60 backdrop-blur-sm rounded-3xl border border-rose-200/50 flex items-center justify-center shadow-2xl z-10">
                    <div className="text-center">
                      <Sparkles className="h-12 w-12 text-rose-500 mx-auto mb-4 animate-spin" />
                      <p className="text-gray-600">Loading image...</p>
                    </div>
                  </div>
                )}

                {/* Main Image Display */}
                <div className="w-96 h-[600px] rounded-3xl border border-rose-200/50 shadow-2xl overflow-hidden bg-white">
                  {/* Try to load from URL first, then fallback to base64 */}
                  {imageUrl ? (
                    <img
                      src={imageUrl || "/placeholder.svg"}
                      alt="AI Generated Style"
                      className="w-full h-full object-cover"
                      onLoad={handleImageLoad}
                      onError={(e) => {
                        console.log("URL image failed, trying base64 fallback")
                        // If URL fails, try base64 as fallback
                        if (generatedImageData?.base64) {
                          const target = e.target as HTMLImageElement
                          target.src = `data:${generatedImageData.mime_type};base64,${generatedImageData.base64}`
                        } else {
                          handleImageError()
                        }
                      }}
                      style={{ display: imageLoadError ? "none" : "block" }}
                    />
                  ) : generatedImageData?.base64 ? (
                    <img
                      src={`data:${generatedImageData.mime_type};base64,${generatedImageData.base64}`}
                      alt="AI Generated Style"
                      className="w-full h-full object-cover"
                      onLoad={handleImageLoad}
                      onError={handleImageError}
                      style={{ display: imageLoadError ? "none" : "block" }}
                    />
                  ) : null}

                  {/* Error state for image */}
                  {imageLoadError && (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <div className="text-center p-8">
                        <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-4">Failed to load image</p>
                        <Button
                          onClick={handleRegenerate}
                          size="sm"
                          className="bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white border-0"
                        >
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Regenerate
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Hover overlay with download button */}
                {imageLoaded && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button
                        onClick={handleDownload}
                        size="sm"
                        className="bg-white/90 hover:bg-white text-gray-800 border-0 shadow-lg backdrop-blur-sm"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ) : null}
          </div>
        </div>

        {/* Debug Information (remove in production) */}
        {process.env.NODE_ENV === "development" && (imageUrl || generatedImageData) && (
          <div className="mb-8 bg-gray-100 border border-gray-300 text-gray-700 px-4 py-3 rounded-lg text-sm">
            <strong>Debug Info:</strong>
            <br />
            Image URL: {imageUrl || "Not available"}
            <br />
            Base64 Available: {generatedImageData?.base64 ? "Yes" : "No"}
            <br />
            Base64 Length: {generatedImageData?.base64?.length || 0} characters
            <br />
            Image Loaded: {imageLoaded ? "Yes" : "No"}
            <br />
            Image Error: {imageLoadError ? "Yes" : "No"}
            <br />
            Backend Status: {isGenerating ? "Generating..." : "Complete"}
          </div>
        )}

        {/* Content Grid */}
        {!isGenerating && !error && (imageUrl || generatedImageData) && imageLoaded && (
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
                {/* Color Palette */}
                <div>
                  <h3 className="font-semibold mb-4 text-rose-600 text-lg">Color Palette</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {(styleAnalysis?.dominant_colors || [...new Set(selectedItems.map((item) => item.color))]).map(
                      (color) => (
                        <div key={color} className="flex items-center space-x-3 bg-white/80 rounded-xl p-3">
                          <div className={`w-8 h-8 rounded-full bg-${color}-400 shadow-sm`}></div>
                          <span className="text-sm font-medium capitalize text-gray-700">{color}</span>
                        </div>
                      ),
                    )}
                  </div>
                </div>

                {/* Style Themes */}
                <div>
                  <h3 className="font-semibold mb-4 text-rose-600 text-lg">Style Themes</h3>
                  <div className="flex flex-wrap gap-3">
                    {(styleAnalysis?.style_themes || [...new Set(selectedItems.map((item) => item.theme))]).map(
                      (theme) => (
                        <Badge
                          key={theme}
                          variant="outline"
                          className="text-sm border-rose-300 text-rose-600 px-4 py-2 bg-white/80"
                        >
                          {theme}
                        </Badge>
                      ),
                    )}
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
        {!isGenerating && !error && (imageUrl || generatedImageData) && imageLoaded && styleAnalysis && (
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
                  {(styleAnalysis.items_used || selectedItems.map((item) => item.name)).map((itemName, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-rose-400 rounded-full"></div>
                      <span className="text-gray-700 text-sm">
                        <span className="font-medium">{itemName}</span>
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
                    <div className="text-2xl font-bold text-gray-800">
                      {styleAnalysis.total_items || selectedItems.length}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Color Variations:</span>
                    <div className="text-2xl font-bold text-gray-800">
                      {styleAnalysis.dominant_colors?.length ||
                        [...new Set(selectedItems.map((item) => item.color))].length}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Style Themes:</span>
                    <div className="text-2xl font-bold text-gray-800">
                      {styleAnalysis.style_themes?.length ||
                        [...new Set(selectedItems.map((item) => item.theme))].length}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="bg-white/80 rounded-2xl p-6">
                <h3 className="font-semibold mb-4 text-rose-600 text-lg">Actions</h3>
                <div className="space-y-3">
                  <Button
                    onClick={handleDownload}
                    className="w-full bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white border-0"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Image
                  </Button>
                  <Button
                    onClick={handleRegenerate}
                    variant="outline"
                    className="w-full border-rose-300 text-rose-600 hover:bg-rose-50 bg-transparent"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Regenerate Style
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
