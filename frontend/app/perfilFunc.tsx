import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import PerfilHeader from "../components/perfil/perfilHeader";

export default function PerfilFunc() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <PerfilHeader />

        {/* FOTO / PERFIL */}
        <View style={styles.profileCard}>
          <View style={styles.photoArea}>
            <View style={styles.avatar}>
              <Ionicons
                name="person"
                size={80}
                color="#FFFFFF"
              />
            </View>

            <View style={styles.nameArea}>
              <Text style={styles.name}>
                Nome do funcionário
              </Text>

              <Text style={styles.employeeCode}>
                cod de func
              </Text>
            </View>
          </View>
        </View>

        {/* SETOR E FUNÇÃO */}
        <View style={styles.positionArea}>
          <Text style={styles.sector}>
            setor
          </Text>

          <Text style={styles.function}>
            função
          </Text>
        </View>

        {/* AVALIAÇÃO */}
        <View style={styles.evaluationRow}>
          <Text style={styles.evaluationTitle}>
            avaliação
          </Text>

          <View style={styles.stars}>
            <Ionicons name="star" size={16} color="#6D6278" />
            <Ionicons name="star" size={16} color="#6D6278" />
            <Ionicons name="star" size={16} color="#6D6278" />
            <Ionicons name="star" size={16} color="#6D6278" />
            <Ionicons name="star-outline" size={16} color="#6D6278" />
          </View>
        </View>

        {/* INFORMAÇÕES */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Cpf
          </Text>

          <Text style={styles.infoText}>
            email
          </Text>

          <Text style={styles.infoText}>
            data de nascimento
          </Text>

          <Text style={styles.infoText}>
            início do contrato
          </Text>

          <Text style={styles.infoText}>
            Pontos acumulados
          </Text>
        </View>

        {/* AÇÕES */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons
              name="calendar-outline"
              size={15}
              color="#5E4B78"
            />

            <Text style={styles.actionText}>
              tarefas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons
              name="walk-outline"
              size={15}
              color="#5E4B78"
            />

            <Text style={styles.actionText}>
              bem estar
            </Text>
          </TouchableOpacity>
        </View>

        {/* TÍTULO */}
        <Text style={styles.sectionTitle}>
          informações
        </Text>

        <View style={styles.bottomArea} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },

  scrollContent: {
    paddingBottom: 35,
  },

  /* PERFIL */

  profileCard: {
    marginHorizontal: 20,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#ECE6F0",
  },

  photoArea: {
    height: 230,
    backgroundColor: "#D6BFC4",
    justifyContent: "flex-end",
  },

  avatar: {
    position: "absolute",
    top: 25,
    left: 20,
    right: 20,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },

  nameArea: {
    paddingHorizontal: 14,
    paddingBottom: 12,
  },

  name: {
    fontSize: 25,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  employeeCode: {
    marginTop: 2,
    fontSize: 9,
    color: "#FFFFFF",
  },

  /* SETOR / FUNÇÃO */

  positionArea: {
    alignItems: "center",
    marginTop: 10,
  },

  sector: {
    fontSize: 14,
    fontWeight: "500",
    color: "#263238",
  },

  function: {
    marginTop: 1,
    fontSize: 9,
    color: "#263238",
  },

  /* AVALIAÇÃO */

  evaluationRow: {
    marginHorizontal: 20,
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  evaluationTitle: {
    fontSize: 11,
    color: "#263238",
  },

  stars: {
    flexDirection: "row",
    marginLeft: "auto",
    gap: 2,
  },

  /* INFORMAÇÕES */

  infoContainer: {
    marginHorizontal: 20,
    marginTop: 5,
    gap: 3,
  },

  infoText: {
    fontSize: 9,
    color: "#263238",
  },

  /* AÇÕES */

  actionsContainer: {
    marginHorizontal: 20,
    marginTop: 9,
    gap: 4,
  },

  actionButton: {
    alignSelf: "flex-start",
    minWidth: 72,
    height: 24,
    paddingHorizontal: 8,
    borderRadius: 5,
    backgroundColor: "#F5F1F8",
    borderWidth: 1,
    borderColor: "#D7CEDD",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  actionText: {
    fontSize: 8,
    color: "#263238",
  },

  /* SEÇÃO */

  sectionTitle: {
    marginTop: 3,
    paddingHorizontal: 20,
    paddingVertical: 7,
    backgroundColor: "#ECEAF0",
    fontSize: 12,
    color: "#263238",
  },

  bottomArea: {
    height: 150,
    backgroundColor: "#F5F5F5",
  },
});