import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";

import { useRouter } from "expo-router";
import PerfilHeader from "../components/perfil/perfilHeader";
import PerfilMeetingModal from "../components/perfil/PerfilMeetingModal";
import PerfilMedicalModal from "../components/perfil/PerfilMedicalModal";
import PerfilAction from "../components/perfil/PerfilAction";

const humorOptions = {
  angry: {
    id: 1,
    image: require("../assets/angry.png"),
    text: "Raiva",
  },

  sad: {
    id: 2,
    image: require("../assets/sad.png"),
    text: "Triste",
  },

  neutral: {
    id: 3,
    image: require("../assets/neutral.png"),
    text: "Neutra",
  },

  happy: {
    id: 4,
    image: require("../assets/happy.png"),
    text: "Feliz",
  },

  good: {
    id: 5,
    image: require("../assets/good.png"),
    text: "Muito Feliz",
  },
};

export function Emotions() {
  const router = useRouter();

  const [humorSelecionado, setHumorSelecionado] =
    useState<number | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [occurrenceModalVisible, setOccurrenceModalVisible] = useState(false);

  const [subject, setSubject] = useState("");

  return (
    <View style={styles.container}>
      <PerfilHeader />

      {/* Seção das emoções */}
      <View style={styles.emotionSection}>
        <Text style={styles.title}>
          Como você está se sentindo hoje?
        </Text>

        <View style={styles.emotionsContainer}>
          {Object.values(humorOptions).map((humor) => (
            <TouchableOpacity
              key={humor.id}
              style={[
                styles.emotionButton,
                humorSelecionado === humor.id &&
                  styles.emotionButtonSelected,
              ]}
              onPress={() => setHumorSelecionado(humor.id)}
              activeOpacity={0.7}
            >
              <Image
                source={humor.image}
                style={styles.emotionImage}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Card Histórico Médico */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          Histórico Médico
        </Text>

        <Text style={styles.cardContent}>
          Card Content
        </Text>
      </View>

      {/* Card Atestados Médicos */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          Atestados Médicos
        </Text>

        <Text style={styles.cardContent}>
          Card Content
        </Text>
      </View>

      {/* Ferramentas do perfil */}
      <View style={styles.actionsContainer}>
        <PerfilAction
          icon="calendar-outline"
          text="solicitar reunião"
          onPress={() => setModalVisible(true)}
          showAdd={false}
        />

        <PerfilAction
          icon="alert-circle-outline"
          text="relatar ocorrência"
          onPress={() => setOccurrenceModalVisible(true)}
          showAdd={false}
        />
      </View>

      {/* Modal de reunião */}
      <PerfilMeetingModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        subject={subject}
        setSubject={setSubject}
      />

      <PerfilMedicalModal
        visible={occurrenceModalVisible}
        onClose={() => setOccurrenceModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  emotionSection: {
    alignItems: "center",
  },

  title: {
    marginHorizontal: 20,
    marginTop: 6,
    marginBottom: 18,
    fontSize: 20,
    fontWeight: "700",
    color: "#285A71",
    textAlign: "center",
  },

  emotionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "90%",
  },

  emotionButton: {
    padding: 5,
    borderRadius: 50,
  },

  emotionButtonSelected: {
    backgroundColor: "#E5E5E5",
  },

  emotionImage: {
    width: 50,
    height: 50,
    resizeMode: "contain",
  },

  card: {
    marginHorizontal: 20,
    marginTop: 25,
    padding: 20,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    elevation: 3,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#285A71",
  },

  cardContent: {
    marginTop: 10,
    fontSize: 14,
    color: "#555555",
  },

  actionsContainer: {
    marginTop: 20,
  },
});
2
export default Emotions;