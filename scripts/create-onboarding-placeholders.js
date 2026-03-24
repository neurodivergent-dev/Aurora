const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ONBOARDING_DIR = path.join(__dirname, '..', 'assets', 'images', 'onboarding');

// Aurora tarzı ortak arkaplanlar (kare logomuzun hissiyatı)
const defs = `
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#4FACFE" stop-opacity="1" />
      <stop offset="50%" stop-color="#4FACFE" stop-opacity="0.8" />
      <stop offset="100%" stop-color="#7F00FF" stop-opacity="1" />
    </linearGradient>
    <linearGradient id="auroraWave" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00F2FE" stop-opacity="0.9" />
      <stop offset="100%" stop-color="#E100FF" stop-opacity="0.85" />
    </linearGradient>
    <radialGradient id="coreGlow" cx="50%" cy="50%" rx="50%" ry="50%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="1" />
      <stop offset="40%" stop-color="#00F2FE" stop-opacity="0.5" />
      <stop offset="100%" stop-color="#4FACFE" stop-opacity="0" />
    </radialGradient>
  </defs>
  <rect x="8" y="8" width="104" height="104" rx="26" fill="url(#bgGrad)" />
  <rect x="8" y="8" width="104" height="104" rx="26" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="1.5" />
`;

// Tema uyumlu ikonlar
const svgIcons = {
  welcome: `
  <svg width="400" height="400" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
    ${defs}
    <!-- Hoş Geldin / Merkez AI Sihri -->
    <path d="M60 25 L65 47 L88 52 L65 57 L60 80 L55 57 L32 52 L55 47 Z" fill="url(#auroraWave)" opacity="0.95"/>
    <circle cx="60" cy="52" r="6" fill="white"/>
    <path d="M38 78 L41 85 L48 88 L41 91 L38 98 L35 91 L28 88 L35 85 Z" fill="white" opacity="0.6"/>
  </svg>
  `,
  
  experience: `
  <svg width="400" height="400" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
    ${defs}
    <!-- Ses Deneyimi (Müzik / Ses Dalgası) -->
    <path d="M35 60 Q45 30 60 60 T85 60" fill="none" stroke="url(#auroraWave)" stroke-width="4" stroke-linecap="round"/>
    <path d="M30 65 Q45 85 60 65 T90 65" fill="none" stroke="white" stroke-width="3" opacity="0.6" stroke-linecap="round"/>
    <circle cx="60" cy="60" r="10" fill="url(#coreGlow)"/>
    <!-- Minik Notalar / Işıltılar -->
    <circle cx="45" cy="45" r="3" fill="white"/>
    <circle cx="75" cy="75" r="2" fill="#00F2FE"/>
  </svg>
  `,
  
  control: `
  <svg width="400" height="400" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
    ${defs}
    <!-- Agentic AI (Chat & Kontrol) -->
    <!-- Chat Bubble -->
    <path d="M40 45 C40 38 48 35 60 35 C72 35 80 38 80 45 C80 55 72 60 60 60 C55 60 50 58 45 61 L45 55 C42 53 40 50 40 45 Z" fill="url(#coreGlow)" opacity="0.6" stroke="white" stroke-width="2"/>
    <circle cx="53" cy="46" r="2.5" fill="white"/>
    <circle cx="60" cy="46" r="2.5" fill="white"/>
    <circle cx="67" cy="46" r="2.5" fill="white"/>
    
    <!-- AI Spark / Yıldız -->
    <path d="M75 60 L78 68 L86 71 L78 74 L75 82 L72 74 L64 71 L72 68 Z" fill="url(#auroraWave)"/>
  </svg>
  `,
  
  themes: `
  <svg width="400" height="400" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
    ${defs}
    <!-- Tema Renkleri & Elementler -->
    <circle cx="50" cy="45" r="20" fill="url(#auroraWave)" opacity="0.9"/>
    <circle cx="74" cy="45" r="20" fill="url(#coreGlow)" opacity="0.8"/>
    <circle cx="62" cy="68" r="20" fill="#4FACFE" opacity="0.9"/>
    <circle cx="62" cy="51" r="5" fill="white"/>
  </svg>
  `
};

if (!fs.existsSync(ONBOARDING_DIR)) {
  fs.mkdirSync(ONBOARDING_DIR, { recursive: true });
}

async function generatePngs() {
  console.log("Onboarding görselleri (High-Quality PNG) oluşturuluyor...");
  for (const [name, svgStr] of Object.entries(svgIcons)) {
    const pngPath = path.join(ONBOARDING_DIR, `${name}.png`);
    try {
      await sharp(Buffer.from(svgStr))
        .png()
        .toFile(pngPath);
      console.log(`[BASARILI] Olusturulan Konsept Görsel: ${name}.png`);
    } catch (err) {
      console.error(`[HATA] ${name}.png olusturulurken hata olustu:`, err);
    }
  }
}

generatePngs(); 