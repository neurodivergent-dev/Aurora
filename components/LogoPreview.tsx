import React from "react";
import { View, Text, StyleSheet } from "react-native";
import AuroraLogo, { AuroraLogoSmall } from "./LogoComponent";

const LogoPreview: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Aurora Logo</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Standard Logo (120px)</Text>
        <AuroraLogo />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Medium Logo (80px)</Text>
        <AuroraLogo size={80} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Small Logo (40px)</Text>
        <AuroraLogo size={40} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Favicon (32px)</Text>
        <AuroraLogoSmall />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Favicon (16px)</Text>
        <AuroraLogoSmall size={16} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Custom Color</Text>
        <View style={styles.colorRow}>
          <AuroraLogo size={50} color="#1976D2" />
          <AuroraLogo size={50} color="#03A9F4" />
          <AuroraLogo size={50} color="#009688" />
          <AuroraLogo size={50} color="#673AB7" />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f5f5f5",
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  section: {
    marginBottom: 30,
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#555",
  },
  colorRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 10,
  },
});

export default LogoPreview;
