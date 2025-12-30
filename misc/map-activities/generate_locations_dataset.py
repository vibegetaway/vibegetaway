#!/usr/bin/env python3
"""
Location Dataset Generator using Gemini 2.5 Flash Lite with Maps Grounding

This script generates a CSV dataset of global tourist locations with activities,
using Google's Gemini AI with Maps grounding for accurate location data.
Includes Unsplash API integration for location images.
"""

import csv
import os
import sys
from typing import List, Dict, Optional
from google import genai
from google.genai import types
import json
import random
import time
import requests
import re

# Configuration
DEFAULT_NUM_ENTRIES = 3000
BATCH_SIZE = 10  # Number of locations to generate per API call
OUTPUT_FILE = "global_locations_dataset.csv"

# Activity categories for diverse sampling
ACTIVITY_CATEGORIES = [
    "water sports (kayaking, surfing, diving, snorkeling)",
    "landmark sightseeing (towers, monuments, historical sites)",
    "cultural experiences (museums, temples, local markets)",
    "adventure activities (hiking, climbing, zip-lining)",
    "food and dining (restaurants, street food, cooking classes)",
    "wildlife and nature (safaris, parks, beaches)",
    "winter sports (skiing, snowboarding, ice skating)",
    "urban exploration (city tours, street art, shopping)",
    "relaxation and wellness (spas, hot springs, yoga retreats)",
    "nightlife and entertainment (clubs, theaters, festivals)"
]

# Regions for balanced global coverage
WORLD_REGIONS = [
    "Southeast Asia",
    "East Asia",
    "South Asia",
    "Middle East",
    "Europe (Western)",
    "Europe (Eastern)",
    "Africa (North)",
    "Africa (Sub-Saharan)",
    "North America",
    "Central America",
    "South America",
    "Caribbean",
    "Australia and Oceania",
    "Pacific Islands"
]


def get_unsplash_image(location: str, activity: str, country: str, unsplash_key: Optional[str] = None) -> str:
    """
    Get an image URL from Unsplash based on location and activity.
    Uses the same approach as the Next.js API route.
    
    Args:
        location: Location name
        activity: Activity type
        country: Country name
        
    Returns:
        Image URL from Unsplash, or empty string if not found
    """
    try:
        # Get Unsplash Access Key from argument or environment
        api_key_to_use = unsplash_key or os.environ.get('UNSPLASH_ACCESS_KEY')
        
        if api_key_to_use:
            # Use official Unsplash API (same as Next.js implementation)
            # Use cleaner keywords for API search too
            clean_location = re.sub(r'[^\w\s]', '', location)
            clean_country = re.sub(r'[^\w\s]', '', country)
            keywords = f"{clean_location} {clean_country}"
            
            url = f"https://api.unsplash.com/search/photos?query={requests.utils.quote(keywords)}&per_page=1"
            
            try:
                response = requests.get(
                    url,
                    headers={'Authorization': f'Client-ID {api_key_to_use}'},
                    timeout=10
                )
                
                if response.ok:
                    data = response.json()
                    if data.get('results') and len(data['results']) > 0:
                        photo = data['results'][0]
                        # Return the regular size URL (same as Next.js default)
                        return photo['urls']['regular']
                elif response.status_code == 403:
                    print(f"Warning: Unsplash API Rate Limit Exceeded (403). Falling back to Source API.")
                    # Force fallback
                    raise requests.RequestException("Rate limit exceeded")
                else:
                    print(f"Warning: Unsplash API returned status {response.status_code} for {location}")
            except requests.RequestException as e:
                # Don't print stack trace for rate limit, just the warning
                if "Rate limit exceeded" not in str(e):
                    print(f"Warning: Unsplash API request failed for {location}: {e}")
        
        # Fallback to Unsplash Source API if no access key or API call fails
        # Simplify keywords: just location and country, remove special chars
        clean_location = re.sub(r'[^\w\s]', '', location)
        clean_country = re.sub(r'[^\w\s]', '', country)
        
        # Combine just location and country for source API to be safer
        keywords = f"{clean_location},{clean_country}".replace(' ', ',')
        image_url = f"https://source.unsplash.com/800x600/?{keywords}"
        return image_url
        
    except Exception as e:
        print(f"Warning: Failed to get image for {location}: {e}")
        return ""


