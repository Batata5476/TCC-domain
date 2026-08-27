import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type PerfilActionProps = {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  text: string;
  onAdd?: () => void;
  onPress?: () => void;
  showAdd?: boolean;
};

export default function PerfilAction({
  icon,
  text,
  onAdd,
  onPress,
  showAdd = true,
}: PerfilActionProps) {
  return (
    <View style={styles.actionRow}>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={onPress || onAdd}
        activeOpacity={0.8}
      >
        <Ionicons name={icon} size={20} color="#FFFFFF" />
        <Text style={styles.actionText}>{text}</Text>
      </TouchableOpacity>

      {showAdd && onAdd && (
        <TouchableOpacity style={styles.addButton} onPress={onAdd} activeOpacity={0.7}>
          <Ionicons name="add-circle" size={26} color="#285A71" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  actionRow: {
    marginHorizontal: 20,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    backgroundColor: "#285A71",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  actionText: {
    marginLeft: 12,
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
    textTransform: "lowercase",
  },
  addButton: {
    width: 42,
    height: 46,
    marginLeft: 8,
    justifyContent: "center",
    alignItems: "center",
  },
});