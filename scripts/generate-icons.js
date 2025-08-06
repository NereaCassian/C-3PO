// Script to generate placeholder icons for the extension
// Run this with Node.js to create basic icon files

const fs = require('fs');
const path = require('path');

const iconSizes = [16, 32, 48, 128];
const iconsDir = path.join(__dirname, '../public/icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Simple SVG template for different sizes
function createSVG(size) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${Math.floor(size * 0.15)}" fill="#2563eb"/>
  <g transform="translate(${size * 0.15}, ${size * 0.2})">
    <rect width="${size * 0.2}" height="${size * 0.05}" fill="white"/>
    <rect y="${size * 0.1}" width="${size * 0.25}" height="${size * 0.05}" fill="white"/>
    <rect y="${size * 0.2}" width="${size * 0.15}" height="${size * 0.05}" fill="white"/>
    <rect x="${size * 0.4}" width="${size * 0.2}" height="${size * 0.05}" fill="white"/>
    <rect x="${size * 0.4}" y="${size * 0.1}" width="${size * 0.25}" height="${size * 0.05}" fill="white"/>
    <rect x="${size * 0.4}" y="${size * 0.2}" width="${size * 0.15}" height="${size * 0.05}" fill="white"/>
    <path d="M${size * 0.3} ${size * 0.15}L${size * 0.35} ${size * 0.35}H${size * 0.32}L${size * 0.31} ${size * 0.31}H${size * 0.22}L${size * 0.21} ${size * 0.31}H${size * 0.18}L${size * 0.23} ${size * 0.35}H${size * 0.27}Z" fill="white"/>
  </g>
</svg>`;
}

// Create SVG files for each size
iconSizes.forEach(size => {
  const svgContent = createSVG(size);
  const fileName = `icon${size}.svg`;
  const filePath = path.join(iconsDir, fileName);
  
  fs.writeFileSync(filePath, svgContent);
  console.log(`Created ${fileName}`);
});

console.log('\\nSVG icons created successfully!');
console.log('\\nTo convert to PNG files:');
console.log('1. Use an online SVG to PNG converter, or');
console.log('2. Use a tool like Inkscape: inkscape --export-type=png --export-filename=icon16.png icon16.svg');
console.log('3. Or use any image editor that supports SVG import');

// Create a simple HTML file to preview the icons
const previewHTML = `<!DOCTYPE html>
<html>
<head>
    <title>Extension Icons Preview</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .icon-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 20px; margin: 20px 0; }
        .icon-item { text-align: center; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
        .icon-item img { display: block; margin: 0 auto 10px; }
    </style>
</head>
<body>
    <h1>AI Translation Extension Icons</h1>
    <div class="icon-grid">
        ${iconSizes.map(size => `
        <div class="icon-item">
            <img src="icon${size}.svg" alt="${size}x${size} icon" width="${size}" height="${size}">
            <div>${size}x${size}px</div>
        </div>
        `).join('')}
    </div>
    <p><strong>Note:</strong> Convert these SVG files to PNG format for use in the Chrome extension.</p>
</body>
</html>`;

fs.writeFileSync(path.join(iconsDir, 'preview.html'), previewHTML);
console.log('Created preview.html for icon visualization');