import base64
import mimetypes
import os
import uuid
from datetime import datetime
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from google import genai
import base64
from PIL import Image
import io
from google.genai import types

# Initialize Flask application
app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing

# Create directories for storing generated images
os.makedirs('generated_images', exist_ok=True)

def save_binary_file(file_name, data):
    """Save binary data to file"""
    image_data = base64.b64decode(data)  # data_buffer = base64 string
    # Step 2: Wrap in BytesIO
    image_stream = io.BytesIO(image_data)
    # Step 3: Open with Pillow
    image = Image.open(image_stream)
    image_path = os.path.join('generated_images', file_name)
    image.save("recent.png")  # Save in root directory
    print(f"Image saved as recent.png")
    return "recent.png"

def create_style_prompt(selected_items):
    """Create a detailed prompt for image generation based on selected fashion items"""
    
    # Extract details from selected items
    categories = list(set([item.get('category', 'N/A') for item in selected_items]))
    colors = list(set([item.get('color', 'N/A') for item in selected_items]))
    themes = list(set([item.get('theme', 'N/A') for item in selected_items]))
    
    # Build detailed outfit components
    outfit_components = "\n".join([
        f"- {item.get('name', 'Unknown Item')}: {item.get('description', 'No description.')}" 
        for item in selected_items
    ])
    
    # Create comprehensive prompt
    prompt = f"""
    Create a high-quality, professional fashion photograph of a complete styled outfit and showcase it on a woman model.

    OUTFIT COMPONENTS:
    {outfit_components}

    STYLE SPECIFICATIONS:
    - Categories: {', '.join(categories)}
    - Color Palette: {', '.join(colors)}
    - Style Themes: {', '.join(themes)}

    VISUAL REQUIREMENTS:
    - Fashion outfit should be shown on a woman model
    - Professional fashion photography studio setting
    - Clean, well-lit environment with neutral white/gray background
    - Model wearing the complete coordinated outfit
    - All specified items clearly visible and well-styled
    - High-resolution, sharp focus, editorial quality
    - Elegant model pose, sophisticated composition
    - Modern fashion magazine aesthetic
    - Portrait orientation (3:4 aspect ratio)

    Generate a stunning, cohesive fashionable image of a woman whose outfit combines all these elements into one perfectly styled look.
    """
    
    return prompt.strip()

def generate_image_with_gemini(prompt):
    """Generate image using Gemini API based on the provided prompt"""
    try:
        print(f"Generating image with prompt: {prompt[:100]}...")
        
        # Initialize Gemini client
        client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
        model = "gemini-2.0-flash-preview-image-generation"
        
        # Create content for the API
        contents = [
            types.Content(
                role="user",
                parts=[
                    types.Part.from_text(text=prompt),
                ],
            ),
        ]
        
        # Configure generation settings
        generate_content_config = types.GenerateContentConfig(
            response_modalities=["IMAGE", "TEXT"],
            response_mime_type="text/plain",
        )
        
        # Generate unique filename
        image_id = str(uuid.uuid4())
        file_index = 0
        generated_file_path = None
        
        # Generate content using streaming
        for chunk in client.models.generate_content_stream(
            model=model,
            contents=contents,
            config=generate_content_config,
        ):
            if (
                chunk.candidates is None
                or chunk.candidates[0].content is None
                or chunk.candidates[0].content.parts is None
            ):
                continue
            
            # Check for image data
            if (chunk.candidates[0].content.parts[0].inline_data and 
                chunk.candidates[0].content.parts[0].inline_data.data):
                
                file_name = f"style_{image_id}_{file_index}"
                file_index += 1
                
                inline_data = chunk.candidates[0].content.parts[0].inline_data
                data_buffer = inline_data.data
                file_extension = mimetypes.guess_extension(inline_data.mime_type) or '.png'
                
                # Save to generated_images directory
                full_file_path = f"{file_name}{file_extension}"
                generated_file_path = save_binary_file(full_file_path, data_buffer)
                
                print(f"Image generated successfully: {generated_file_path}")
                break
            else:
                # Print any text output
                if hasattr(chunk, 'text') and chunk.text:
                    print(f"API Response: {chunk.text}")
        
        if generated_file_path:
            return {
                'image_path': generated_file_path,
                'image_filename': 'recent.png',
                'image_id': 'recent'
            }
        else:
            print("No image was generated")
            return None
            
    except Exception as e:
        print(f"Error generating image with Gemini: {e}")
        return None

def image_to_base64(image_path):
    """Convert image file to base64 string"""
    try:
        with open(image_path, "rb") as image_file:
            encoded_string = base64.b64encode(image_file.read()).decode("utf-8")
        return encoded_string
    except Exception as e:
        print(f"Error converting image to base64: {e}")
        return None

