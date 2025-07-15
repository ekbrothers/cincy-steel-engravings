#!/usr/bin/env python3
"""
Create thumbnail versions of steel engraving images for faster loading
"""

import os
from PIL import Image, ExifTags
import sys

def create_thumbnail(input_path, output_path, max_size=(400, 300)):
    """Create a thumbnail version of an image while preserving orientation"""
    try:
        with Image.open(input_path) as img:
            # Handle EXIF orientation
            try:
                # Get EXIF data
                exif = img._getexif()
                if exif:
                    # Find the orientation tag
                    for orientation in ExifTags.TAGS.keys():
                        if ExifTags.TAGS[orientation] == 'Orientation':
                            break
                    
                    # Apply rotation based on EXIF orientation
                    if orientation in exif:
                        if exif[orientation] == 3:
                            img = img.rotate(180, expand=True)
                        elif exif[orientation] == 6:
                            img = img.rotate(270, expand=True)
                        elif exif[orientation] == 8:
                            img = img.rotate(90, expand=True)
            except (AttributeError, KeyError, IndexError):
                # No EXIF data or orientation tag
                pass
            
            # Convert to RGB if necessary (for JPEG output)
            if img.mode in ('RGBA', 'LA', 'P'):
                img = img.convert('RGB')
            
            # Calculate new size maintaining aspect ratio
            img.thumbnail(max_size, Image.Resampling.LANCZOS)
            
            # Save with optimized quality
            img.save(output_path, 'JPEG', quality=85, optimize=True)
            print(f"✅ Created thumbnail: {output_path}")
            
    except Exception as e:
        print(f"❌ Error creating thumbnail for {input_path}: {e}")

def main():
    # Directories
    input_dir = "public/engravings"
    output_dir = "public/engravings/thumbs"
    
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    # Process all images
    if not os.path.exists(input_dir):
        print(f"❌ Input directory {input_dir} not found")
        return
    
    image_files = [f for f in os.listdir(input_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
    
    if not image_files:
        print(f"❌ No image files found in {input_dir}")
        return
    
    print(f"🔄 Processing {len(image_files)} images...")
    
    for filename in image_files:
        input_path = os.path.join(input_dir, filename)
        # Change extension to .jpg for thumbnails
        thumb_filename = os.path.splitext(filename)[0] + '_thumb.jpg'
        output_path = os.path.join(output_dir, thumb_filename)
        
        create_thumbnail(input_path, output_path)
    
    print(f"✅ Thumbnail generation complete!")

if __name__ == "__main__":
    main()
