import base64
import os
import uuid
from datetime import datetime
from io import BytesIO

from dotenv import load_dotenv
from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
from PIL import Image
import google.generativeai as genai

# --- Initialization and Configuration ---

# Load environment variables from a .env file
load_dotenv()

# Initialize Flask application
app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing

# Configure the Google Generative AI client
try:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY not found in environment variables.")
    genai.configure(api_key=api_key)
except ValueError as e:
    print(f"ERROR: {e}")
    # Exit if the API key is not configured, as the app cannot function.
    exit("Application cannot start without Gemini API Key.")


# Create directories for storing generated and uploaded images if they don't exist
os.makedirs('generated_images', exist_ok=True)
os.makedirs('uploads', exist_ok=True)


# --- Core Functions ---

def create_style_prompt(selected_items):
    """
    Creates a detailed and structured prompt for the image generation model
    based on a list of selected fashion items.
    """
    # Extract details from the selected items
    categories = list(set([item.get('category', 'N/A') for item in selected_items]))
    colors = list(set([item.get('color', 'N/A') for item in selected_items]))
    themes = list(set([item.get('theme', 'N/A') for item in selected_items]))

    # Build a detailed list of outfit components
    outfit_components = "\n".join(
        [f"- {item.get('name', 'Unknown Item')}: {item.get('description', 'No description.')}" for item in selected_items]
    )

    # Construct the final prompt with clear sections for the AI
    prompt = f"""
    Generate a high-quality, professional fashion photograph of a complete, styled outfit.

    **Outfit Components:**
    {outfit_components}

    **Style Specifications:**
    - **Categories:** {', '.join(categories)}
    - **Color Palette:** {', '.join(colors)}
    - **Style Themes:** {', '.join(themes)}

    **Visual Requirements:**
    - **Setting:** A clean, brightly lit professional photography studio.
    - **Background:** Neutral white or light gray, minimalist.
    - **Model:** A model should be wearing the complete, fully coordinated outfit.
    - **Presentation:** All specified clothing and accessory items must be clearly visible and styled cohesively.
    - **Quality:** The image must be of high-resolution, sharp, and resemble a high-end fashion magazine editorial.
    - **Composition:** The model's pose should be elegant and the overall composition well-balanced.
    - **Aesthetic:** Modern, chic, and sophisticated fashion editorial style.
    - **Aspect Ratio:** 3:4 (portrait orientation).

    Produce a stunning, cohesive image that masterfully combines all these fashion elements into a single, perfectly styled look.
    """
    return prompt.strip()


def generate_image_with_gemini(prompt: str):
    """
    Generates an image using the Gemini API based on the provided prompt.
    """
    try:
        print(f"Generating image with prompt: {prompt[:150]}...")

        # Initialize the model for image generation
        # NOTE: As of now, specific image generation models like 'imagen' are typically used.
        # This example uses a powerful multimodal model capable of understanding the request.
        # The exact model name might differ based on API updates.
        model = genai.GenerativeModel('gemini-2.0-flash-preview-image-generation')

        # Generate content. The API will interpret the detailed prompt to create an image.
        response = model.generate_content(prompt)

        # The response for image generation from such a prompt is expected to contain
        # binary data for the image in its parts.
        image_part = response.parts[0]
        if not hasattr(image_part, 'blob') and not hasattr(image_part, 'data'):
             # Correctly check for image data in the response part
            if image_part.inline_data and image_part.inline_data.data:
                 image_bytes = image_part.inline_data.data
            else:
                raise ValueError("No image data found in the API response.")
        else:
             # Fallback for different response structures if the API changes
             image_bytes = getattr(image_part, 'blob', getattr(image_part, 'data', None))
             if not image_bytes:
                 raise ValueError("Could not extract image bytes from response.")


        # Convert the raw bytes into a PIL Image object
        image = Image.open(BytesIO(image_bytes))

        # Generate a unique filename to prevent collisions
        image_id = str(uuid.uuid4())
        image_filename = f"style_{image_id}.jpeg"
        image_path = os.path.join('generated_images', image_filename)

        # Save the image to the filesystem in JPEG format for consistency
        image.save(image_path, 'JPEG', quality=95)
        print(f"Image saved successfully to {image_path}")

        return {
            'image_path': image_path,
            'image_filename': image_filename,
            'image_id': image_id
        }
    except Exception as e:
        # Provide a detailed error log for debugging
        print(f"An unexpected error occurred during Gemini image generation: {e}")
        # Log the full response if possible, for debugging what the API returned
        if 'response' in locals():
            print(f"API Response: {response}")
        return None


