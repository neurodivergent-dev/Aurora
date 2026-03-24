const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgIcon = `
<svg width="1024" height="1024" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#4FACFE" stop-opacity="1" />
      <stop offset="50%" stop-color="#4FACFE" stop-opacity="0.8" />
      <stop offset="100%" stop-color="#7F00FF" stop-opacity="1" />
    </linearGradient>

    <!-- Aurora Wave Gradient -->
    <linearGradient id="auroraWave" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00F2FE" stop-opacity="0.9" />
      <stop offset="100%" stop-color="#E100FF" stop-opacity="0.85" />
    </linearGradient>
    
    <!-- Core Glow -->
    <radialGradient id="coreGlow" cx="50%" cy="50%" rx="50%" ry="50%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="1" />
      <stop offset="40%" stop-color="#00F2FE" stop-opacity="0.5" />
      <stop offset="100%" stop-color="#4FACFE" stop-opacity="0" />
    </radialGradient>
  </defs>

  <!-- 1. Layer: iOS Style Premium Background (Squircle) -->
  <rect
    x="8"
    y="8"
    width="104"
    height="104"
    rx="26"
    fill="url(#bgGrad)"
  />

  <!-- Inner glass/border overlay -->
  <rect
    x="8"
    y="8"
    width="104"
    height="104"
    rx="26"
    fill="none"
    stroke="rgba(255,255,255,0.25)"
    stroke-width="1.5"
  />

  <g>
    <!-- Dynamic geometric Aurora/Sound waves -->
    <g transform="rotate(15 60 60)">
      <!-- Outer orbit -->
      <path 
        d="M 35,60 C 35,32 85,32 85,60 C 85,88 35,88 35,60 Z"
        fill="none" 
        stroke="white" 
        opacity="0.25"
        stroke-width="4" 
        stroke-linecap="round" 
        transform="rotate(-45 60 60)"
      />
      
      <!-- Inner high voltage / Aurora wave -->
      <path 
        d="M 32,60 C 32,38 88,38 88,60 C 88,82 32,82 32,60 Z"
        fill="none" 
        stroke="url(#auroraWave)" 
        stroke-width="3" 
        transform="rotate(35 60 60)"
        opacity="0.9"
      />
    </g>

    <!-- Center: AI Core Glow -->
    <circle cx="60" cy="60" r="16" fill="url(#coreGlow)" />

    <!-- Play Icon - Minimalist -->
    <path
      d="M 57,52 L 69,60 L 57,68 Z"
      fill="white"
      stroke="white"
      stroke-width="2"
      stroke-linejoin="round"
    />
  </g>
</svg>
`;

const outputDir = 'c:/Users/Melih/Documents/WhiteLabelProjects/FocusTabs/assets/images/';

async function generateIcons() {
  try {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const svgBuffer = Buffer.from(svgIcon);

    // 1. icon.png (1024x1024)
    await sharp(svgBuffer)
      .resize(1024, 1024)
      .png()
      .toFile(path.join(outputDir, 'icon.png'));
    console.log('icon.png generated.');

    // 2. adaptive-icon.png (1024x1024 - andoid typically needs 1024 for resizing)
    await sharp(svgBuffer)
      .resize(1024, 1024)
      .png()
      .toFile(path.join(outputDir, 'adaptive-icon.png'));
    console.log('adaptive-icon.png generated.');

    // 3. splash-icon.png (Adjust size for splash)
    await sharp(svgBuffer)
      .resize(512, 512)
      .png()
      .toFile(path.join(outputDir, 'splash-icon.png'));
    console.log('splash-icon.png generated.');

    // 4. favicon.png (48x48 for web)
    // Simplify for favicon: use circular mask for better web visibility if needed
    await sharp(svgBuffer)
      .resize(48, 48)
      .png()
      .toFile(path.join(outputDir, 'favicon.png'));
    console.log('favicon.png generated.');

    // 5. notification-icon.png (96x96 for android notifications)
    await sharp(svgBuffer)
      .resize(96, 96)
      .png()
      .toFile(path.join(outputDir, 'notification-icon.png'));
    console.log('notification-icon.png generated.');

    // --- ANDROID NATIVE ICONS ---
    const androidResDir = 'c:/Users/Melih/Documents/WhiteLabelProjects/FocusTabs/android/app/src/main/res/';
    const densities = {
      'mdpi': 48,
      'hdpi': 72,
      'xhdpi': 96,
      'xxhdpi': 144,
      'xxxhdpi': 192
    };

    if (fs.existsSync(androidResDir)) {
      for (const [name, size] of Object.entries(densities)) {
        const mipmapDir = path.join(androidResDir, `mipmap-${name}`);
        if (fs.existsSync(mipmapDir)) {
          // ic_launcher.webp
          await sharp(svgBuffer)
            .resize(size, size)
            .webp()
            .toFile(path.join(mipmapDir, 'ic_launcher.webp'));

          // ic_launcher_round.webp
          await sharp(svgBuffer)
            .resize(size, size)
            .webp()
            .toFile(path.join(mipmapDir, 'ic_launcher_round.webp'));

          // ic_launcher_foreground.webp (Android Adaptive)
          // Adaptive icons use a 108dp square, with the icon in the center 72dp.
          // For simplicity we use the same SVG but scaled or boxed if needed.
          const adaptiveSize = Math.round(size * (108 / 48)); // 108dp equivalent
          await sharp(svgBuffer)
            .resize(adaptiveSize, adaptiveSize)
            .webp()
            .toFile(path.join(mipmapDir, 'ic_launcher_foreground.webp'));

          console.log(`Android icons for ${name} generated.`);
        }
      }
    }

    console.log('All icons including Android Native generated successfully.');
  } catch (err) {
    console.error('Error generating icons:', err);
  }
}

generateIcons();
