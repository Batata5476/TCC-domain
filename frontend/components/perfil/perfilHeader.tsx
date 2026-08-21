import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function PerfilHeader() {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.headerButton}>
        <Ionicons
          name="arrow-back-outline"
          size={21}
          color="#263238"
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.headerButton}>
        <Ionicons
          name="log-out-outline"
          size={21}
          color="#263238"
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 48,
    paddingHorizontal: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
});
