import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { logout, getToken } from "../services/auth";
import { authenticatedFetch } from "../services/api";

type CompanyDashboardPayload = {
  totalFuncionarios: number;
  totalTarefas: number;
  tarefasPendentes: number;
  tarefasConcluidas: number;
  humor: {
    media: string;
    totalRegistros: number;
    ultimoRegistro: {
      humor_func: number;
    } | null;
  };
};

export default function Dashboard() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<CompanyDashboardPayload | null>(
    null,
  );

  const fetchDashboard = useCallback(async () => {
    const token = await getToken();
    if (!token) {
      router.replace("/");
      return;
    }

    try {
      setLoading(true);
      const response = await authenticatedFetch("/dashboard/company");

      if (response.status === 401) {
        router.replace("/");
        return;
      }

      if (response.status === 403) {
        Alert.alert(
          "Acesso",
          "Este painel é apenas para empresa. Faça login como empresa.",
        );
        router.replace("/loginEmpresa");
        return;
      }

      if (!response.ok) {
        throw new Error(`Erro HTTP ${response.status}`);
      }

      const data = (await response.json()) as CompanyDashboardPayload;
      setDashboard(data);
    } catch (e) {
      console.error(e);
      Alert.alert(
        "Erro",
        "Não foi possível carregar o dashboard. Verifique sua conexão.",
      );
      router.replace("/");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      fetchDashboard();
    }, [fetchDashboard]),
  );

  const handleLogout = async () => {
    await logout();
    router.replace("/");
  };

  const isWide = width >= 680;
  const cardRowStyle = isWide ? styles.cardsRowWide : styles.cardsColumn;

  const getHumorColor = (media: string) => {
    const m = parseFloat(media);
    if (m >= 4) return "#388E3C";
    if (m >= 2.5) return "#FBC02D";
    return "#D32F2F";
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Painel estratégico</Text>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>
          Visão consolidada da empresa em tempo real (dados sob autenticação
          JWT).
        </Text>
      </View>

      {loading && !dashboard ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#285A71" />
          <Text style={styles.loadingLabel}>Carregando indicadores…</Text>
        </View>
      ) : (
        <View style={[styles.cardsWrap, cardRowStyle]}>
          <View style={[styles.card, isWide && styles.cardThird]}>
            <Text style={styles.cardEmoji}>👥</Text>
            <Text style={styles.cardTitle}>Funcionários</Text>
            <Text style={styles.metric}>
              {dashboard?.totalFuncionarios ?? "—"}
            </Text>
            <Text style={styles.cardFoot}>Cadastrados na empresa</Text>
          </View>

          <View style={[styles.card, isWide && styles.cardThird]}>
            <Text style={styles.cardEmoji}>📋</Text>
            <Text style={styles.cardTitle}>Total Tarefas</Text>
            <Text style={styles.metric}>
              {dashboard?.totalTarefas ?? "—"}
            </Text>
            <Text style={styles.cardFoot}>Volume total de trabalho</Text>
          </View>

          <View style={[styles.card, isWide && styles.cardThird]}>
            <Text style={styles.cardEmoji}>⏳</Text>
            <Text style={styles.cardTitle}>Pendentes</Text>
            <Text style={[styles.metric, { color: '#D32F2F' }]}>
              {dashboard?.tarefasPendentes ?? "—"}
            </Text>
            <Text style={styles.cardFoot}>Aguardando início ou em atraso</Text>
          </View>

          <View style={[styles.card, isWide && styles.cardThird]}>
            <Text style={styles.cardEmoji}>✅</Text>
            <Text style={styles.cardTitle}>Concluídas</Text>
            <Text style={[styles.metric, { color: '#388E3C' }]}>
              {dashboard?.tarefasConcluidas ?? "—"}
            </Text>
            <Text style={styles.cardFoot}>Produtividade confirmada</Text>
          </View>

          <View style={[styles.card, isWide && styles.cardThird]}>
            <Text style={styles.cardEmoji}>😊</Text>
            <Text style={styles.cardTitle}>Humor Médio</Text>
            <Text style={[styles.metric, { color: getHumorColor(dashboard?.humor.media || "0") }]}>
              {dashboard?.humor.media ?? "—"}
            </Text>
            <Text style={styles.cardFoot}>
              Média de bem-estar ({dashboard?.humor.totalRegistros || 0} envios)
            </Text>
          </View>

          <View style={[styles.card, isWide && styles.cardThird]}>
            <Text style={styles.cardEmoji}>📊</Text>
            <Text style={styles.cardTitle}>Status Emocional</Text>
            <Text style={[styles.metric, styles.metricMuted]}>
              {parseFloat(dashboard?.humor.media || "0") >= 3.5 ? "Positivo" : "Atenção"}
            </Text>
            <Text style={styles.cardFoot}>
              Análise baseada nos últimos registros
            </Text>
          </View>
        </View>
      )}

      <TouchableOpacity
        style={[styles.button, Platform.OS === "web" && styles.buttonWeb]}
        onPress={handleLogout}
        accessibilityRole="button"
        accessibilityLabel="Sair da conta"
      >
        <Text style={styles.buttonText}>Sair</Text>
      </TouchableOpacity>

      <Text style={styles.note}>
        FASE 8 V3 · Dashboard Completo: Produtividade & Bem-estar integrados.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: "#FEFDF9",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxWidth: 960,
    width: "100%",
    alignSelf: "center",
  },
  header: {
    marginBottom: 24,
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: "600",
    color: "#5E8A94",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#285A71",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: "#4A6270",
  },
  loadingBox: {
    alignItems: "center",
    paddingVertical: 40,
    marginBottom: 16,
  },
  loadingLabel: {
    marginTop: 12,
    color: "#666",
    fontSize: 15,
  },
  cardsWrap: {
    gap: 14,
    marginBottom: 28,
  },
  cardsColumn: {
    flexDirection: "column",
  },
  cardsRowWide: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#285A71",
    shadowOpacity: Platform.OS === "web" ? 0.06 : 0.14,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(40,90,113,0.08)",
    minHeight: 160,
    flexGrow: 1,
  },
  cardThird: {
    flexBasis: "31%",
    flexGrow: 1,
    minWidth: 200,
  },
  cardEmoji: {
    fontSize: 28,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#285A71",
    marginBottom: 8,
  },
  metric: {
    fontSize: 36,
    fontWeight: "800",
    color: "#1E4538",
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  metricMuted: {
    fontSize: 26,
    color: "#5E8A94",
    fontWeight: "600",
  },
  cardFoot: {
    fontSize: 13,
    color: "#6B7C85",
    lineHeight: 18,
  },
  button: {
    backgroundColor: "#285A71",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonWeb: {
    cursor: "pointer" as const,
  },
  buttonText: {
    color: "#ECEFDA",
    fontWeight: "700",
    fontSize: 16,
  },
  note: {
    marginTop: 20,
    fontSize: 12,
    lineHeight: 18,
    color: "#8899a3",
    textAlign: "center",
  },
});
