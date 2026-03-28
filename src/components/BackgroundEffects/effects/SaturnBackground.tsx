import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AtomicSystem } from './AtomicSystem';
import { Tesseract4D } from './Tesseract4D';

export const SaturnBackground = React.memo(({ activeColor }: { activeColor: string }) => {
  return (
    <View style={StyleSheet.absoluteFill}>
      <AtomicSystem activeColor={activeColor} />
      <Tesseract4D activeColor={activeColor} />
    </View>
  );
});
