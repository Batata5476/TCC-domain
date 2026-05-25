import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // import do Ionicons para os ícones usados aqui no dashbord
import { useFocusEffect, useRouter } from "expo-router";
import { authenticatedFetch } from "../services/api";
import { getToken, logout } from "../services/auth";

const cooperaLogo = require("../assets/coopera_logo.png"); // import da logo do Coopera para ser usado

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

type TaskItem = {
  id: string;
  name: string;
  points: string;
  color?: string;
};

export default function Dashboard() {
  const router = useRouter();

  const [open, setOpen] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false); // UI: controla o menu do botao +
  const [hoveredDate, setHoveredDate] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<CompanyDashboardPayload | null>(
    null,
  );

  const dates = [
    "13/07",
    "14/07",
    "15/07",
    "16/07",
    "17/07",
    "18/07",
    "19/07",
  ];

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
          "Este painel e apenas para empresa. Faca login como empresa.",
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
        "Nao foi possivel carregar o dashboard. Verifique sua conexao.",
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

  // UI: tarefas de teste usadas no card principal
  const urgentTasks: TaskItem[] = [
    { id: "1", name: "Teste1", points: "100+" },
    { id: "2", name: "Teste2", points: "95+" },
    { id: "3", name: "Teste3", points: "88+" },
    { id: "4", name: "Teste4", points: "76+" },
  ];

  // UI: item visual da lista de tarefas
  const renderTask = (task: TaskItem) => (
    <View key={task.id} style={styles.taskItem}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{task.name.charAt(0)}</Text>
      </View>

      <Text style={styles.taskName}>{task.name}</Text>

      <Text style={[styles.taskPoints, task.color && { color: task.color }]}>
        {task.points}
      </Text>

      <TouchableOpacity style={styles.checkButton} activeOpacity={0.8}>
        <Ionicons name="checkmark" size={18} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* UI: topo com logo e conta */}
      <View style={styles.header}>
        <View style={styles.logoBox}>
          <Image source={cooperaLogo} style={styles.logo} resizeMode="contain" />
        </View>

        <TouchableOpacity
          style={styles.headerAccountButton}
          activeOpacity={0.8}
          onPress={handleLogout}
          accessibilityRole="button"
          accessibilityLabel="Sair da conta"
        >
          <Ionicons name="person" size={26} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      {/* UI: seletor horizontal de datas */}
      <ScrollView
        style={styles.dateScroll}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dateContainer}
      >
        {dates.map((date, index) => {
          const isSelected = index === 0;

          return (
            <Pressable
              key={date}
              onHoverIn={() => setHoveredDate(index)} // efeito de hover para web. 
              onHoverOut={() => setHoveredDate(null)} // remove o hover quando o mouse sai do botão 
              style={[
                styles.dateButton,
                isSelected && styles.dateButtonSelected,
                hoveredDate === index && styles.dateButtonHover, 
              ]}
            >
              <Text
                style={[
                  styles.dateText,
                  isSelected && styles.dateTextSelected, // se está selecionado, muda a cor do texto 
                ]}
              >
                {date}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* UI: cards de tarefas */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.cardHeader}
            onPress={() => setOpen(!open)} // toggle para abrir/fechar a lista de tarefas
            activeOpacity={0.8}
          >
            <Text style={styles.cardTitle}>Tarefas Urgentes</Text>

            <Ionicons
              name={open ? "chevron-up" : "chevron-down"} // muda o ícone dependendo se a lista está aberta ou fechada 
              size={24}
              color="#285A71"
            />
          </TouchableOpacity>

          {open && ( 
            <View style={styles.taskList}>
              {loading && !dashboard ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color="#285A71" />
                  <Text style={styles.loadingLabel}>Carregando dados</Text>
                </View>
              ) : (
                urgentTasks.map(renderTask)
              )}
            </View>
          )}
        </View>

        <View style={[styles.card, styles.cardSpacing]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Outras Tarefas</Text>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* UI: menu que abre acima do botao + */}
      {menuOpen && (
        <View style={styles.dropupMenu}>
          <TouchableOpacity
            style={styles.menuCard}
            activeOpacity={0.85}
            onPress={() => setMenuOpen(false)} // aqui você pode adicionar a navegação para a tela de criação de tarefas
          >
            <Ionicons name="star" size={16} color="#285A71" />
            <Text style={styles.menuText}>Tarefa</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* UI: botao flutuante + / X */}
      <TouchableOpacity
        style={[styles.floatingButton, menuOpen && styles.floatingButtonActive]} // muda a cor do botão quando está ativo (aberto) 
        activeOpacity={0.85}
        onPress={() => setMenuOpen(!menuOpen)} // toggle para abrir/fechar o menu
      >
        <Ionicons
          name={menuOpen ? "close" : "add"} // Quando estiver aberto, mostra o ícone de fechar (X), caso contrário, mostra o ícone de adicionar (+) 
          size={34}
          color="#FFFFFF"
        />
      </TouchableOpacity>

      {/* UI: barra de navegacao inferior */}
      <View style={styles.bottomNavigation}>
        <TouchableOpacity style={styles.navButton} activeOpacity={0.8}>
          <Ionicons name="home" size={26} color="#285A71" />
          <Text style={styles.navLabel}>central</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} activeOpacity={0.8}>
          <Ionicons name="chatbubble-ellipses" size={26} color="#94A3B8" />
          <Text style={styles.navLabel}>chats</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FEFDF9",
  },

  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  logoBox: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },

  logo: {
    width: 28,
    height: 28,
    tintColor: "#66B300", // aplica a cor verde da logo do Coopera usando tintColor
  },

  headerAccountButton: {
    padding: 10,
  },

  dateScroll: {
    flexGrow: 0,
    flexShrink: 0,
    height: 70,
    maxHeight: 70,
  },

  dateContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 12,
  },

  dateButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    width: 70,
    height: 50,
    backgroundColor: "#ECEFD9",
    justifyContent: "center",
    alignItems: "center",
  },

  dateButtonSelected: {
    backgroundColor: "#285A71",
  },

  dateButtonHover: {
    transform: [{ translateY: -4 }],
    shadowColor: "#285A71",
    shadowOpacity: 0.16,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 4,
  },

  dateText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#285A71",
  },

  dateTextSelected: {
    color: "#FFFFFF",
  },

  content: {
    flex: 1, // faz o scroll ocupar todo o espaço restante 
  },

  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    marginTop: 10,
  },

  card: {
    backgroundColor: "#ECEFD9",
    borderRadius: 20,
    borderColor: "#000000",
    borderWidth: 0.5,
    padding: 20,
    shadowColor: "#285A71",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 4, //sombra mais suave
    },
    elevation: 3,
  },

  cardSpacing: {
    marginTop: 18,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  cardTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#285A71",
  },

  taskList: {
    marginTop: 20,
    gap: 14,
  },

  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 14,
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#285A71",
    justifyContent: "center",
    alignItems: "center",
  },

  avatarText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  taskName: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    fontWeight: "600",
    color: "#285A71",
  },

  taskPoints: {
    marginRight: 12,
    fontSize: 14,
    fontWeight: "700",
    color: "#388E3C",
  },

  checkButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#285A71",
    justifyContent: "center",
    alignItems: "center",
  },

  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 14,
  },

  loadingLabel: {
    color: "#285A71",
    fontSize: 14,
    fontWeight: "600",
  },

  dropupMenu: {
    position: "absolute",
    right: 24,
    bottom: 200,
    alignItems: "flex-end",
  },

  menuCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    borderColor: "#E5E7EB",
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: "#285A71",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 5,
  },

  menuText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#285A71",
  },

  floatingButton: {
    position: "absolute",
    right: 24,
    bottom: 115,
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#285A71",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#285A71",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    marginBottom: 10,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 8,
  },

  floatingButtonActive: {
    backgroundColor: "#1E4253",

  },

  bottomNavigation: {
    height: 80,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: 10,
  },

  navButton: {
    minWidth: 64,
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  navLabel: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: "700",
    color: "#285A71",
  },
});
