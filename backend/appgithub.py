import os
from google import genai
from google.genai import types
from dotenv import load_dotenv

# --- Configuration ---
load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Use the exact model name you are sure is correct
MODEL_NAME = "gemini-2.0-flash-preview-image-generation"
TEST_PROMPT = "A red silk dress on a mannequin"

# --- Main Diagnostic Function ---
def inspect_api_response():
    """Calls the API and prints every part of the response chunks."""
    if not os.getenv("GEMINI_API_KEY"):
        print("ERROR: GEMINI_API_KEY not found.")
        return

    print(f"--- Calling model: {MODEL_NAME} ---")
    
    try:
        client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
        contents = [types.Content(role="user", parts=[types.Part.from_text(text=TEST_PROMPT)])]
        
        # IMPORTANT: Use the corrected MIME type for this test
        config = types.GenerateContentConfig(response_mime_type="image/png")

        response_stream = client.models.generate_content_stream(
            model=MODEL_NAME,
            contents=contents,
            config=config,
        )

        print("--- Receiving API Response... ---")
        found_data = False
        for chunk in response_stream:
            found_data = True
            print("\n--- NEW CHUNK ---")
            print(chunk)
            print("--- END CHUNK ---")

        if not found_data:
            print("\n!!! The API returned an empty stream. No chunks were received. !!!")

    except Exception as e:
        print(f"\n--- An error occurred during the API call ---")
        print(e)
        print("------------------------------------------")

if __name__ == "__main__":
    inspect_api_response()