def image_to_base64(image_path: str) -> str | None:
    """Converts an image file to a base64 encoded string."""
    try:
        with open(image_path, "rb") as image_file:
            encoded_string = base64.b64encode(image_file.read()).decode("utf-8")
        return encoded_string
    except FileNotFoundError:
        print(f"Error: Image file not found at {image_path}")
        return None
    except Exception as e:
        print(f"Error converting image to base64: {e}")
        return None


# --- API Endpoints ---

@app.route('/generate-style', methods=['POST'])
def generate_style_endpoint():
    """
    API endpoint to generate a style image from a list of selected fashion items.
    Expects a JSON payload with a 'selectedItems' array.
    """
    try:
        data = request.get_json()
        if not data or 'selectedItems' not in data:
            return jsonify({'success': False, 'error': 'Invalid request: No selectedItems provided.'}), 400

        selected_items = data['selectedItems']
        if not isinstance(selected_items, list) or not selected_items:
            return jsonify({'success': False, 'error': 'Invalid request: selectedItems must be a non-empty array.'}), 400

        print(f"Received {len(selected_items)} items for style generation.")

        # 1. Create the prompt for the AI
        style_prompt = create_style_prompt(selected_items)

        # 2. Generate the image using the Gemini API
        image_result = generate_image_with_gemini(style_prompt)
        if not image_result:
            return jsonify({'success': False, 'error': 'Failed to generate image with AI. See server logs for details.'}), 500

        # 3. Convert the generated image to base64 for the JSON response
        base64_image = image_to_base64(image_result['image_path'])
        if not base64_image:
            return jsonify({'success': False, 'error': 'Failed to process and encode the generated image.'}), 500

        # 4. Assemble the success response
        response_data = {
            'success': True,
            'message': 'Style generated successfully!',
            'generated_description': f"AI-generated outfit from {len(selected_items)} selected fashion items.",
            'style_analysis': {
                'total_items': len(selected_items),
                'categories': list(set(item.get('category') for item in selected_items)),
                'dominant_colors': list(set(item.get('color') for item in selected_items)),
                'style_themes': list(set(item.get('theme') for item in selected_items)),
                'items_used': [item.get('name') for item in selected_items]
            },
            'timestamp': datetime.now().isoformat(),
            'image_data': {
                'base64': base64_image,
                'filename': image_result['image_filename'],
                'image_id': image_result['image_id'],
                'mime_type': 'image/jpeg'
            },
            'image_url': f"/generated-image/{image_result['image_id']}"
        }

        print("Successfully generated and processed image. Sending response.")
        return jsonify(response_data), 200

    except Exception as e:
        print(f"A general error occurred in /generate-style endpoint: {e}")
        return jsonify({'success': False, 'error': f'An unexpected server error occurred: {str(e)}'}), 500


@app.route('/generated-image/<image_id>', methods=['GET'])
def serve_generated_image(image_id):
    """Serves a previously generated image file by its unique ID."""
    try:
        # Sanitize the image_id to prevent directory traversal attacks
        if not image_id or not image_id.isalnum() and '-' not in image_id:
            return jsonify({'success': False, 'error': 'Invalid image ID format.'}), 400

        image_filename = f"style_{image_id}.jpeg"
        image_path = os.path.join('generated_images', image_filename)

        if not os.path.exists(image_path):
            return jsonify({'success': False, 'error': 'Image not found.'}), 404

        return send_file(image_path, mimetype='image/jpeg')

    except Exception as e:
        print(f"Error serving image {image_id}: {e}")
        return jsonify({'success': False, 'error': 'Failed to serve image due to a server error.'}), 500


@app.route('/health', methods=['GET'])
def health_check():
    """A simple health check endpoint to verify the service is running."""
    return jsonify({
        'status': 'healthy',
        'message': 'StyleAI Backend with Gemini API is running',
        'timestamp': datetime.now().isoformat(),
        'api_configured': bool(os.getenv("GEMINI_API_KEY"))
    }), 200


# --- Application Runner ---

if __name__ == '__main__':
    print("Starting StyleAI Flask Backend with Gemini API...")
    # The API key check is now handled at the start of the script.
    app.run(host='0.0.0.0', port=5000, debug=True)