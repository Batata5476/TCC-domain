import React, { useCallback, useState, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // import do Ionicons para os ícones usados aqui no dashboard
import { useFocusEffect, useRouter } from "expo-router";
import { authenticatedFetch } from "../services/api";
import { getToken, logout } from "../services/auth";

const cooperaLogo = require("../assets/coopera_logo.png"); // import da logo do Coopera para ser usado

// ─── Tipos ───────────────────────────────────────────────────────────────────

type UserDashboardPayload = {
  id: number;
  nome: string;
  email: string;
  pontos: number;
  foto: string | null;
  tarefasPendentes: number;
  tarefasConcluidas: number;
};

type CompanyDashboardPayload = {
  totalFuncionarios: number;
  totalTarefas: number;
  tarefasPendentes: number;
  tarefasConcluidas: number;
  humor: {
    media: string;
    totalRegistros: number;
    ultimoRegistro: { humor_func: number } | null;
  };
};

type TaskItem = {
  id: number;
  name: string;
  points: string;
  priority: number; // 1 = Urgente, 2 = Normal
  status: number;   // 1 = Concluída, 2 = Em andamento, 3 = Pendente
  dueDate: string;
};

// ─── Componente ──────────────────────────────────────────────────────────────

export default function Dashboard() {
  const router = useRouter();

  // Estados de UI (mantidos do visual original)
  const [open, setOpen] = useState(true);
  const [otherOpen, setOtherOpen] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false); // controla o menu do botão +
  const [hoveredDate, setHoveredDate] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Estados de dados
  const [userType, setUserType] = useState<"user" | "company" | null>(null);
  const [userData, setUserData] = useState<UserDashboardPayload | null>(null);
  const [companyData, setCompanyData] = useState<CompanyDashboardPayload | null>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);

  // Datas dinâmicas (próximos 7 dias a partir de hoje)
  const [datesList, setDatesList] = useState<{ label: string; dateString: string }[]>([]);
  const [selectedDateStr, setSelectedDateStr] = useState<string>("");

  // Modal de informações da conta
  const [accountModalVisible, setAccountModalVisible] = useState(false);

  // Modal de criação de tarefa
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskPriority, setTaskPriority] = useState(2); // 2 = Normal por padrão
  const [taskDueDate, setTaskDueDate] = useState<"hoje" | "amanha" | "semana">("hoje");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);

  // Gera os próximos 7 dias dinamicamente
  useEffect(() => {
    const list: { label: string; dateString: string }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const dateString = d.toISOString().split("T")[0];
      list.push({ label: `${day}/${month}`, dateString });
    }
    setDatesList(list);
    setSelectedDateStr(list[0]?.dateString ?? "");
  }, []);

  // ── Carregamento de dados ──────────────────────────────────────────────────

  const fetchDashboard = useCallback(async () => {
    const token = await getToken();
    if (!token) {
      router.replace("/");
      return;
    }

    try {
      setLoading(true);

      // Tenta carregar dados do funcionário
      const userRes = await authenticatedFetch("/dashboard/user");

      if (userRes.status === 401) {
        router.replace("/");
        return;
      }

      if (userRes.ok) {
        const body = await userRes.json();
        setUserType("user");
        setUserData(body.data);

        // Tarefas do funcionário
        const tasksRes = await authenticatedFetch("/tasks/my-tasks");
        if (tasksRes.ok) {
          const tasksBody = await tasksRes.json();
          setTasks(tasksBody.data ?? []);
        }
      } else {
        // Senão é empresa
        const companyRes = await authenticatedFetch("/dashboard/company");
        if (companyRes.ok) {
          const body = await companyRes.json();
          setUserType("company");
          setCompanyData(body);

          // Lista de colaboradores para atribuição de tarefas
          const empRes = await authenticatedFetch("/users");
          if (empRes.ok) {
            const empBody = await empRes.json();
            setEmployees(empBody.data ?? []);
          }
        } else {
          router.replace("/");
        }
      }
    } catch (e) {
      console.error(e);
      Alert.alert("Erro", "Não foi possível carregar o dashboard. Verifique sua conexão.");
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

  // ── Ações ──────────────────────────────────────────────────────────────────

  const handleLogout = async () => {
    setAccountModalVisible(false);
    await logout();
    router.replace("/");
  };

  const handleCompleteTask = async (taskId: number) => {
    try {
      const response = await authenticatedFetch(`/tasks/${taskId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: 1 }),
      });

      if (response.ok) {
        Alert.alert("Sucesso 🎉", "Tarefa concluída! +100 pontos adicionados.");
        fetchDashboard();
      } else {
        Alert.alert("Erro", "Não foi possível atualizar a tarefa.");
      }
    } catch (e) {
      console.error(e);
      Alert.alert("Erro", "Erro ao conectar com o servidor.");
    }
  };

  const handleCreateTask = async () => {
    if (!taskTitle.trim()) {
      Alert.alert("Erro", "Por favor, preencha o título da tarefa.");
      return;
    }

    if (userType === "company" && !selectedEmployeeId) {
      Alert.alert("Erro", "Por favor, selecione um colaborador.");
      return;
    }

    const dueDate = new Date();
    if (taskDueDate === "amanha") dueDate.setDate(dueDate.getDate() + 1);
    else if (taskDueDate === "semana") dueDate.setDate(dueDate.getDate() + 7);

    try {
      const body: any = {
        tipo_tarefa: taskTitle,
        validade_tarefa: dueDate.toISOString().split("T")[0],
        prioridade_tarefa: taskPriority,
      };
      if (userType === "company") body.fk_id_func = selectedEmployeeId;

      const response = await authenticatedFetch("/tasks", {
        method: "POST",
        body: JSON.stringify(body),
      });

      if (response.ok) {
        Alert.alert("Sucesso", "Tarefa criada com sucesso!");
        setTaskModalVisible(false);
        setTaskTitle("");
        setSelectedEmployeeId(null);
        setMenuOpen(false);
        fetchDashboard();
      } else {
        const err = await response.json();
        Alert.alert("Erro", err.message || "Erro ao criar tarefa.");
      }
    } catch (e) {
      console.error(e);
      Alert.alert("Erro", "Não foi possível cadastrar a tarefa.");
    }
  };

  // ── Filtragem de tarefas por data e prioridade ────────────────────────────

  const activeTasks = tasks.filter((t) => {
    if (!t.dueDate) return false;
    return t.dueDate.split("T")[0] === selectedDateStr && t.status !== 1;
  });

  const urgentTasks = activeTasks.filter((t) => t.priority === 1);
  const otherTasks = activeTasks.filter((t) => t.priority === 2);

  // ── Renderização de item de tarefa (visual original) ──────────────────────

  const renderTask = (task: TaskItem) => (
    <View key={task.id} style={styles.taskItem}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{task.name.charAt(0).toUpperCase()}</Text>
      </View>

      <Text style={styles.taskName}>{task.name}</Text>

      <Text style={styles.taskPoints}>{task.points}+</Text>

      <TouchableOpacity
        style={styles.checkButton}
        activeOpacity={0.8}
        onPress={() => handleCompleteTask(task.id)}
      >
        <Ionicons name="checkmark" size={18} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container}>
      {/* UI: topo com logo e ícone de conta — visual original mantido */}
      <View style={styles.header}>
        <View style={styles.logoBox}>
          <Image source={cooperaLogo} style={styles.logo} resizeMode="contain" />
        </View>

        {/* Ícone de conta: abre painel de informações (não faz logout) */}
        <TouchableOpacity
          style={styles.headerAccountButton}
          activeOpacity={0.8}
          onPress={() => setAccountModalVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Informações da conta"
        >
          <Ionicons name="person" size={26} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      {/* UI: seletor horizontal de datas — agora dinâmico */}
      <ScrollView
        style={styles.dateScroll}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dateContainer}
      >
        {datesList.map((item, index) => {
          const isSelected = item.dateString === selectedDateStr;

          return (
            <Pressable
              key={item.dateString}
              onHoverIn={() => setHoveredDate(index)}
              onHoverOut={() => setHoveredDate(null)}
              onPress={() => setSelectedDateStr(item.dateString)}
              style={[
                styles.dateButton,
                isSelected && styles.dateButtonSelected,
                hoveredDate === index && styles.dateButtonHover,
              ]}
            >
              <Text
                style={[
                  styles.dateText,
                  isSelected && styles.dateTextSelected,
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* UI: cards de tarefas — visual original mantido */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Card Tarefas Urgentes */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.cardHeader}
            onPress={() => setOpen(!open)}
            activeOpacity={0.8}
          >
            <Text style={styles.cardTitle}>Tarefas Urgentes</Text>

            <Ionicons
              name={open ? "chevron-up" : "chevron-down"}
              size={24}
              color="#285A71"
            />
          </TouchableOpacity>

          {open && (
            <View style={styles.taskList}>
              {loading && tasks.length === 0 ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color="#285A71" />
                  <Text style={styles.loadingLabel}>Carregando dados</Text>
                </View>
              ) : urgentTasks.length === 0 ? (
                <Text style={styles.emptyText}>
                  Nenhuma tarefa urgente para este dia.
                </Text>
              ) : (
                urgentTasks.map(renderTask)
              )}
            </View>
          )}
        </View>

        {/* Card Outras Tarefas */}
        <View style={[styles.card, styles.cardSpacing]}>
          <TouchableOpacity
            style={styles.cardHeader}
            onPress={() => setOtherOpen(!otherOpen)}
            activeOpacity={0.8}
          >
            <Text style={styles.cardTitle}>Outras Tarefas</Text>

            <Ionicons
              name={otherOpen ? "chevron-up" : "chevron-down"}
              size={24}
              color="#285A71"
            />
          </TouchableOpacity>

          {otherOpen && (
            <View style={styles.taskList}>
              {otherTasks.length === 0 ? (
                <Text style={styles.emptyText}>
                  Nenhuma outra tarefa para este dia.
                </Text>
              ) : (
                otherTasks.map(renderTask)
              )}
            </View>
          )}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* UI: menu que abre acima do botão + */}
      {menuOpen && (
        <View style={styles.dropupMenu}>
          <TouchableOpacity
            style={styles.menuCard}
            activeOpacity={0.85}
            onPress={() => {
              setMenuOpen(false);
              setTaskModalVisible(true);
            }}
          >
            <Ionicons name="star" size={16} color="#285A71" />
            <Text style={styles.menuText}>Tarefa</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* UI: botão flutuante + / X */}
      <TouchableOpacity
        style={[styles.floatingButton, menuOpen && styles.floatingButtonActive]}
        activeOpacity={0.85}
        onPress={() => setMenuOpen(!menuOpen)}
      >
        <Ionicons
          name={menuOpen ? "close" : "add"}
          size={34}
          color="#FFFFFF"
        />
      </TouchableOpacity>

      {/* UI: barra de navegação inferior */}
      <View style={styles.bottomNavigation}>
        <TouchableOpacity style={styles.navButton} activeOpacity={0.8}>
          <Ionicons name="home" size={26} color="#285A71" />
          <Text style={styles.navLabel}>central</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          activeOpacity={0.8}
          onPress={() => router.push("/chat")}
        >
          <Ionicons name="chatbubble-ellipses" size={26} color="#94A3B8" />
          <Text style={styles.navLabel}>chats</Text>
        </TouchableOpacity>
      </View>

      {/* ─── Modal: Informações da Conta ──────────────────────────────────── */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={accountModalVisible}
        onRequestClose={() => setAccountModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setAccountModalVisible(false)}
        >
          <Pressable style={styles.accountModal} onPress={() => {}}>
            {/* Cabeçalho */}
            <View style={styles.accountModalHeader}>
              <Text style={styles.accountModalTitle}>Minha Conta</Text>
              <TouchableOpacity onPress={() => setAccountModalVisible(false)}>
                <Ionicons name="close" size={24} color="#285A71" />
              </TouchableOpacity>
            </View>

            {/* Avatar */}
            <View style={styles.accountAvatar}>
              <Ionicons name="person" size={40} color="#FFFFFF" />
            </View>

            {/* Dados do usuário */}
            {userType === "user" && userData && (
              <View style={styles.accountInfo}>
                <Text style={styles.accountName}>{userData.nome}</Text>
                <Text style={styles.accountEmail}>{userData.email}</Text>

                <View style={styles.accountStatRow}>
                  <View style={styles.accountStat}>
                    <Ionicons name="trophy" size={22} color="#D97706" />
                    <Text style={styles.accountStatValue}>{userData.pontos}</Text>
                    <Text style={styles.accountStatLabel}>Pontos</Text>
                  </View>

                  <View style={styles.accountStat}>
                    <Ionicons name="checkmark-circle" size={22} color="#16A34A" />
                    <Text style={styles.accountStatValue}>{userData.tarefasConcluidas}</Text>
                    <Text style={styles.accountStatLabel}>Concluídas</Text>
                  </View>

                  <View style={styles.accountStat}>
                    <Ionicons name="time" size={22} color="#285A71" />
                    <Text style={styles.accountStatValue}>{userData.tarefasPendentes}</Text>
                    <Text style={styles.accountStatLabel}>Pendentes</Text>
                  </View>
                </View>
              </View>
            )}

            {userType === "company" && companyData && (
              <View style={styles.accountInfo}>
                <Text style={styles.accountName}>Painel Corporativo</Text>

                <View style={styles.accountStatRow}>
                  <View style={styles.accountStat}>
                    <Ionicons name="people" size={22} color="#285A71" />
                    <Text style={styles.accountStatValue}>{companyData.totalFuncionarios}</Text>
                    <Text style={styles.accountStatLabel}>Colaboradores</Text>
                  </View>

                  <View style={styles.accountStat}>
                    <Ionicons name="checkmark-circle" size={22} color="#16A34A" />
                    <Text style={styles.accountStatValue}>{companyData.tarefasConcluidas}</Text>
                    <Text style={styles.accountStatLabel}>Concluídas</Text>
                  </View>

                  <View style={styles.accountStat}>
                    <Ionicons name="time" size={22} color="#D97706" />
                    <Text style={styles.accountStatValue}>{companyData.tarefasPendentes}</Text>
                    <Text style={styles.accountStatLabel}>Pendentes</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Botão de logout */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
              <Text style={styles.logoutButtonText}>Sair da Conta</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ─── Modal: Criar Tarefa ───────────────────────────────────────────── */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={taskModalVisible}
        onRequestClose={() => setTaskModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.taskModal}>
            <View style={styles.accountModalHeader}>
              <Text style={styles.accountModalTitle}>Nova Tarefa</Text>
              <TouchableOpacity onPress={() => setTaskModalVisible(false)}>
                <Ionicons name="close" size={24} color="#285A71" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Título / Descrição</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Ex: Enviar relatório do setor"
              placeholderTextColor="#94A3B8"
              value={taskTitle}
              onChangeText={setTaskTitle}
            />

            <Text style={styles.inputLabel}>Prioridade</Text>
            <View style={styles.optionRow}>
              <TouchableOpacity
                style={[styles.optionBtn, taskPriority === 1 && styles.optionBtnUrgent]}
                onPress={() => setTaskPriority(1)}
              >
                <Text style={[styles.optionText, taskPriority === 1 && styles.optionTextActive]}>
                  Urgente
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.optionBtn, taskPriority === 2 && styles.optionBtnNormal]}
                onPress={() => setTaskPriority(2)}
              >
                <Text style={[styles.optionText, taskPriority === 2 && styles.optionTextActive]}>
                  Normal
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Prazo</Text>
            <View style={styles.optionRow}>
              {(["hoje", "amanha", "semana"] as const).map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[styles.optionBtn, taskDueDate === opt && styles.optionBtnNormal]}
                  onPress={() => setTaskDueDate(opt)}
                >
                  <Text style={[styles.optionText, taskDueDate === opt && styles.optionTextActive]}>
                    {opt === "hoje" ? "Hoje" : opt === "amanha" ? "Amanhã" : "7 Dias"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Seleção de colaborador (apenas para empresa) */}
            {userType === "company" && (
              <>
                <Text style={styles.inputLabel}>Atribuir Colaborador</Text>
                <ScrollView style={styles.employeeList} nestedScrollEnabled>
                  {employees.map((emp) => {
                    const sel = selectedEmployeeId === emp.pk_id_func;
                    return (
                      <TouchableOpacity
                        key={emp.pk_id_func}
                        style={[styles.employeeRow, sel && styles.employeeRowActive]}
                        onPress={() => setSelectedEmployeeId(emp.pk_id_func)}
                      >
                        <Text style={[styles.employeeText, sel && styles.employeeTextActive]}>
                          {emp.nome_func}
                        </Text>
                        {sel && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setTaskModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.saveBtn} onPress={handleCreateTask}>
                <Text style={styles.saveBtnText}>Criar Tarefa</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Estilos (visual original 100% preservado) ───────────────────────────────

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
    shadowOffset: { width: 0, height: 4 },
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
    flex: 1,
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
    shadowOffset: { width: 0, height: 4 },
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

  emptyText: {
    color: "#64748B",
    textAlign: "center",
    paddingVertical: 15,
    fontSize: 14,
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
    shadowOffset: { width: 0, height: 4 },
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
    shadowOffset: { width: 0, height: 6 },
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

  // ─── Modais ────────────────────────────────────────────────────────────────

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },

  accountModal: {
    backgroundColor: "#FEFDF9",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 36,
    borderTopWidth: 1,
    borderColor: "#ECEFD9",
  },

  accountModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  accountModalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#285A71",
  },

  accountAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#285A71",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 16,
  },

  accountInfo: {
    alignItems: "center",
    marginBottom: 24,
  },

  accountName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#285A71",
    marginBottom: 4,
  },

  accountEmail: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 20,
  },

  accountStatRow: {
    flexDirection: "row",
    gap: 20,
  },

  accountStat: {
    alignItems: "center",
    gap: 4,
  },

  accountStatValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#285A71",
  },

  accountStatLabel: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
  },

  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#285A71",
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
  },

  logoutButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  // Modal de tarefa

  taskModal: {
    backgroundColor: "#FEFDF9",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 36,
    borderTopWidth: 1,
    borderColor: "#ECEFD9",
  },

  inputLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#285A71",
    marginBottom: 8,
    marginTop: 12,
  },

  textInput: {
    backgroundColor: "#ECEFD9",
    padding: 12,
    borderRadius: 12,
    fontSize: 14,
    color: "#285A71",
    borderWidth: 0.5,
    borderColor: "#285A71",
  },

  optionRow: {
    flexDirection: "row",
    gap: 10,
  },

  optionBtn: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: "#ECEFD9",
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: "#285A71",
  },

  optionBtnUrgent: {
    backgroundColor: "#EF4444",
    borderColor: "#EF4444",
  },

  optionBtnNormal: {
    backgroundColor: "#285A71",
    borderColor: "#285A71",
  },

  optionText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#285A71",
  },

  optionTextActive: {
    color: "#FFFFFF",
  },

  employeeList: {
    maxHeight: 110,
    borderWidth: 0.5,
    borderColor: "#285A71",
    borderRadius: 12,
    backgroundColor: "#ECEFD9",
    padding: 6,
  },

  employeeRow: {
    padding: 10,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },

  employeeRowActive: {
    backgroundColor: "#285A71",
  },

  employeeText: {
    fontSize: 13,
    color: "#285A71",
    fontWeight: "600",
  },

  employeeTextActive: {
    color: "#FFFFFF",
  },

  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },

  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: "#ECEFD9",
    borderRadius: 12,
    alignItems: "center",
  },

  cancelBtnText: {
    color: "#285A71",
    fontSize: 14,
    fontWeight: "700",
  },

  saveBtn: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: "#285A71",
    borderRadius: 12,
    alignItems: "center",
  },

  saveBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});
