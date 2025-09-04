#!/usr/bin/env python3
"""
Script para gerar todos os tamanhos de ícones necessários para iOS
"""

from PIL import Image
import os

# Tamanhos de ícones necessários para iOS
icon_sizes = [
    (20, "Icon-20.png"),
    (29, "Icon-29.png"),
    (40, "Icon-40.png"),
    (58, "Icon-58.png"),
    (60, "Icon-60.png"),
    (76, "Icon-76.png"),
    (80, "Icon-80.png"),
    (87, "Icon-87.png"),
    (120, "Icon-120.png"),
    (152, "Icon-152.png"),
    (167, "Icon-167.png"),
    (180, "Icon-180.png"),
    (1024, "Icon-1024.png")
]

def generate_icons():
    # Carregar ícone original
    original_icon = Image.open("ios-icon-1024.png")
    
    # Criar diretório para ícones
    icons_dir = "ios/App/App/Assets.xcassets/AppIcon.appiconset"
    os.makedirs(icons_dir, exist_ok=True)
    
    # Gerar cada tamanho
    for size, filename in icon_sizes:
        resized_icon = original_icon.resize((size, size), Image.Resampling.LANCZOS)
        resized_icon.save(os.path.join(icons_dir, filename))
        print(f"Gerado: {filename} ({size}x{size})")
    
    # Criar Contents.json para o Xcode
    contents_json = {
        "images": [
            {"size": "20x20", "idiom": "iphone", "filename": "Icon-40.png", "scale": "2x"},
            {"size": "20x20", "idiom": "iphone", "filename": "Icon-60.png", "scale": "3x"},
            {"size": "29x29", "idiom": "iphone", "filename": "Icon-58.png", "scale": "2x"},
            {"size": "29x29", "idiom": "iphone", "filename": "Icon-87.png", "scale": "3x"},
            {"size": "40x40", "idiom": "iphone", "filename": "Icon-80.png", "scale": "2x"},
            {"size": "40x40", "idiom": "iphone", "filename": "Icon-120.png", "scale": "3x"},
            {"size": "60x60", "idiom": "iphone", "filename": "Icon-120.png", "scale": "2x"},
            {"size": "60x60", "idiom": "iphone", "filename": "Icon-180.png", "scale": "3x"},
            {"size": "20x20", "idiom": "ipad", "filename": "Icon-20.png", "scale": "1x"},
            {"size": "20x20", "idiom": "ipad", "filename": "Icon-40.png", "scale": "2x"},
            {"size": "29x29", "idiom": "ipad", "filename": "Icon-29.png", "scale": "1x"},
            {"size": "29x29", "idiom": "ipad", "filename": "Icon-58.png", "scale": "2x"},
            {"size": "40x40", "idiom": "ipad", "filename": "Icon-40.png", "scale": "1x"},
            {"size": "40x40", "idiom": "ipad", "filename": "Icon-80.png", "scale": "2x"},
            {"size": "76x76", "idiom": "ipad", "filename": "Icon-76.png", "scale": "1x"},
            {"size": "76x76", "idiom": "ipad", "filename": "Icon-152.png", "scale": "2x"},
            {"size": "83.5x83.5", "idiom": "ipad", "filename": "Icon-167.png", "scale": "2x"},
            {"size": "1024x1024", "idiom": "ios-marketing", "filename": "Icon-1024.png", "scale": "1x"}
        ],
        "info": {
            "version": 1,
            "author": "xcode"
        }
    }
    
    import json
    with open(os.path.join(icons_dir, "Contents.json"), "w") as f:
        json.dump(contents_json, f, indent=2)
    
    print("Contents.json criado!")
    print(f"Todos os ícones foram gerados em: {icons_dir}")

if __name__ == "__main__":
    generate_icons()

