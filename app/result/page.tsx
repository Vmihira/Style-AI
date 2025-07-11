"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Download,
  Sparkles,
  Palette,
  Shirt,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

interface FashionItem {
  id: string;
  category: string;
  name: string;
  description: string;
  color: string;
  theme: string;
  image: string;
}

interface GeneratedImageData {
  base64: string;
  image_id: string;
  mime_type: string;
}

interface StyleAnalysis {
  total_items: number;
  categories: string[];
  dominant_colors: string[];
  style_themes: string[];
  items_used: string[];
}

interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
  generated_description?: string;
  style_analysis?: StyleAnalysis;
  image_data?: GeneratedImageData;
}

export default function ResultPage() {
  const [selectedItems, setSelectedItems] = useState<FashionItem[]>([]);
  const [generatedImageData, setGeneratedImageData] =
    useState<GeneratedImageData | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [styleAnalysis, setStyleAnalysis] = useState<StyleAnalysis | null>(
    null
  );
  const [generatedDescription, setGeneratedDescription] = useState<string>("");
  const [imageLoadError, setImageLoadError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [generationProgress, setGenerationProgress] = useState("");
  const [imageBlob, setImageBlob] = useState<string | null>(null);

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

  const createImageBlob = useCallback(
    (base64Data: string, mimeType: string) => {
      try {
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);

        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mimeType });
        const blobUrl = URL.createObjectURL(blob);

        console.log(`Created blob URL: ${blobUrl}`);
        return blobUrl;
      } catch (error) {
        console.error("Error creating blob:", error);
        return null;
      }
    },
    []
  );

  const generateStyleImage = useCallback(
    async (items: FashionItem[]) => {
      setIsGenerating(true);
      setError(null);
      setImageLoadError(false);
      setImageLoaded(false);
      setGeneratedImageData(null);
      setGenerationProgress("Preparing your style request...");

      if (imageBlob) {
        URL.revokeObjectURL(imageBlob);
        setImageBlob(null);
      }

      try {
        setGenerationProgress("Connecting to AI service...");

        const response = await fetch("https://style-backend-yuy3.onrender.com/generate-style", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ selectedItems: items }),
        });

        setGenerationProgress("Processing AI response...");
        const result: ApiResponse = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.error || "Failed to generate style from backend."
          );
        }

        // If the API call was successful, update the state
        if (
          result.image_data &&
          result.style_analysis &&
          result.generated_description
        ) {
          const blobUrl = createImageBlob(
            result.image_data.base64,
            result.image_data.mime_type
          );
          if (blobUrl) {
            setImageBlob(blobUrl);
          }
          setGeneratedImageData(result.image_data);
          setStyleAnalysis(result.style_analysis);
          setGeneratedDescription(result.generated_description);
          setGenerationProgress("Image ready!");
        } else {
          throw new Error("Incomplete data received from the server.");
        }
       } catch (err: unknown) {
        console.error("Error generating image:", err);
        let errorMessage = "Failed to generate image. Please try again.";

        if (err instanceof Error) {
          if (err.message.includes("Failed to fetch")) {
            errorMessage = "Could not connect to the backend. Is it running on port 5000?";
          } else {
            errorMessage = err.message;
          }
        }

        setError(errorMessage);
      }
  finally {
        setIsGenerating(false);
        setGenerationProgress("");
      }
    },
    [createImageBlob, imageBlob]
  );

  const handleRegenerate = useCallback(() => {
    if (selectedItems.length > 0) {
      generateStyleImage(selectedItems);
    }
  }, [selectedItems, generateStyleImage]);

  const handleDownload = useCallback(() => {
  if (generatedImageData && generatedImageData.base64) {
    try {
      if (imageBlob) {
        const link = document.createElement("a");
        link.href = imageBlob;
        link.download = `ai-style-${Date.now()}.png`;  // Changed this line
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        console.log("Image download initiated via blob");
      } else {
        const link = document.createElement("a");
        link.href = `data:${generatedImageData.mime_type};base64,${generatedImageData.base64}`;
        link.download = `ai-style-${Date.now()}.png`;  // Changed this line
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        console.log("Image download initiated via base64");
      }
    } catch (err) {
      console.error("Download failed:", err);
      alert("Failed to download image. Please try regenerating the image.");
    }
  } else {
    alert("No image available for download.");
  }
}, [generatedImageData, imageBlob]);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
    setImageLoadError(false);
    console.log("Image loaded successfully in UI!");
  }, []);



