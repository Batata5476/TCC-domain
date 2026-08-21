import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

export default function PerfilInfo() {
  return (
    <View style={styles.infoContainer}>
      <View style={styles.infoRow}>
        <Ionicons name="mail-outline" size={16} color="#263238" />
        <Text style={styles.infoText}>email@email.com</Text>
      </View>

      <View style={styles.infoRow}>
        <Ionicons name="card-outline" size={16} color="#263238" />
        <Text style={styles.infoText}>000.000.000-00</Text>
      </View>

      <View style={styles.infoRow}>
        <Ionicons name="call-outline" size={16} color="#263238" />
        <Text style={styles.infoText}>(00) 00000-0000</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  infoContainer: {
    marginHorizontal: 20,
    marginTop: 13,
    gap: 7,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  infoText: {
    fontSize: 10,
    color: "#263238",
  },
});