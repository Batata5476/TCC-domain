import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import PerfilButton from "./PerfilButton";
import { authenticatedFetch } from "../../services/api";

type PerfilMeetingModalProps = {
  visible: boolean;
  onClose: () => void;
  subject: string;
  setSubject: (subject: string) => void;
  onSuccess?: () => void;
};

export default function PerfilMeetingModal({
  visible,
  onClose,
  subject,
  setSubject,
  onSuccess,
}: PerfilMeetingModalProps) {
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState("14:00");
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!subject.trim()) {
      Alert.alert("Campo obrigatório", "Por favor, informe o assunto da reunião.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await authenticatedFetch("/meetings", {
        method: "POST",
        body: JSON.stringify({
          data_reuniao: date,
          horario_reuniao: time,
          assunto_reuniao: subject.trim(),
          tipo_reuniao: "empresarial",
          participants: [],
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Erro ao agendar reunião.");
      }

      Alert.alert("Sucesso", "Reunião solicitada com sucesso!");
      setSubject("");
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      Alert.alert("Atenção", err.message || "Não foi possível criar a reunião.");
    } finally {
      setSubmitting(false);
    }
  };

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

            <TouchableOpacity onPress={onClose} disabled={submitting}>
              <Ionicons
                name="close-outline"
                size={23}
                color="#263238"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.meetingOption}>
            <View style={styles.optionIcon}>
              <Ionicons
                name="calendar-outline"
                size={20}
                color="#263238"
              />
            </View>
            <Text style={styles.optionTitle}>data da reunião</Text>
            <TextInput
              value={date}
              onChangeText={setDate}
              placeholder="AAAA-MM-DD"
              style={styles.optionInput}
            />
          </View>

          <View style={styles.meetingOption}>
            <View style={styles.optionIcon}>
              <Ionicons name="time-outline" size={20} color="#263238" />
            </View>
            <Text style={styles.optionTitle}>horário</Text>
            <TextInput
              value={time}
              onChangeText={setTime}
              placeholder="HH:MM"
              style={styles.optionInput}
            />
          </View>

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
            {submitting ? (
              <ActivityIndicator color="#285A71" />
            ) : (
              <>
                <PerfilButton text="cancelar" type="cancel" onPress={onClose} />
                <PerfilButton
                  text="confirmar reunião"
                  type="confirm"
                  onPress={handleConfirm}
                />
              </>
            )}
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

  optionInput: {
    fontSize: 11,
    color: "#263238",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: "#D8D3D8",
    borderRadius: 4,
    minWidth: 90,
    textAlign: "center",
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