def setup_gemini_api(api_key: str):
    """Configure the Gemini API with the provided key."""
    return genai.Client(api_key=api_key)


def generate_location_batch(client, region: str, activity_category: str, batch_size: int) -> List[Dict]:
    """
    Generate a batch of location entries using Gemini with Maps grounding.
    
    Args:
        client: The Gemini client instance
        region: Geographic region to focus on
        activity_category: Type of activities to suggest
        batch_size: Number of locations to generate
        
    Returns:
        List of location dictionaries
    """
    
    prompt = f"""Generate {batch_size} diverse tourist locations in {region} focused on {activity_category}.
    
    You must output valid JSON only. Do not wrap the output in markdown blocks (e.g. ```json ... ```) or any other text.
    Return a SINGLE JSON array containing the objects. Do not include any text before or after the array.

For each location, provide:
1. Location name (specific place/attraction, city, or region)
2. Country
3. Latitude and longitude coordinates
4. Specific activity available there
5. Brief one-line description (max 100 characters)
6. Price classification (e.g. $, $$, $$$, $$$$, $$$$$)
7. Activity tags (comma-separated, 2-4 tags like "adventure,outdoor,family-friendly")
8. Prominence score (1-10): Rate the global fame/importance of this location
   - 9-10: World-famous icons (Eiffel Tower, Great Wall of China, Taj Mahal)
   - 7-8: Major landmarks (Tokyo Tower, Sydney Opera House)
   - 5-6: Well-known attractions (regional landmarks, popular beaches)
   - 3-4: Lesser-known but notable places
   - 1-2: Hidden gems, local favorites

Return ONLY a valid JSON array with this exact structure:
[
  {{
    "location": "specific place name",
    "country": "country name",
    "latitude": 0.0,
    "longitude": 0.0,
    "activity": "specific activity",
    "description": "brief description",
    "price_class": "$$",
    "tags": "tag1,tag2,tag3",
    "prominence_score": 7
  }}
]

Ensure diverse, real locations with accurate coordinates. Mix popular and off-the-beaten-path spots."""

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash-lite',
            contents=prompt,
            config=types.GenerateContentConfig(
                tools=[types.Tool(google_search=types.GoogleSearch())]
            )
        )
        
        # Extract JSON from response
        response_text = response.text.strip()
                
        # Robust JSON extraction
        try:
            # Try to find the first '[' and the last ']'
            start_index = response_text.find('[')
            end_index = response_text.rfind(']')
            
            if start_index != -1 and end_index != -1 and end_index > start_index:
                json_str = response_text[start_index : end_index + 1]
            else:
                json_str = response_text

            return json.loads(json_str)

        except json.JSONDecodeError as e:
            # Handle "Extra data" error (multiple JSON objects concatenated)
            if "Extra data" in str(e):
                try:
                    # Truncate at the position where the first valid JSON ended
                    truncated_json = json_str[:e.pos]
                    return json.loads(truncated_json)
                except Exception as nested_e:
                     print(f"Warning: Failed to recover from Extra data error: {nested_e}")
            
            print(f"Warning: Failed to parse JSON response: {e}")
            return []
    
    except json.JSONDecodeError as e:
        print(f"Warning: Failed to parse JSON response: {e}")
        print(f"Response was: {response_text[:200]}")
        return []
    except Exception as e:
        print(f"Warning: Error generating batch: {e}")
        return []


