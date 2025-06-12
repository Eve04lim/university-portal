// PWAアイコン生成スクリプト（開発用）
// 実際のプロジェクトでは、デザイナーが作成したアイコンを使用してください

const fs = require('fs');
const path = require('path');

// SVGアイコンの作成（大学ポータル用）
const createSVGIcon = (size) => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3B82F6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1D4ED8;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- 背景 -->
  <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="url(#grad1)"/>
  
  <!-- 大学建物のアイコン -->
  <g transform="translate(${size * 0.15}, ${size * 0.2})">
    <!-- メインビル -->
    <rect x="${size * 0.1}" y="${size * 0.3}" width="${size * 0.5}" height="${size * 0.35}" fill="white" opacity="0.9"/>
    
    <!-- 屋根 -->
    <polygon points="${size * 0.05},${size * 0.3} ${size * 0.35},${size * 0.15} ${size * 0.65},${size * 0.3}" fill="white" opacity="0.9"/>
    
    <!-- 窓 -->
    <rect x="${size * 0.15}" y="${size * 0.4}" width="${size * 0.08}" height="${size * 0.1}" fill="#3B82F6"/>
    <rect x="${size * 0.27}" y="${size * 0.4}" width="${size * 0.08}" height="${size * 0.1}" fill="#3B82F6"/>
    <rect x="${size * 0.39}" y="${size * 0.4}" width="${size * 0.08}" height="${size * 0.1}" fill="#3B82F6"/>
    <rect x="${size * 0.51}" y="${size * 0.4}" width="${size * 0.08}" height="${size * 0.1}" fill="#3B82F6"/>
    
    <!-- ドア -->
    <rect x="${size * 0.31}" y="${size * 0.55}" width="${size * 0.08}" height="${size * 0.1}" fill="#1D4ED8"/>
  </g>
  
  <!-- 文字 "U" -->
  <text x="${size * 0.5}" y="${size * 0.85}" 
        font-family="Arial, sans-serif" 
        font-size="${size * 0.25}" 
        font-weight="bold" 
        text-anchor="middle" 
        fill="white" 
        opacity="0.9">U</text>
</svg>`;
};

// アイコンサイズリスト
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

// アイコンディレクトリの作成
const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// SVGアイコンの生成（実際のプロジェクトではPNGを生成する必要があります）
iconSizes.forEach(size => {
  const svgContent = createSVGIcon(size);
  const fileName = `icon-${size}x${size}.svg`;
  const filePath = path.join(iconsDir, fileName);
  
  fs.writeFileSync(filePath, svgContent);
  console.log(`Generated: ${fileName}`);
});

// README.txtの作成
const readmeContent = `PWA Icons for University Portal

This directory contains icons for the Progressive Web App.

Generated Icons:
${iconSizes.map(size => `- icon-${size}x${size}.svg (${size}x${size}px)`).join('\n')}

Note: In production, you should use properly designed PNG icons instead of these generated SVG icons.

To convert SVG to PNG, you can use tools like:
- ImageMagick: convert icon.svg icon.png
- Online converters
- Design tools like Figma, Sketch, or Adobe Illustrator

Recommended tools for icon generation:
- https://www.pwabuilder.com/ (PWA Builder)
- https://realfavicongenerator.net/ (Favicon Generator)
- https://app-manifest.firebaseapp.com/ (Manifest Generator)

Icon Requirements:
- Use square icons (1:1 aspect ratio)
- Ensure good contrast for visibility
- Test on various backgrounds (light/dark)
- Consider maskable icons for Android adaptive icons
- Minimum size: 72x72px
- Recommended: 512x512px for high-DPI displays

Installation:
1. Replace SVG files with PNG versions
2. Update manifest.json if needed
3. Test PWA installation on various devices
4. Verify icons appear correctly in app launchers
`;

fs.writeFileSync(path.join(iconsDir, 'README.txt'), readmeContent);
console.log('Generated: README.txt');

console.log('\n✅ PWA icons generated successfully!');
console.log('📝 Note: Replace SVG files with PNG versions for production use.');
console.log('🎨 Consider using professional design tools for better icons.');
console.log('🧪 Test PWA installation with these icons on mobile devices.');