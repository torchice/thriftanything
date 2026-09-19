#!/bin/bash
# Normalize book cover photos: crop, resize to 1000x1500, webp

set -e

SRC_DIR="assets/raw"
DST_DIR="public/books"
TEMP_DIR="/tmp/photo-crop"

mkdir -p "$DST_DIR" "$TEMP_DIR"

if ! command -v convert &> /dev/null; then
  echo "Error: ImageMagick (convert) not installed. Install with: brew install imagemagick"
  exit 1
fi

echo "Processing $(ls "$SRC_DIR"/*.jpg 2>/dev/null | wc -l) photos..."

for src in "$SRC_DIR"/*.jpg; do
  base=$(basename "$src" .jpg)
  tmp="$TEMP_DIR/$base.jpg"
  dst="$DST_DIR/$base.webp"

  # Remove previous if it exists
  rm -f "$dst"

  # Step 1: Auto-crop to book cover bounds (smart crop removes surrounding space)
  convert "$src" \
    -auto-level \
    -trim +repage \
    "$tmp"

  # Step 2: Resize to 1000x1500 cover fit (letterbox if needed, centered)
  convert "$tmp" \
    -resize 1000x1500 \
    -background white \
    -gravity center \
    -extent 1000x1500 \
    -quality 80 \
    -define webp:lossless=false \
    "$dst"

  # Cleanup
  rm -f "$tmp"

  echo "✓ $base.webp ($(du -h "$dst" | cut -f1))"
done

echo "Done. Photos ready at $DST_DIR/*.webp"
echo "Next: Upload to Supabase Storage bucket 'book-photos' (make bucket public first)"
