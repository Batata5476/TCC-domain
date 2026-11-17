import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { authenticatedFetch } from "../services/api";

type WorkRecord = {
  pk_id_ponto: number;
  data_ponto: string;
  entrada: string;
  saida: string;
  total_dia: string;
};

export default function DadosTrabalhistas() {
  const router = useRouter();
  const [agora, setAgora] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [ultimoPonto, setUltimoPonto] = useState<WorkRecord | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setAgora(new Date());
    }, 1000);

    fetchPonto();

    return () => clearInterval(timer);
  }, []);

  const fetchPonto = async () => {
    try {
      setLoading(true);
      const res = await authenticatedFetch("/work");
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          setUltimoPonto(json.data[0]);
        }
      }
    } catch (error) {
      console.log("Erro ao carregar dados de ponto:", error);
    } finally {
      setLoading(false);
    }
  };

  const data = agora.toLocaleDateString("pt-BR");

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.replace("/dashboard")}
        >
          <Ionicons name="arrow-back" size={22} color="#1C1B1F" />
        </TouchableOpacity>
      </View>

      {/* CARD SALÁRIO */}
      <View style={styles.card}>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>salário</Text>
          <Text style={styles.cardSubtitle}>Informações salariais</Text>
          <Text style={styles.salaryValue}>Não informado pelo RH</Text>
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
          <Text style={styles.cardSubtitle}>
            {ultimoPonto
              ? `Último registro: ${new Date(ultimoPonto.data_ponto).toLocaleDateString("pt-BR")}`
              : "Sem registros de ponto hoje"}
          </Text>
        </View>

        <View style={styles.cardFooter}>
          {loading ? (
            <ActivityIndicator size="small" color="#2A5768" />
          ) : (
            <View style={styles.badgeGroup}>
              <View style={styles.darkBadge}>
                <Text style={styles.darkBadgeText}>
                  Entrada: {ultimoPonto?.entrada || "--:--"}
                </Text>
              </View>
              <View style={styles.lightBadge}>
                <Text style={styles.lightBadgeText}>
                  Total: {ultimoPonto?.total_dia || "00:00:00"}
                </Text>
              </View>
            </View>
          )}
          <Ionicons name="chevron-down" size={20} color="#1C1B1F" />
        </View>
      </View>

      {/* CARD FOLGAS */}
      <View style={styles.card}>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>folgas</Text>
          <Text style={styles.cardSubtitle}>Sem folgas programadas para a semana</Text>
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