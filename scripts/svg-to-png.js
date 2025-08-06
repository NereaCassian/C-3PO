// Script to convert SVG icons to PNG format for Chrome compatibility
// Requires sharp package: npm install --save-dev sharp

const fs = require('fs');
const path = require('path');

async function convertSvgToPng() {
  console.log('⚠️  Chrome does not support SVG icons in extensions.');
  console.log('📝 This script will help you convert SVG to PNG format.');
  console.log('');
  
  // Check if sharp is available
  let sharp;
  try {
    sharp = require('sharp');
  } catch (error) {
    console.log('❌ Sharp is required for SVG to PNG conversion');
    console.log('📦 Install it with: npm install --save-dev sharp');
    console.log('');
    console.log('🔄 Alternatively, you can:');
    console.log('  1. Use an online converter (recommended for quick fix)');
    console.log('  2. Use Inkscape: inkscape --export-type=png --export-filename=icon16.png icon16.svg');
    console.log('  3. Use GIMP or any image editor');
    console.log('');
    console.log('📋 Required sizes: 16x16, 32x32, 48x48, 128x128 pixels');
    console.log('💾 Save as: icon16.png, icon32.png, icon48.png, icon128.png');
    return;
  }

  const iconsDir = path.join(__dirname, '../public/icons');
  const baseSvg = path.join(iconsDir, 'icon.svg');
  
  if (!fs.existsSync(baseSvg)) {
    console.log('❌ Base SVG file not found: public/icons/icon.svg');
    return;
  }

  console.log('🎯 Converting SVG icons to PNG format...');
  
  const sizes = [16, 32, 48, 128];
  
  for (const size of sizes) {
    try {
      const outputPath = path.join(iconsDir, `icon${size}.png`);
      
      await sharp(baseSvg)
        .resize(size, size)
        .png()
        .toFile(outputPath);
        
      console.log(`✅ Created: icon${size}.png`);
    } catch (error) {
      console.error(`❌ Error creating icon${size}.png:`, error.message);
    }
  }
  
  console.log('');
  console.log('🔧 Next steps:');
  console.log('  1. Update manifest.json to use .png instead of .svg');
  console.log('  2. Run npm run build');
  console.log('  3. Test the extension in Chrome');
}

// Run if called directly
if (require.main === module) {
  convertSvgToPng().catch(console.error);
}

module.exports = { convertSvgToPng };