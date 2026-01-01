# Location Dataset Generator

Generates a CSV dataset of global tourist locations using **Gemini 2.5 Flash** (with Maps grounding) and **Pixabay** for images. Creates entries with location (city/region), spot (specific attraction), coordinates, activity description, price tier, prominence score, tags, and image URLs. Covers 14 world regions and 10 activity categories for diverse global coverage.

## Usage

```bash
# Install dependencies
pip install -r requirements.txt

# Set API keys (get Gemini from Google AI Studio, Pixabay from pixabay.com/api/docs)
export GEMINI_API_KEY=your_gemini_key
export PIXABAY_API_KEY=your_pixabay_key

# Generate dataset (default: 3000 entries)
python generate_locations_dataset.py --api-key $GEMINI_API_KEY --pixabay-key $PIXABAY_API_KEY

# Custom options
python generate_locations_dataset.py \
  --api-key $GEMINI_API_KEY \
  --pixabay-key $PIXABAY_API_KEY \
  --num-entries 5000 \
  --output my_locations.csv
```

**Output Schema**: `location` (specific city/area), `logical_location` (broader region travelers recognize), `country`, `spot` (attraction), `latitude`, `longitude`, `activity` (what to do), `description`, `price_class` ($-$$$$$), `prominence_score` (1-10), `tags`, `image_url`
