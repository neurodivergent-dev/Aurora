import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  particle: { position: 'absolute', width: 4, height: 4, borderRadius: 2 },
  auraOrb: { position: 'absolute' },
  saturnContainer: { ...StyleSheet.absoluteFillObject },
  saturnGroup: { width: width, alignItems: 'center', justifyContent: 'center', position: 'absolute' },
  ringsOverlay: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  planetCore: { zIndex: 10 },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  matrixColumn: { position: 'absolute', width: 6, alignItems: 'center' },
  vortexContainer: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  gridContainer: { position: 'absolute', left: -width * 0.5, right: -width * 0.5, bottom: 0, height: height * 0.5, overflow: 'hidden', alignItems: 'center' },
  gridInner: { width: width * 2, height: height * 1.5 },
  cubeWrapper: { position: 'absolute' },
  winampContainer: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' },
  winampViz: { flexDirection: 'row', alignItems: 'flex-end', height: 120, gap: 2 },
  winampBar: { width: 4, backgroundColor: '#00FF00', shadowColor: '#00FF00', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 4 },
  winampScopeContainer: { position: 'absolute', width: width, height: 100, bottom: height * 0.25 },
});
