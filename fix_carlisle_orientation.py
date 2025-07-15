#!/usr/bin/env python3
"""
Fix orientation for the Carlisle Hotel image specifically
"""

import os
from PIL import Image

def rotate_image(input_path, output_path, rotation_degrees):
    """Rotate an image by specified degrees"""
    try:
        with Image.open(input_path) as img:
            # Rotate the image
            rotated = img.rotate(-rotation_degrees, expand=True)  # Negative for clockwise
            
            # Save the rotated image
            rotated.save(output_path, quality=95, optimize=True)
            print(f"✅ Rotated and saved: {output_path}")
            
    except Exception as e:
        print(f"❌ Error rotating image: {e}")

def main():
    # Paths for the Carlisle Hotel image
    original_path = "public/engravings/steel_engraving__0002.jpg"
    
    # Check if the file exists
    if not os.path.exists(original_path):
        print(f"❌ File not found: {original_path}")
        return
    
    # Create a backup first
    backup_path = "public/engravings/steel_engraving__0002_backup.jpg"
    if not os.path.exists(backup_path):
        with Image.open(original_path) as img:
            img.save(backup_path)
        print(f"📋 Created backup: {backup_path}")
    
    # Rotate the image 90 degrees clockwise (most common orientation issue)
    rotate_image(original_path, original_path, 90)
    
    # Also regenerate the thumbnail
    thumb_path = "public/engravings/thumbs/steel_engraving__0002_thumb.jpg"
    with Image.open(original_path) as img:
        # Convert to RGB if necessary
        if img.mode in ('RGBA', 'LA', 'P'):
            img = img.convert('RGB')
        
        # Create thumbnail
        img.thumbnail((400, 300), Image.Resampling.LANCZOS)
        img.save(thumb_path, 'JPEG', quality=85, optimize=True)
        print(f"✅ Regenerated thumbnail: {thumb_path}")

if __name__ == "__main__":
    main()
