import React, { useState } from "react";
import {
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function PerfilAdm() {
  const [meetingOpen, setMeetingOpen] = useState(false);
  const [subject, setSubject] = useState("");

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ================= HEADER ================= */}

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

        {/* ================= TÍTULO ================= */}

        <Text style={styles.title}>
          Perfil administrativo
        </Text>

        {/* ================= FOTO ================= */}

        <View style={styles.photoContainer}>
          <View style={styles.avatar}>
            <Ionicons
              name="person"
              size={54}
              color="#FFFFFF"
            />
          </View>
        </View>

        {/* ================= INFORMAÇÕES ================= */}

        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Ionicons
              name="mail-outline"
              size={16}
              color="#263238"
            />

            <Text style={styles.infoText}>
              email@email.com
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons
              name="card-outline"
              size={16}
              color="#263238"
            />

            <Text style={styles.infoText}>
              000.000.000-00
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons
              name="call-outline"
              size={16}
              color="#263238"
            />

            <Text style={styles.infoText}>
              (00) 00000-0000
            </Text>
          </View>
        </View>

        {/* ================= FERRAMENTAS ================= */}

        <Text style={styles.sectionTitle}>
          ferramentas do colaborador
        </Text>

        {/* SALÁRIO */}

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons
              name="wallet-outline"
              size={18}
              color="#FFFFFF"
            />

            <Text style={styles.actionText}>
              salário e banco de horas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setMeetingOpen(true)}
          >
            <Ionicons
              name="add-circle-outline"
              size={23}
              color="#263238"
            />
          </TouchableOpacity>
        </View>

        {/* PONTUAÇÕES */}

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons
              name="trophy-outline"
              size={18}
              color="#FFFFFF"
            />

            <Text style={styles.actionText}>
              sistema de pontuações
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setMeetingOpen(true)}
          >
            <Ionicons
              name="add-circle-outline"
              size={23}
              color="#263238"
            />
          </TouchableOpacity>
        </View>

        {/* HISTÓRICO */}

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons
              name="medkit-outline"
              size={18}
              color="#FFFFFF"
            />

            <Text style={styles.actionText}>
              histórico médico e bem-estar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setMeetingOpen(true)}
          >
            <Ionicons
              name="add-circle-outline"
              size={23}
              color="#263238"
            />
          </TouchableOpacity>
        </View>

        {/* FUNCIONÁRIOS */}

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons
              name="people-outline"
              size={18}
              color="#FFFFFF"
            />

            <Text style={styles.actionText}>
              funcionários
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setMeetingOpen(true)}
          >
            <Ionicons
              name="add-circle-outline"
              size={23}
              color="#263238"
            />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ================================================= */}
      {/*              MODAL - SOLICITAR REUNIÃO           */}
      {/* ================================================= */}

      <Modal
        visible={meetingOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setMeetingOpen(false)}
      >
        <View style={styles.modalOverlay}>

          <View style={styles.modalBox}>

            {/* CABEÇALHO */}

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                solicitar reunião
              </Text>

              <TouchableOpacity
                onPress={() => setMeetingOpen(false)}
              >
                <Ionicons
                  name="close-outline"
                  size={23}
                  color="#263238"
                />
              </TouchableOpacity>
            </View>

            {/* DATA */}

            <TouchableOpacity style={styles.meetingOption}>
              <View style={styles.optionIcon}>
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color="#263238"
                />
              </View>

              <Text style={styles.optionTitle}>
                definir data
              </Text>

              <Text style={styles.optionValue}>
                10+
              </Text>
            </TouchableOpacity>

            {/* HORÁRIO */}

            <TouchableOpacity style={styles.meetingOption}>
              <View style={styles.optionIcon}>
                <Ionicons
                  name="time-outline"
                  size={20}
                  color="#263238"
                />
              </View>

              <Text style={styles.optionTitle}>
                definir horário
              </Text>

              <Text style={styles.optionValue}>
                10+
              </Text>
            </TouchableOpacity>

            {/* ASSUNTO */}

            <View style={styles.subjectArea}>

              <View style={styles.subjectTitleRow}>
                <Ionicons
                  name="chatbox-outline"
                  size={20}
                  color="#263238"
                />

                <Text style={styles.optionTitle}>
                  assunto reunião
                </Text>
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

            {/* BOTÕES */}

            <View style={styles.modalButtons}>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setMeetingOpen(false)}
              >
                <Text style={styles.cancelText}>
                  cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => {
                  setMeetingOpen(false);
                }}
              >
                <Text style={styles.confirmText}>
                  confirmar reunião
                </Text>
              </TouchableOpacity>

            </View>

          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* ================================================= */
/*                    ESTILOS                        */
/* ================================================= */

const styles = StyleSheet.create({

  /* FUNDO */

  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },

  scrollContent: {
    paddingBottom: 35,
  },

  /* HEADER */

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

  /* TÍTULO */

  title: {
    marginHorizontal: 20,
    marginTop: 3,
    marginBottom: 12,
    fontSize: 16,
    fontWeight: "600",
    color: "#263238",
  },

  /* FOTO */

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

  /* INFORMAÇÕES */

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

  /* TÍTULO DA SEÇÃO */

  sectionTitle: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 9,
    fontSize: 10,
    color: "#263238",
    fontWeight: "500",
  },

  /* LINHA DOS BOTÕES */

  actionRow: {
    marginHorizontal: 20,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },

  /* BOTÃO PRINCIPAL */

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

  /* BOTÃO + */

  addButton: {
    width: 35,
    height: 39,
    marginLeft: 6,
    justifyContent: "center",
    alignItems: "center",
  },

  /* ================================================= */
  /*                     MODAL                         */
  /* ================================================= */

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

  /* OPÇÕES */

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

  /* ASSUNTO */

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

  /* BOTÕES DO MODAL */

  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 17,
    gap: 7,
  },

  cancelButton: {
    height: 35,
    paddingHorizontal: 13,
    justifyContent: "center",
    alignItems: "center",
  },

  cancelText: {
    fontSize: 10,
    color: "#285A71",
    fontWeight: "500",
  },

  confirmButton: {
    height: 35,
    paddingHorizontal: 13,
    borderRadius: 6,
    backgroundColor: "#285A71",
    justifyContent: "center",
    alignItems: "center",
  },

  confirmText: {
    fontSize: 10,
    color: "#FFFFFF",
    fontWeight: "500",
  },
});