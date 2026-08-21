import React from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import PerfilButton from "./PerfilButton";

type PerfilMeetingModalProps = {
  visible: boolean;
  onClose: () => void;
  subject: string;
  setSubject: (subject: string) => void;
};

export default function PerfilMeetingModal({
  visible,
  onClose,
  subject,
  setSubject,
}: PerfilMeetingModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>solicitar reunião</Text>

            <TouchableOpacity onPress={onClose}>
              <Ionicons
                name="close-outline"
                size={23}
                color="#263238"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.meetingOption}>
            <View style={styles.optionIcon}>
              <Ionicons
                name="calendar-outline"
                size={20}
                color="#263238"
              />
            </View>
            <Text style={styles.optionTitle}>definir data</Text>
            <Text style={styles.optionValue}>10+</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.meetingOption}>
            <View style={styles.optionIcon}>
              <Ionicons name="time-outline" size={20} color="#263238" />
            </View>
            <Text style={styles.optionTitle}>definir horário</Text>
            <Text style={styles.optionValue}>10+</Text>
          </TouchableOpacity>

          <View style={styles.subjectArea}>
            <View style={styles.subjectTitleRow}>
              <Ionicons
                name="chatbox-outline"
                size={20}
                color="#263238"
              />
              <Text style={styles.optionTitle}>assunto reunião</Text>
            </View>

            <TextInput
              value={subject}
              onChangeText={setSubject}
              placeholder="Digite o assunto..."
              placeholderTextColor="#7A7A7A"
              multiline
              style={styles.subjectInput}
            />
          </View>

          <View style={styles.modalButtons}>
            <PerfilButton text="cancelar" type="cancel" onPress={onClose} />
            <PerfilButton
              text="confirmar reunião"
              type="confirm"
              onPress={onClose}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(38, 50, 56, 0.30)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 22,
  },

  modalBox: {
    width: "100%",
    backgroundColor: "#FFFDFD",
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 18,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  modalTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#263238",
  },

  meetingOption: {
    minHeight: 46,
    borderBottomWidth: 1,
    borderBottomColor: "#D8D3D8",
    flexDirection: "row",
    alignItems: "center",
  },

  optionIcon: {
    width: 34,
    justifyContent: "center",
  },

  optionTitle: {
    flex: 1,
    fontSize: 11,
    color: "#263238",
  },

  optionValue: {
    fontSize: 10,
    color: "#777777",
  },

  subjectArea: {
    marginTop: 13,
  },

  subjectTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },

  subjectInput: {
    height: 62,
    borderWidth: 1,
    borderColor: "#CEC8CE",
    borderRadius: 7,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 10,
    color: "#263238",
    textAlignVertical: "top",
    backgroundColor: "#F5F5F5",
  },

  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 17,
    gap: 7,
  },
});