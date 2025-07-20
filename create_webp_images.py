#!/usr/bin/env python3
"""
Create WebP versions of full-size steel engraving images for optimal performance
Keeps original JPEG/PNG files as fallbacks for older browsers
"""

import os
from PIL import Image, ExifTags
import sys

def create_webp_image(input_path, output_path, quality=85):
    """Create a WebP version of an image while preserving quality and orientation"""
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
            
            # Convert to RGB if necessary (WebP supports RGB)
            if img.mode in ('RGBA', 'LA', 'P'):
                img = img.convert('RGB')
            
            # Save as WebP with high quality
            img.save(output_path, 'WEBP', quality=quality, optimize=True)
            
            # Get file sizes for comparison
            original_size = os.path.getsize(input_path)
            webp_size = os.path.getsize(output_path)
            savings = ((original_size - webp_size) / original_size) * 100
            
            print(f"✅ Created WebP: {os.path.basename(output_path)}")
            print(f"   📊 Size: {original_size//1024//1024}MB → {webp_size//1024//1024}MB ({savings:.1f}% smaller)")
            
    except Exception as e:
        print(f"❌ Error creating WebP for {input_path}: {e}")

def main():
    # Directories
    input_dir = "public/engravings"
    
    # Process all images
    if not os.path.exists(input_dir):
        print(f"❌ Input directory {input_dir} not found")
        return
    
    # Get all image files (excluding thumbs directory)
    image_files = []
    for f in os.listdir(input_dir):
        if f.lower().endswith(('.jpg', '.jpeg', '.png')) and not f.startswith('.'):
            image_files.append(f)
    
    if not image_files:
        print(f"❌ No image files found in {input_dir}")
        return
    
    print(f"🔄 Converting {len(image_files)} full-size images to WebP...")
    print("📊 This will show file size comparisons...")
    
    total_original = 0
    total_webp = 0
    
    for filename in image_files:
        input_path = os.path.join(input_dir, filename)
        # Create WebP version with same base name
        base_name = os.path.splitext(filename)[0]
        webp_filename = base_name + '.webp'
        output_path = os.path.join(input_dir, webp_filename)
        
        # Track sizes for total savings calculation
        original_size = os.path.getsize(input_path)
        total_original += original_size
        
        create_webp_image(input_path, output_path)
        
        if os.path.exists(output_path):
            webp_size = os.path.getsize(output_path)
            total_webp += webp_size
    
    # Show total savings
    if total_original > 0:
        total_savings = ((total_original - total_webp) / total_original) * 100
        print(f"\n🎉 TOTAL SAVINGS:")
        print(f"   📊 Original: {total_original//1024//1024}MB")
        print(f"   📊 WebP: {total_webp//1024//1024}MB")
        print(f"   📊 Saved: {(total_original-total_webp)//1024//1024}MB ({total_savings:.1f}% reduction)")
    
    print(f"\n✅ WebP conversion complete!")
    print(f"💡 Your users will now experience much faster loading times!")

if __name__ == "__main__":
    main()