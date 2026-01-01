#!/usr/bin/env python3
"""
Location Dataset Generator using Gemini 2.5 Flash Lite with Maps Grounding.
Generates CSV dataset of global tourist locations with Pixabay images.
"""

import csv
import os
import sys
from typing import List, Dict, Optional
from google import genai
from google.genai import types
import json
import time
import requests
import re

DEFAULT_NUM_ENTRIES = 3000
BATCH_SIZE = 10
OUTPUT_FILE = "global_locations_dataset.csv"

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

WORLD_REGIONS = [
    "Southeast Asia", "East Asia", "South Asia", "Middle East",
    "Europe (Western)", "Europe (Eastern)", "Africa (North)", "Africa (Sub-Saharan)",
    "North America", "Central America", "South America", "Caribbean",
    "Australia and Oceania", "Pacific Islands"
]


def get_pixabay_image(location: str, spot: str, country: str, pixabay_key: Optional[str] = None) -> str:
    """Get image URL from Pixabay with progressive fallback."""
    api_key = pixabay_key or os.environ.get('PIXABAY_API_KEY')
    if not api_key:
        return ""
    
    def simplify(text: str) -> str:
        return ' '.join(re.sub(r'[^\w\s]', ' ', text).split()).strip()
    
    search_terms = [
        f"{simplify(spot)} {simplify(location)}",
        f"{simplify(spot)} {simplify(country)}",
        simplify(spot),
        f"{simplify(location)} {simplify(country)}",
        simplify(location),
        f"{simplify(country)} landmark",
        simplify(country),
        "travel destination"
    ]
    
    for term in search_terms:
        if not term:
            continue
        try:
            url = f"https://pixabay.com/api/?key={api_key}&q={requests.utils.quote(term)}&image_type=photo&per_page=3&safesearch=true"
            response = requests.get(url, timeout=10)
            
            if response.ok:
                data = response.json()
                if data.get('hits'):
                    image_url = data['hits'][0].get('webformatURL', '')
                    if image_url:
                        print(f"   ✓ Image: {term}")
                        return image_url
            elif response.status_code == 429:
                return ""
        except:
            continue
    
    return ""


def generate_location_batch(client, region: str, activity_category: str, batch_size: int) -> List[Dict]:
    """Generate location batch using Gemini with Maps grounding."""
    prompt = f"""Generate {batch_size} diverse tourist locations in {region} focused on {activity_category}.

Output valid JSON only. Return a SINGLE JSON array with this structure:
[
  {{
    "location": "specific city/town/area name (e.g., 'Canggu', 'Ubud', 'Montmartre')",
    "logical_location": "broader region/island travelers recognize (e.g., 'Bali', 'Paris', 'Swiss Alps')",
    "country": "country name",
    "spot": "specific sight/attraction name",
    "latitude": 0.0,
    "longitude": 0.0,
    "activity": "what to do there",
    "description": "brief description (max 100 chars)",
    "price_class": "$$ ($ to $$$$$)",
    "tags": "tag1,tag2,tag3",
    "prominence_score": 7 (1-10: 1-2=hidden gems, 3-4=notable, 5-6=well-known, 7-8=major, 9-10=world-famous)
  }}
]

Ensure diverse, real locations with accurate coordinates."""

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash-lite',
            contents=prompt,
            config=types.GenerateContentConfig(tools=[types.Tool(google_search=types.GoogleSearch())])
        )
        
        response_text = response.text.strip()
        start = response_text.find('[')
        end = response_text.rfind(']')
        
        if start != -1 and end != -1:
            json_str = response_text[start:end + 1]
            parsed = json.loads(json_str)
            return parsed if isinstance(parsed, list) else []
        
        return []
    except:
        return []


def generate_dataset(api_key: str, num_entries: int = DEFAULT_NUM_ENTRIES, output_file: str = OUTPUT_FILE, pixabay_key: Optional[str] = None):
    """Generate the complete dataset."""
    print(f"🌍 Generating {num_entries} locations → {output_file}")
    
    client = genai.Client(api_key=api_key)
    total_batches = (num_entries + BATCH_SIZE - 1) // BATCH_SIZE
    
    with open(output_file, 'w', newline='', encoding='utf-8') as csvfile:
        fieldnames = ['location', 'logical_location', 'country', 'spot', 'latitude', 'longitude', 'activity', 'description', 'price_class', 'prominence_score', 'tags', 'image_url']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        
        entries_generated = 0
        batch_num = 0
        
        while entries_generated < num_entries:
            batch_num += 1
            current_batch_size = min(BATCH_SIZE, num_entries - entries_generated)
            region = WORLD_REGIONS[batch_num % len(WORLD_REGIONS)]
            activity = ACTIVITY_CATEGORIES[batch_num % len(ACTIVITY_CATEGORIES)]
            
            print(f"\n📍 Batch {batch_num}/{total_batches}: {region} - {activity}")
            
            locations = generate_location_batch(client, region, activity, current_batch_size)
            
            if not isinstance(locations, list):
                continue
            
            for loc in locations[:current_batch_size]:
                if not isinstance(loc, dict):
                    continue
                
                try:
                    image_url = get_pixabay_image(
                        loc.get('location', ''),
                        loc.get('spot', ''),
                        loc.get('country', ''),
                        pixabay_key
                    )
                    
                    writer.writerow({
                        'location': loc.get('location', ''),
                        'logical_location': loc.get('logical_location', ''),
                        'country': loc.get('country', ''),
                        'spot': loc.get('spot', ''),
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
                    print(f"   ⚠️  Error: {e}")
            
            if locations:
                print(f"   ✅ {len(locations)} locations ({entries_generated}/{num_entries})")
                csvfile.flush()
            
            if entries_generated < num_entries:
                time.sleep(1)
    
    print(f"\n✨ Complete! {entries_generated} entries → {output_file}")


def main():
    api_key = os.environ.get('GEMINI_API_KEY')
    
    if not api_key and '--api-key' in sys.argv:
        try:
            api_key = sys.argv[sys.argv.index('--api-key') + 1]
        except:
            pass
    
    if not api_key:
        print("❌ GEMINI_API_KEY required")
        print("Usage: python generate_locations_dataset.py --api-key KEY [--pixabay-key KEY] [--num-entries N] [--output FILE]")
        sys.exit(1)
    
    num_entries = DEFAULT_NUM_ENTRIES
    if '--num-entries' in sys.argv:
        try:
            num_entries = int(sys.argv[sys.argv.index('--num-entries') + 1])
        except:
            pass
    
    output_file = OUTPUT_FILE
    if '--output' in sys.argv:
        try:
            output_file = sys.argv[sys.argv.index('--output') + 1]
        except:
            pass
    
    pixabay_key = None
    if '--pixabay-key' in sys.argv:
        try:
            pixabay_key = sys.argv[sys.argv.index('--pixabay-key') + 1]
        except:
            pass
    
    generate_dataset(api_key, num_entries, output_file, pixabay_key)


if __name__ == "__main__":
    main()
