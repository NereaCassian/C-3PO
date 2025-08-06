// Script to generate icons for the extension using the base icon.svg
// Run this with Node.js to create size-specific icon files

const fs = require('fs');
const path = require('path');

const iconSizes = [16, 32, 48, 128];
const iconsDir = path.join(__dirname, '../public/icons');
const baseIconPath = path.join(iconsDir, 'icon.svg');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Check if base icon exists
if (!fs.existsSync(baseIconPath)) {
  console.error('❌ Base icon.svg not found at:', baseIconPath);
  console.error('Please ensure icon.svg exists in the icons directory.');
  process.exit(1);
}

// Read the base SVG content
const baseSVGContent = fs.readFileSync(baseIconPath, 'utf8');

// Function to create size-specific SVG from base SVG
function createSizedSVG(baseSVG, size) {
  // Replace the width, height, and viewBox attributes to match the target size
  let sizedSVG = baseSVG
    .replace(/width="[^"]*"/g, `width="${size}"`)
    .replace(/height="[^"]*"/g, `height="${size}"`)
    .replace(/viewBox="[^"]*"/g, `viewBox="0 0 48 48"`); // Keep original viewBox for proper scaling
  
  return sizedSVG;
}

// Create SVG files for each size based on the base icon
iconSizes.forEach(size => {
  const svgContent = createSizedSVG(baseSVGContent, size);
  const fileName = `icon${size}.svg`;
  const filePath = path.join(iconsDir, fileName);
  
  fs.writeFileSync(filePath, svgContent);
  console.log(`✅ Created ${fileName} (${size}x${size}px)`);
});

console.log('\\n🎉 C-3PO icons generated successfully from base icon.svg!');
console.log('\\n📝 To convert to PNG files (if needed):');
console.log('1. Use an online SVG to PNG converter, or');
console.log('2. Use a tool like Inkscape: inkscape --export-type=png --export-filename=icon16.png icon16.svg');
console.log('3. Or use any image editor that supports SVG import');
console.log('\\n💡 Note: Modern browsers and Chrome extensions support SVG icons directly!');

// Create a simple HTML file to preview the icons
const previewHTML = `<!DOCTYPE html>
<html>
<head>
    <title>C-3PO Extension Icons Preview</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            padding: 20px; 
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            margin: 0;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        h1 { 
            text-align: center; 
            color: #2c3e50; 
            margin-bottom: 10px;
            font-size: 2.5em;
        }
        .subtitle {
            text-align: center;
            color: #7f8c8d;
            margin-bottom: 30px;
            font-style: italic;
        }
        .icon-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); 
            gap: 25px; 
            margin: 30px 0; 
        }
        .icon-item { 
            text-align: center; 
            padding: 20px; 
            border: 2px solid #ecf0f1; 
            border-radius: 12px; 
            transition: all 0.3s ease;
            background: #fafafa;
        }
        .icon-item:hover {
            border-color: #f4b10b;
            transform: translateY(-5px);
            box-shadow: 0 8px 25px rgba(244, 177, 11, 0.2);
        }
        .icon-item img { 
            display: block; 
            margin: 0 auto 15px; 
            filter: drop-shadow(0 2px 8px rgba(0,0,0,0.1));
        }
        .icon-info {
            font-weight: bold;
            color: #2c3e50;
            font-size: 1.1em;
        }
        .base-icon {
            border-color: #f4b10b;
            background: linear-gradient(135deg, #fff9e6 0%, #fff3cc 100%);
        }
        .note {
            background: #e8f4fd;
            border-left: 4px solid #3498db;
            padding: 15px;
            margin-top: 30px;
            border-radius: 0 8px 8px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🤖 C-3PO Extension Icons</h1>
        <p class="subtitle">Generated from base icon.svg using different sizes</p>
        
        <div class="icon-grid">
            <div class="icon-item base-icon">
                <img src="icon.svg" alt="Base icon" width="48" height="48">
                <div class="icon-info">Base Icon (icon.svg)</div>
                <div style="font-size: 0.9em; color: #7f8c8d;">Original C-3PO design</div>
            </div>
            ${iconSizes.map(size => `
            <div class="icon-item">
                <img src="icon${size}.svg" alt="${size}x${size} icon" width="${size}" height="${size}">
                <div class="icon-info">${size}x${size}px</div>
                <div style="font-size: 0.9em; color: #7f8c8d;">icon${size}.svg</div>
            </div>
            `).join('')}
        </div>
        
        <div class="note">
            <strong>📌 Note:</strong> All icons are generated from the base <code>icon.svg</code> file and scaled appropriately. 
            Modern browsers and Chrome extensions support SVG icons directly, providing crisp rendering at any size!
        </div>
    </div>
</body>
</html>`;

fs.writeFileSync(path.join(iconsDir, 'preview.html'), previewHTML);
console.log('✅ Created enhanced preview.html for icon visualization');
console.log('\\n🔗 Open public/icons/preview.html in your browser to see all icons!');