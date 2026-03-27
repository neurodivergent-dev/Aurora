import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { 
  Defs, 
  LinearGradient, 
  RadialGradient, 
  Stop, 
  Path, 
  G, 
  Circle,
  Rect
} from "react-native-svg";
import { useTheme } from "../src/components/ThemeProvider";

interface LogoProps {
  size?: number;
  color?: string;
  secondaryColor?: string;
}

export const AuroraLogo: React.FC<LogoProps> = ({
  size = 120,
  color,
  secondaryColor,
}) => {
  const { colors } = useTheme();

  // Dinamik arka plan renkleri (kullanıcının orijinal kodundaki gibi ama daha canlı)
  const primary = color || colors.primary || "#4FACFE";
  const secondary = secondaryColor || colors.secondary || colors.info || "#7F00FF";
  
  // Neon Aurora Vectors
  const aurora1 = "#00F2FE"; // Vibrant Cyan
  const aurora2 = "#FFFFFF"; // Pure White core highlights
  const aurora4 = "#E100FF"; // Electric Magenta

  // Oran hesaplamaları (boyuta göre hizalamak için)
  const scale = size / 120;
  const padding = 8 * scale;
  const innerSize = 104 * scale;
  const radius = 26 * scale;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          {/* Arka plan için muazzam, derinlikli ana gradient */}
          <LinearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor={primary} stopOpacity="1" />
            <Stop offset="50%" stopColor={primary} stopOpacity="0.8" />
            <Stop offset="100%" stopColor={secondary} stopOpacity="1" />
          </LinearGradient>

          {/* Vektör çizgileri için neon aurora gradienti */}
          <LinearGradient id="auroraWave" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={aurora1} stopOpacity="0.9" />
            <Stop offset="100%" stopColor={aurora4} stopOpacity="0.85" />
          </LinearGradient>
          
          {/* Ortadaki parlama (Glow) */}
          <RadialGradient id="coreGlow" cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor={aurora2} stopOpacity="1" />
            <Stop offset="40%" stopColor={aurora1} stopOpacity="0.5" />
            <Stop offset="100%" stopColor={primary} stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* 1. Katman: iOS Tarzı Renkli Premium Arka Plan (Squircle) */}
        <Rect
          x={padding}
          y={padding}
          width={innerSize}
          height={innerSize}
          rx={radius}
          fill="url(#bgGrad)"
        />

        {/* İç aydınlatma / border hissi vermek için ince bir overlay */}
        <Rect
          x={padding}
          y={padding}
          width={innerSize}
          height={innerSize}
          rx={radius}
          fill="none"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth={1.5 * scale}
        />

        <G transform={`scale(${scale})`}>
          {/* Dinamik, iç içe geçen geometrik Aurora/Ses dalgaları */}
          <G rotation="15" origin="60, 60">
            {/* Dış sonsuzluk / yörünge çizgisi */}
            <Path 
              d="M 35,60 C 35,32 85,32 85,60 C 85,88 35,88 35,60 Z"
              fill="none" 
              stroke="white" 
              opacity="0.25"
              strokeWidth="4" 
              strokeLinecap="round" 
              transform="rotate(-45 60 60)"
            />
            
            {/* İç yüksek voltaj / Aurora dalgası */}
            <Path 
              d="M 32,60 C 32,38 88,38 88,60 C 88,82 32,82 32,60 Z"
              fill="none" 
              stroke="url(#auroraWave)" 
              strokeWidth="3" 
              transform="rotate(35 60 60)"
              opacity="0.9"
            />
          </G>

          {/* Merkez: Yapay Zeka Işığı (Core AI Glow) */}
          <Circle cx="60" cy="60" r="16" fill="url(#coreGlow)" />

          {/* Oynat İkonu (Play Button) - Minimalist ve Keskin */}
          <Path
            d="M 57,52 L 69,60 L 57,68 Z"
            fill="white"
            stroke="white"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </G>
      </Svg>
    </View>
  );
};

export const AuroraLogoSmall: React.FC<LogoProps> = ({
  size = 32,
  color,
  secondaryColor,
}) => {
  const { colors } = useTheme();

  const primary = color || colors.primary || "#4FACFE";
  const secondary = secondaryColor || colors.secondary || colors.info || "#7F00FF";
  
  const scale = size / 32;
  const padding = 2 * scale;
  const innerSize = 28 * scale;
  const radius = 8 * scale;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <LinearGradient id="smallBgGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={primary} stopOpacity="1" />
            <Stop offset="1" stopColor={secondary} stopOpacity="1" />
          </LinearGradient>
          <RadialGradient id="smallGlow" cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
            <Stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* Premium Kavisli Arka Plan */}
        <Rect
          x={padding}
          y={padding}
          width={innerSize}
          height={innerSize}
          rx={radius}
          fill="url(#smallBgGrad)"
        />

        <G transform={`scale(${scale})`}>
          {/* Merkez Parlaması */}
          <Circle cx="16" cy="16" r="6" fill="url(#smallGlow)" />

          {/* Oynat İkonu */}
          <Path
            d="M 14,12 L 20,16 L 14,20 Z"
            fill="white"
            strokeLinejoin="round"
          />
        </G>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});

export default AuroraLogo;
