#!/usr/bin/env python3
"""
Create thumbnail versions of steel engraving images for faster loading
Supports both JPEG and WebP formats for optimal performance
"""

import os
from PIL import Image, ExifTags
import sys

def create_thumbnail(input_path, output_path, max_size=(800, 600), format='JPEG'):
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
            
            # Save with optimized quality based on format
            if format.upper() == 'WEBP':
                img.save(output_path, 'WEBP', quality=85, optimize=True)
            else:
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
        
        # Create both JPEG and WebP thumbnails
        base_name = os.path.splitext(filename)[0]
        
        # JPEG thumbnail (for fallback)
        jpg_filename = base_name + '_thumb.jpg'
        jpg_output_path = os.path.join(output_dir, jpg_filename)
        create_thumbnail(input_path, jpg_output_path, format='JPEG')
        
        # WebP thumbnail (for modern browsers)
        webp_filename = base_name + '_thumb.webp'
        webp_output_path = os.path.join(output_dir, webp_filename)
        create_thumbnail(input_path, webp_output_path, format='WEBP')
    
    print(f"✅ Thumbnail generation complete!")

if __name__ == "__main__":
    main()