const handleImageError = useCallback(
  (e: React.SyntheticEvent<HTMLImageElement>) => {
    setImageLoadError(true);
    setImageLoaded(false);
    console.error("Failed to load generated image in UI:", e);

    if (imageBlob && generatedImageData) {
      console.log("Blob URL failed, trying base64 fallback...");
      setImageBlob(null);
    }
  },
  [imageBlob, generatedImageData]
);


  const generateStyleDescription = useCallback(() => {
    if (generatedDescription) {
      return generatedDescription;
    }
    if (selectedItems.length === 0) return "";

    const themes = [...new Set(selectedItems.map((item) => item.theme))];
    const colors = [...new Set(selectedItems.map((item) => item.color))];

    return `This AI-generated style combines ${themes.join(
      ", "
    )} aesthetics with a ${colors.join(
      ", "
    )} color palette. The outfit features ${selectedItems
      .map((item) => item.name.toLowerCase())
      .join(
        ", "
      )}, creating a harmonious and fashionable look that reflects your personal style preferences.`;
  }, [generatedDescription, selectedItems]);

  const getImageSrc = useCallback(() => {
    if (imageBlob) {
      return imageBlob;
    }
    if (generatedImageData && generatedImageData.base64) {
      return `data:${generatedImageData.mime_type};base64,${generatedImageData.base64}`;
    }
    return "";
  }, [imageBlob, generatedImageData]);

  useEffect(() => {
    return () => {
      if (imageBlob) {
        URL.revokeObjectURL(imageBlob);
      }
    };
  }, [imageBlob]);

  const handleBackToGallery = () => {
    console.log("Navigating back to gallery");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-rose-200/50 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBackToGallery}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-6 w-6 text-rose-500" />
              <span className="text-xl font-bold bg-gradient-to-r from-rose-500 to-purple-600 bg-clip-text text-transparent">
                Your AI Style
              </span>
            </button>
            <div className="flex items-center space-x-3">
              {!isGenerating && !error && (
                <Button
                  onClick={handleRegenerate}
                  variant="outline"
                  className="border-rose-300 text-rose-600 hover:bg-rose-50 bg-transparent"
                  disabled={isGenerating}
                >
                  <RefreshCw
                    className={`mr-2 h-4 w-4 ${
                      isGenerating ? "animate-spin" : ""
                    }`}
                  />
                  Regenerate
                </Button>
              )}
              {generatedImageData && imageLoaded && (
                <Button
                  onClick={handleDownload}
                  className="bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white border-0 shadow-lg"
                  disabled={!imageLoaded}
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
        {!isGenerating && generatedImageData && imageLoaded && (
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

        {imageLoadError && generatedImageData && (
          <div className="mb-8 bg-yellow-100 border border-yellow-300 text-yellow-700 px-4 py-3 rounded-lg text-center">
            <AlertCircle className="inline-block mr-2 h-5 w-5" />
            Failed to display the generated image. This might be due to image
            size or format issues.
          </div>
        )}

        {/* Generated Image Section */}
        <div className="flex justify-center mb-16">
          <div className="relative">
            {isGenerating ? (
              <div className="w-96 h-[600px] bg-white/60 backdrop-blur-sm rounded-3xl border border-rose-200/50 flex items-center justify-center shadow-2xl">
                <div className="text-center">
                  <Sparkles className="h-20 w-20 text-rose-500 mx-auto mb-6 animate-spin" />
                  <h3 className="text-2xl font-semibold mb-4 text-gray-800">
                    Generating Your Style...
                  </h3>
                  <p className="text-gray-600 text-lg mb-4">
                    AI is creating your perfect outfit
                  </p>
                  {generationProgress && (
                    <p className="text-gray-500 text-sm mb-4">
                      {generationProgress}
                    </p>
                  )}
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
                  <h3 className="text-2xl font-semibold mb-4 text-gray-800">
                    Generation Failed
                  </h3>
                  <p className="text-gray-600 text-lg mb-6">{error}</p>
                  <Button
                    onClick={handleRegenerate}
                    className="bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white border-0"
                    disabled={isGenerating}
                  >
                    <RefreshCw
                      className={`mr-2 h-4 w-4 ${
                        isGenerating ? "animate-spin" : ""
                      }`}
                    />
                    Try Again
                  </Button>
                </div>
              </div>
            ) : generatedImageData ? (
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
                  {getImageSrc() && (
                    <img
                      src={getImageSrc()}
                      alt="AI Generated Style"
                      className="w-full h-full object-cover"
                      onLoad={handleImageLoad}
                      onError={handleImageError}
                      style={{ display: imageLoadError ? "none" : "block" }}
                      crossOrigin="anonymous"
                    />
                  )}

                  {/* Error state for image */}
                  {imageLoadError && (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <div className="text-center p-8">
                        <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-4">
                          Failed to load image
                        </p>
                        <p className="text-gray-500 text-sm mb-4">
                          This might be due to image size or browser limitations
                        </p>
                        <Button
                          onClick={handleRegenerate}
                          size="sm"
                          className="bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white border-0"
                          disabled={isGenerating}
                        >
                          <RefreshCw
                            className={`mr-2 h-4 w-4 ${
                              isGenerating ? "animate-spin" : ""
                            }`}
                          />
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

        {/* Content Grid */}
        {!isGenerating && !error && generatedImageData && imageLoaded && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Selected Items Section */}
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 border border-rose-200/50 shadow-lg">
              <div className="flex items-center mb-6">
                <Shirt className="h-6 w-6 text-rose-500 mr-3" />
                <h2 className="text-2xl font-semibold text-gray-800">
                  Selected Items
                </h2>
              </div>
              <div className="space-y-6">
                {selectedItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white/80 rounded-2xl p-4 border border-rose-200/30 shadow-sm"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src =
                              "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zMiAyMEMyNi40NzcgMjAgMjIgMjQuNDc3IDIyIDMwQzIyIDM1LjUyMyAyNi40NzcgNDAgMzIgNDBDMzcuNTIzIDQwIDQyIDM1LjUyMyA0MiAzMEM0MiAyNC40NzcgMzcuNTIzIDIwIDMyIDIwWiIgZmlsbD0iI0Q1RDlERiIvPgo8L3N2Zz4K";
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 mb-1">
                          {item.name}
                        </h4>
                        <Badge
                          variant="outline"
                          className="text-xs border-rose-300 text-rose-600 mb-2"
                        >
                          {item.category}
                        </Badge>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {item.description}
                        </p>
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
                <h2 className="text-2xl font-semibold text-gray-800">
                  Style Analysis
                </h2>
              </div>
              <div className="space-y-8">
                {/* Color Palette */}
                <div>
                  <h3 className="font-semibold mb-4 text-rose-600 text-lg">
                    Color Palette
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {(
                      styleAnalysis?.dominant_colors || [
                        ...new Set(selectedItems.map((item) => item.color)),
                      ]
                    ).map((color) => (
                      <div
                        key={color}
                        className="flex items-center space-x-3 bg-white/80 rounded-xl p-3"
                      >
                        <div
                          className={`w-8 h-8 rounded-full bg-${color}-400 shadow-sm`}
                        ></div>
                        <span className="text-sm font-medium capitalize text-gray-700">
                          {color}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Style Themes */}
                <div>
                  <h3 className="font-semibold mb-4 text-rose-600 text-lg">
                    Style Themes
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {(
                      styleAnalysis?.style_themes || [
                        ...new Set(selectedItems.map((item) => item.theme)),
                      ]
                    ).map((theme) => (
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
                  <h3 className="font-semibold mb-4 text-rose-600 text-lg">
                    Style Description
                  </h3>
                  <div className="bg-white/80 rounded-xl p-4">
                    <p className="text-gray-700 leading-relaxed">
                      {generateStyleDescription()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Style Summary Section */}
        {!isGenerating &&
          !error &&
          generatedImageData &&
          imageLoaded &&
          styleAnalysis && (
            <div className="bg-gradient-to-r from-rose-100 to-purple-100 backdrop-blur-sm rounded-3xl p-8 border border-rose-200/50 shadow-lg">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  Complete Style Breakdown
                </h2>
                <p className="text-gray-600 text-lg">
                  Your personalized outfit components and styling details
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Outfit Components */}
                <div className="bg-white/80 rounded-2xl p-6">
                  <h3 className="font-semibold mb-4 text-rose-600 text-lg">
                    Outfit Components
                  </h3>
                  <ul className="space-y-3">
                    {(
                      styleAnalysis.items_used ||
                      selectedItems.map((item) => item.name)
                    ).map((itemName, index) => (
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
                  <h3 className="font-semibold mb-4 text-rose-600 text-lg">
                    Style Statistics
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <span className="text-sm text-gray-500">
                        Total Items:
                      </span>
                      <div className="text-2xl font-bold text-gray-800">
                        {styleAnalysis.total_items || selectedItems.length}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">
                        Color Variations:
                      </span>
                      <div className="text-2xl font-bold text-gray-800">
                        {styleAnalysis.dominant_colors?.length ||
                          [...new Set(selectedItems.map((item) => item.color))]
                            .length}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">
                        Style Themes:
                      </span>
                      <div className="text-2xl font-bold text-gray-800">
                        {styleAnalysis.style_themes?.length ||
                          [...new Set(selectedItems.map((item) => item.theme))]
                            .length}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="bg-white/80 rounded-2xl p-6">
                  <h3 className="font-semibold mb-4 text-rose-600 text-lg">
                    Actions
                  </h3>
                  <div className="space-y-3">
                    <Button
                      onClick={handleDownload}
                      className="w-full bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white border-0"
                      disabled={!imageLoaded}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download Image
                    </Button>
                    <Button
                      onClick={handleRegenerate}
                      variant="outline"
                      className="w-full border-rose-300 text-rose-600 hover:bg-rose-50 bg-transparent"
                      disabled={isGenerating}
                    >
                      <RefreshCw
                        className={`mr-2 h-4 w-4 ${
                          isGenerating ? "animate-spin" : ""
                        }`}
                      />
                      Regenerate Style
                    </Button>
                    <Button
                      onClick={handleBackToGallery}
                      variant="outline"
                      className="w-full border-rose-300 text-rose-600 hover:bg-rose-50 bg-transparent"
                    >
                      Create New Style
                    </Button>
                    <Button
                      onClick={() => console.log("Back to home")}
                      variant="ghost"
                      className="w-full text-gray-600 hover:bg-rose-50/50 hover:text-rose-600"
                    >
                      Back to Home
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}

