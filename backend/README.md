# StyleAI Flask Backend

## Setup Instructions

### 1. Install Dependencies
\`\`\`bash
cd backend
pip install -r requirements.txt
\`\`\`

### 2. Environment Setup
\`\`\`bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your actual Gemini API key
# Get your API key from: https://makersuite.google.com/app/apikey
\`\`\`

### 3. Run the Backend
\`\`\`bash
python app.py
\`\`\`

The backend will start on `http://localhost:5000`

## API Endpoints

### POST /generate-style
Generates a new style image based on selected fashion items.

**Request Body:**
\`\`\`json
{
  "selectedItems": [
    {
      "id": "t1",
      "category": "tops",
      "name": "Silk Blouse",
      "description": "Luxurious silk blouse...",
      "color": "white",
      "theme": "elegant",
      "image": "/images/tops/silk-blouse.png"
    }
  ]
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "message": "Style generated successfully",
  "generated_description": "AI generated description...",
  "style_analysis": {
    "total_items": 3,
    "categories": ["tops", "jeans", "footwear"],
    "dominant_colors": ["white", "blue", "black"],
    "style_themes": ["elegant", "casual"],
    "items_used": ["Silk Blouse", "Skinny Jeans", "Heels"]
  },
  "image_url": "/images/generated-style.png",
  "timestamp": "2024-01-01T12:00:00"
}
\`\`\`

### GET /health
Health check endpoint.

## Environment Variables

- `GEMINI_API_KEY`: Your Google Gemini API key
- `FLASK_ENV`: development or production
- `FLASK_DEBUG`: True or False

## Notes

- The current implementation uses Gemini for text generation
- For actual image generation, you may need to integrate with additional services like DALL-E, Midjourney API, or Stable Diffusion
- CORS is enabled for frontend integration
- The backend handles error cases gracefully
