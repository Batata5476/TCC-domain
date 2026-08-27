import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function DadosTrabalhistas() {
  const router = useRouter();
  const [agora, setAgora] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setAgora(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const data = agora.toLocaleDateString("pt-BR"); // dd/mm/aaaa
  const hora = agora.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={22} color="#1C1B1F" />
        </TouchableOpacity>
      </View>

      {/* CARD SALÁRIO */}
      <View style={styles.card}>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>salário</Text>
          <Text style={styles.cardSubtitle}>Salário mensal</Text>
          <Text style={styles.salaryValue}>R$ 2.500,00</Text>
        </View>

        <View style={styles.cardFooter}>
          <View />
          <Ionicons name="chevron-down" size={20} color="#1C1B1F" />
        </View>
      </View>

      {/* CARD CARGA HORÁRIA */}
      <View style={styles.card}>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>carga horária</Text>
          <Text style={styles.cardSubtitle}>horas trabalhadas hoje</Text>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.badgeGroup}>
            <View style={styles.darkBadge}>
              <Text style={styles.darkBadgeText}>{data}</Text>
            </View>
            <View style={styles.lightBadge}>
              <Text style={styles.lightBadgeText}>{hora}</Text>
            </View>
          </View>
          <Ionicons name="chevron-down" size={20} color="#1C1B1F" />
        </View>
      </View>

      {/* CARD FOLGAS */}
      <View style={styles.card}>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>folgas</Text>
          <Text style={styles.cardSubtitle}>semana do dia {data}</Text>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.badgeGroup}>
            <View style={styles.darkBadge}>
              <Text style={styles.darkBadgeText}>{data}</Text>
            </View>
          </View>
          <Ionicons name="chevron-down" size={20} color="#1C1B1F" />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  /* HEADER */
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },

  headerButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
  },

  /* CARDS */
  card: {
    marginHorizontal: 20,
    marginTop: 16,
    padding: 22,
    backgroundColor: "#EFEFE7",
    borderRadius: 24,
    minHeight: 140,
    justifyContent: "space-between",
  },

  cardContent: {
    gap: 4,
  },

  cardTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1C1B1F",
  },

  cardSubtitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1C1B1F",
    marginTop: 2,
  },

  salaryValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1C1B1F",
    marginTop: 12,
  },

  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
  },

  badgeGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  darkBadge: {
    backgroundColor: "#2A5768",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },

  darkBadgeText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },

  lightBadge: {
    backgroundColor: "#E6ECBF",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },

  lightBadgeText: {
    color: "#1C1B1F",
    fontSize: 13,
    fontWeight: "600",
  },
});