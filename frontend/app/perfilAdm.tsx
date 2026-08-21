import React, { useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text } from "react-native";
import PerfilAction from "../components/perfil/PerfilAction";
import PerfilAvatar from "../components/perfil/PerfilAvatar";
import PerfilHeader from "../components/perfil/perfilHeader";
import PerfilInfo from "../components/perfil/PerfilInfo";
import PerfilMeetingModal from "../components/perfil/PerfilMeetingModal";

export default function PerfilAdm() {
  const [meetingOpen, setMeetingOpen] = useState(false);
  const [subject, setSubject] = useState("");

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <PerfilHeader />

        {/* ================= TÍTULO ================= */}

        <Text style={styles.title}>
          Perfil administrativo
        </Text>

        <PerfilAvatar />

        <PerfilInfo />

        {/* ================= FERRAMENTAS ================= */}

        <Text style={styles.sectionTitle}>
          ferramentas do colaborador
        </Text>

        <PerfilAction
          icon="wallet-outline"
          text="salário e banco de horas"
          onAdd={() => setMeetingOpen(true)}
        />
        <PerfilAction
          icon="trophy-outline"
          text="sistema de pontuações"
          onAdd={() => setMeetingOpen(true)}
        />
        <PerfilAction
          icon="medkit-outline"
          text="histórico médico e bem-estar"
          onAdd={() => setMeetingOpen(true)}
        />
        <PerfilAction
          icon="people-outline"
          text="funcionários"
          onAdd={() => setMeetingOpen(true)}
        />
      </ScrollView>

      <PerfilMeetingModal
        visible={meetingOpen}
        onClose={() => setMeetingOpen(false)}
        subject={subject}
        setSubject={setSubject}
      />
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

  /* TÍTULO */

  title: {
    marginHorizontal: 20,
    marginTop: 3,
    marginBottom: 12,
    fontSize: 16,
    fontWeight: "600",
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

});