@app.route('/generate-style', methods=['POST'])
def generate_style():
    """
    Main route to generate style image based on selected fashion items
    Expects JSON payload with selectedItems array
    """
    try:
        # Get request data
        data = request.get_json()
        
        if not data or 'selectedItems' not in data:
            return jsonify({
                'success': False,
                'error': 'Invalid request: No selectedItems provided.'
            }), 400

        selected_items = data['selectedItems']
        
        if not isinstance(selected_items, list) or not selected_items:
            return jsonify({
                'success': False,
                'error': 'Invalid request: selectedItems must be a non-empty array.'
            }), 400

        print(f"Received {len(selected_items)} items for style generation.")

        # Create the prompt for AI
        style_prompt = create_style_prompt(selected_items)
        print(f"Generated prompt length: {len(style_prompt)} characters")

        # Generate image using Gemini API
        image_result = generate_image_with_gemini(style_prompt)

        if not image_result:
            return jsonify({
                'success': False,
                'error': 'Failed to generate image with AI. Please try again.'
            }), 500

        # Convert generated image to base64
        recent_image_path = "recent.png"
        
        # Make sure the file exists
        if not os.path.exists(recent_image_path):
            return jsonify({
                'success': False,
                'error': 'recent.png not found on the server.'
            }), 500

        # Encode recent.png into base64
        base64_image = image_to_base64(recent_image_path)

        if not base64_image:
            return jsonify({
                'success': False,
                'error': 'Failed to process and encode recent.png.'
            }), 500

        # Create success response
        response_data = {
            'success': True,
            'message': 'Style generated successfully!',
            'generated_description': f"AI-generated outfit combining {len(selected_items)} selected fashion items into a cohesive, stylish look.",
            'style_analysis': {
                'total_items': len(selected_items),
                'categories': list(set(item.get('category') for item in selected_items if item.get('category'))),
                'dominant_colors': list(set(item.get('color') for item in selected_items if item.get('color'))),
                'style_themes': list(set(item.get('theme') for item in selected_items if item.get('theme'))),
                'items_used': [item.get('name') for item in selected_items if item.get('name')]
            },
            'timestamp': datetime.now().isoformat(),
            'image_data': {
                'base64': base64_image,
                'filename': 'recent.png',
                'image_id': 'recent',
                'mime_type': 'image/png'
            },
            'image_url': '/recent-image'
        }

        print("Successfully generated and processed image. Sending response.")
        return jsonify(response_data), 200

    except Exception as e:
        print(f"Error in /generate-style endpoint: {e}")
        return jsonify({
            'success': False,
            'error': f'Server error: {str(e)}'
        }), 500

@app.route('/recent-image', methods=['GET'])
def serve_recent_image():
    """Serve the most recent generated image"""
    try:
        recent_image_path = "recent.png"
        if os.path.exists(recent_image_path):
            return send_file(recent_image_path, mimetype='image/png')
        else:
            return jsonify({
                'success': False,
                'error': 'Recent image not found.'
            }), 404
    except Exception as e:
        print(f"Error serving recent image: {e}")
        return jsonify({
            'success': False,
            'error': 'Failed to serve recent image.'
        }), 500

@app.route('/generated-image/<image_id>', methods=['GET'])
def serve_generated_image(image_id):
    """Serve generated images by ID"""
    try:
        # For recent image
        if image_id == 'recent':
            return serve_recent_image()
            
        # Find the image file with the given ID
        for filename in os.listdir('generated_images'):
            if image_id in filename:
                image_path = os.path.join('generated_images', filename)
                if os.path.exists(image_path):
                    return send_file(image_path, mimetype='image/jpeg')
        
        return jsonify({
            'success': False,
            'error': 'Image not found.'
        }), 404

    except Exception as e:
        print(f"Error serving image {image_id}: {e}")
        return jsonify({
            'success': False,
            'error': 'Failed to serve image.'
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'StyleAI Backend with Gemini API is running',
        'timestamp': datetime.now().isoformat(),
        'api_configured': bool(os.environ.get("GEMINI_API_KEY")),
        'model': 'gemini-2.0-flash-preview-image-generation',
        'recent_image_exists': os.path.exists('recent.png')
    }), 200

if __name__ == '__main__':
    # Check API key configuration
    if not os.environ.get("GEMINI_API_KEY"):
        print("WARNING: GEMINI_API_KEY environment variable not set!")
        print("Please set your Gemini API key before running the server.")
        print("Example: export GEMINI_API_KEY='your_api_key_here'")
    else:
        print("✅ Gemini API key configured")
    
    print("Starting StyleAI Flask Backend...")
    print("Model: gemini-2.0-flash-preview-image-generation")
    print("Generated images will be saved as: recent.png")
    print("Server will run on: http://localhost:5000")
    
    # Run the Flask app
    app.run(host='0.0.0.0', port=5000, debug=True)
