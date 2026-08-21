import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type PerfilActionProps = {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  text: string;
  onAdd: () => void;
};

export default function PerfilAction({ icon, text, onAdd }: PerfilActionProps) {
  return (
    <View style={styles.actionRow}>
      <TouchableOpacity style={styles.actionButton}>
        <Ionicons name={icon} size={18} color="#FFFFFF" />
        <Text style={styles.actionText}>{text}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.addButton} onPress={onAdd}>
        <Ionicons
          name="add-circle-outline"
          size={23}
          color="#263238"
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  actionRow: {
    marginHorizontal: 20,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },

  actionButton: {
    flex: 1,
    height: 39,
    borderRadius: 7,
    backgroundColor: "#285A71",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },

  actionText: {
    marginLeft: 8,
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "500",
  },

  addButton: {
    width: 35,
    height: 39,
    marginLeft: 6,
    justifyContent: "center",
    alignItems: "center",
  },
});