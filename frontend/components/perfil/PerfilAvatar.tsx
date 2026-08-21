import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

export default function PerfilAvatar() {
  return (
    <View style={styles.photoContainer}>
      <View style={styles.avatar}>
        <Ionicons
          name="person"
          size={54}
          color="#FFFFFF"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  photoContainer: {
    height: 128,
    marginHorizontal: 20,
    borderRadius: 10,
    backgroundColor: "#ECE6F0",
    justifyContent: "center",
    alignItems: "center",
  },

  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "#8A8A8A",
    justifyContent: "center",
    alignItems: "center",
  },
});