def generate_dataset(api_key: str, num_entries: int = DEFAULT_NUM_ENTRIES, output_file: str = OUTPUT_FILE, unsplash_key: Optional[str] = None):
    """
    Generate the complete dataset.
    
    Args:
        api_key: Google Gemini API key
        num_entries: Total number of entries to generate
        output_file: Output CSV filename
        unsplash_key: Optional Unsplash Access Key
    """
    
    print(f"🌍 Starting generation of {num_entries} location entries...")
    print(f"📝 Output file: {output_file}")
    
    # Setup API client
    client = setup_gemini_api(api_key)
    
    # Calculate batches needed
    total_batches = (num_entries + BATCH_SIZE - 1) // BATCH_SIZE
    
    # Open CSV file
    with open(output_file, 'w', newline='', encoding='utf-8') as csvfile:
        fieldnames = ['location', 'country', 'latitude', 'longitude', 'activity', 'description', 'price_class', 'prominence_score', 'tags', 'image_url']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        
        entries_generated = 0
        batch_num = 0
        
        # Generate batches
        while entries_generated < num_entries:
            batch_num += 1
            remaining = num_entries - entries_generated
            current_batch_size = min(BATCH_SIZE, remaining)
            
            # Select region and activity category for diversity
            region = WORLD_REGIONS[batch_num % len(WORLD_REGIONS)]
            activity_category = ACTIVITY_CATEGORIES[batch_num % len(ACTIVITY_CATEGORIES)]
            
            print(f"\n📍 Batch {batch_num}/{total_batches}: Generating {current_batch_size} locations")
            print(f"   Region: {region}")
            print(f"   Focus: {activity_category}")
            
            # Generate batch
            locations = generate_location_batch(client, region, activity_category, current_batch_size)
            
            # Write to CSV
            if locations:
                for loc in locations[:current_batch_size]:  # Ensure we don't exceed batch size
                    try:
                        # Get image URL from Unsplash
                        image_url = get_unsplash_image(
                            loc.get('location', ''),
                            loc.get('activity', ''),
                            loc.get('country', ''),
                            unsplash_key
                        )
                        
                        writer.writerow({
                            'location': loc.get('location', ''),
                            'country': loc.get('country', ''),
                            'latitude': loc.get('latitude', 0),
                            'longitude': loc.get('longitude', 0),
                            'activity': loc.get('activity', ''),
                            'description': loc.get('description', ''),
                            'price_class': loc.get('price_class', '$$'),
                            'prominence_score': loc.get('prominence_score', 5),
                            'tags': loc.get('tags', ''),
                            'image_url': image_url
                        })
                        entries_generated += 1
                        
                    except Exception as e:
                        print(f"   ⚠️  Warning: Failed to write entry: {e}")
                
                print(f"   ✅ Generated {len(locations)} locations ({entries_generated}/{num_entries} total)")
                csvfile.flush()  # Flush after each batch to save progress
            else:
                print(f"   ⚠️  Failed to generate batch, retrying...")
            
            # Rate limiting - small delay between batches
            if entries_generated < num_entries:
                time.sleep(1)
    
    print(f"\n✨ Dataset generation complete!")
    print(f"📊 Total entries: {entries_generated}")
    print(f"💾 Saved to: {output_file}")


def main():
    """Main entry point."""
    
    # Get API key from environment or command line
    api_key = os.environ.get('GEMINI_API_KEY')
    
    if not api_key:
        print("❌ Error: GEMINI_API_KEY not found in environment variables")
        print("\nPlease set your API key:")
        print("  export GEMINI_API_KEY='your-api-key-here'")
        print("\nOr provide it as a command line argument:")
        print("  python generate_locations_dataset.py --api-key YOUR_KEY")
        print("  python generate_locations_dataset.py --api-key YOUR_KEY --unsplash-key UNSPLASH_KEY")
        
        # Check for command line argument
        if '--api-key' in sys.argv:
            try:
                api_key_index = sys.argv.index('--api-key')
                api_key = sys.argv[api_key_index + 1]
            except (IndexError, ValueError):
                print("\n❌ Invalid --api-key argument")
                sys.exit(1)
        else:
            sys.exit(1)
    
    # Get number of entries from command line or use default
    num_entries = DEFAULT_NUM_ENTRIES
    if '--num-entries' in sys.argv:
        try:
            num_entries_index = sys.argv.index('--num-entries')
            num_entries = int(sys.argv[num_entries_index + 1])
        except (IndexError, ValueError):
            print(f"⚠️  Invalid --num-entries argument, using default: {DEFAULT_NUM_ENTRIES}")
    
    # Get output file from command line or use default
    output_file = OUTPUT_FILE
    if '--output' in sys.argv:
        try:
            output_index = sys.argv.index('--output')
            output_file = sys.argv[output_index + 1]
        except (IndexError, ValueError):
            print(f"⚠️  Invalid --output argument, using default: {OUTPUT_FILE}")
            
    # Get Unsplash key from command line
    unsplash_key = None
    if '--unsplash-key' in sys.argv:
        try:
            key_index = sys.argv.index('--unsplash-key')
            unsplash_key = sys.argv[key_index + 1]
        except (IndexError, ValueError):
            print("⚠️  Invalid --unsplash-key argument")
    
    # Generate dataset
    generate_dataset(api_key, num_entries, output_file, unsplash_key)


if __name__ == "__main__":
    main()
