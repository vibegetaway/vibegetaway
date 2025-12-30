# Global Locations Dataset Generator

Generate a comprehensive CSV dataset of global tourist locations using **Gemini 2.5 Flash** with Maps grounding and **Unsplash** for images.

## Features

- ✅ AI-powered location generation with accurate coordinates via Gemini Maps grounding
- ✅ Unsplash image integration using your existing Next.js API endpoint
- ✅ Global coverage across 14 world regions
- ✅ 10 diverse activity categories (landmarks, water sports, culture, food, etc.)
- ✅ Configurable entry count and output filename

## Prerequisites

1. **Python 3.8+** installed
2. **Gemini API key** from Google AI Studio
3. **Unsplash Access Key** (optional, for higher quality images)
   - Get yours at: https://unsplash.com/developers
   - Set as environment variable: `UNSPLASH_ACCESS_KEY`

## Installation

```bash
# Install Python dependencies
pip install -r requirements.txt
```

## Usage

### With Unsplash API (Recommended)
This uses the Unsplash API directly for curated, high-quality images.

```bash
# Option 1: Environment variable
export UNSPLASH_ACCESS_KEY=your_unsplash_access_key
python generate_locations_dataset.py --api-key YOUR_GEMINI_API_KEY

# Option 2: Command-line argument
python generate_locations_dataset.py --api-key YOUR_GEMINI_API_KEY --unsplash-key YOUR_UNSPLASH_KEY
```

### All Options Combined
Run with all configuration options in a single command:

```bash
python generate_locations_dataset.py \
  --api-key YOUR_GEMINI_API_KEY \
  --unsplash-key YOUR_UNSPLASH_KEY \
  --num-entries 3000 \
  --output global_locations_dataset.csv
```

### Without Unsplash API (Fallback Mode)

If no Unsplash Access Key is provided, the script uses Unsplash Source API (lower quality, generic images).

```bash
python generate_locations_dataset.py --api-key YOUR_GEMINI_API_KEY
```

## Configuration Options

```bash
# Custom number of entries (default: 3000)
python generate_locations_dataset.py --api-key YOUR_KEY --num-entries 5000

# Custom output filename (default: global_locations_dataset.csv)
python generate_locations_dataset.py --api-key YOUR_KEY --output my_data.csv

# All options combined
python generate_locations_dataset.py \
  --api-key YOUR_KEY \
  --num-entries 1000 \
  --output locations.csv
```

## CSV Output Schema

| Column | Description |
|--------|-------------|
| `location` | City/region/specific attraction name |
| `country` | Country name |
| `latitude` | Precise latitude coordinate |
| `longitude` | Precise longitude coordinate |
| `activity` | Specific activity available |
| `description` | Single-line description (max 100 chars) |
| `price_class` | Price tier: $ (Budget) to $$$$$ (Luxury) |
| `prominence_score` | Global fame/importance: 1-2=Hidden gems, 3-4=Notable, 5-6=Well-known, 7-8=Major landmarks, 9-10=World-famous icons |
| `tags` | Comma-separated activity tags |
| `image_url` | Unsplash image URL |

## How It Works

1. **Batch Generation**: Generates 10 locations per batch using Gemini AI
2. **Region Rotation**: Cycles through 14 world regions for uniform global distribution
3. **Activity Diversity**: Rotates through 10 activity categories per batch
4. **Image Fetching**: 
   - If `UNSPLASH_ACCESS_KEY` is set: Calls Unsplash API directly for curated images
   - Otherwise: Falls back to Unsplash Source API for generic images
5. **Progress Tracking**: Shows real-time progress as it generates each batch

## Example Output

```csv
location,country,latitude,longitude,activity,description,price_class,tags,image_url
Tokyo Tower,Japan,35.6552,139.7407,Observation deck visit,Iconic tower offering panoramic city views,2,"city-views,observation,family-friendly",https://images.unsplash.com/photo-...
```

## Tips

- Set `UNSPLASH_ACCESS_KEY` environment variable for higher quality, curated Unsplash images
- The script includes a 1-second delay between batches to respect API rate limits
- Generation time: ~5-10 minutes for 3000 entries (depending on API response times)
- Each batch shows progress: region, activity focus, and number of locations generated

## Troubleshooting

**"Unsplash API request failed"** warnings:
- Check that `UNSPLASH_ACCESS_KEY` is set correctly
- Verify your Unsplash API key is valid at https://unsplash.com/developers
- The script will automatically fallback to Unsplash Source API

**"GEMINI_API_KEY not found"**:
- Pass the API key via `--api-key` argument
- Or set environment variable: `export GEMINI_API_KEY=your_key`

## Generated Files

- `global_locations_dataset.csv` (default) - Full dataset with all columns
- `test_locations.csv` - Sample test dataset (if you ran tests)
