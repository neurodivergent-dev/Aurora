import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../ThemeProvider';
import { useThemeStore, BackgroundEffectType } from '../../store/themeStore';
import { BackgroundEffectsProps } from './types';

// Import all effects
import { DreamscapeBokehSystem } from './effects/DreamscapeBokeh';
import { QuantumDustSystem } from './effects/QuantumCloud';
import { AuroraEffect } from './effects/AuraEffect';
import { MatrixRain } from './effects/MatrixRain';
import { VortexSystem } from './effects/VortexSystem';
import { CyberGrid } from './effects/CyberGrid';
import { SilkBackground } from './effects/SilkBackground';
import { PrismBackground } from './effects/PrismBackground';
import { NebulaBackground } from './effects/NebulaBackground';
import { FlowBackground } from './effects/FlowBackground';
import { AtomicSystem } from './effects/AtomicSystem';
import { Tesseract4D } from './effects/Tesseract4D';
import { BlackHole } from './effects/BlackHole';
import { Stardust } from './effects/Stardust';
import { NeuralNetwork } from './effects/NeuralNetwork';
import { DNAStructure } from './effects/DNAStructure';
import { WinampVisualizer } from './effects/WinampVisualizer';
import { SaturnBackground } from './effects/SaturnBackground';

// Re-export NebulaOrb etc if needed elsewhere, but following SOLID, they stay internal to their modules.
export const BackgroundEffects: React.FC<BackgroundEffectsProps> = ({ customColor, isLightMode }) => {
  const { colors } = useTheme();
  const { backgroundEffect } = useThemeStore();
  const activeColor = customColor || colors.primary;

  const [displayEffect, setDisplayEffect] = React.useState(backgroundEffect);

  useEffect(() => {
    if (backgroundEffect !== displayEffect) {
      setDisplayEffect(backgroundEffect);
    }
  }, [backgroundEffect]);

  const getEffectNode = (effect: BackgroundEffectType) => {
    const effects: Record<BackgroundEffectType, React.ReactNode> = {
      bokeh: <DreamscapeBokehSystem activeColor={activeColor} />,
      quantum: <QuantumDustSystem activeColor={activeColor} />,
      aurora: <AuroraEffect activeColor={activeColor} />,
      matrix: <MatrixRain activeColor={activeColor} />,
      vortex: <VortexSystem activeColor={activeColor} />,
      grid: <CyberGrid activeColor={activeColor} />,
      silk: <SilkBackground activeColor={activeColor} />,
      prism: <PrismBackground activeColor={activeColor} />,
      nebula: <NebulaBackground activeColor={activeColor} />,
      flow: <FlowBackground activeColor={activeColor} />,
      crystals: <AtomicSystem activeColor={activeColor} />,
      tesseract: <Tesseract4D activeColor={activeColor} />,
      blackhole: <BlackHole activeColor={activeColor} />,
      stardust: <Stardust activeColor={activeColor} />,
      neural: <NeuralNetwork activeColor={activeColor} />,
      dna: <DNAStructure activeColor={activeColor} />,
      winamp: <WinampVisualizer activeColor={activeColor} />,
      none: null,
    };
    return effects[effect] || <SaturnBackground activeColor={activeColor} />;
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {displayEffect !== 'none' && getEffectNode(displayEffect)}
      </View>

      {/* Dynamic darken overlay for light mode effects visibility */}
      {colors.background === '#F2F2F7' && (
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: 'rgba(0, 0, 0, 0.03)' }
          ]}
          pointerEvents="none"
        />
      )}
    </View>
  );
};
