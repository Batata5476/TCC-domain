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
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { authenticatedFetch } from "../services/api";
import { getToken, logout } from "../services/auth";
import * as ImagePicker from 'expo-image-picker';
import { API_URL } from '../services/config';

const cooperaLogo = require("../assets/coopera_logo.png");

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

  // Estados de UI
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

  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Gera os próximos 7 dias dinamicamente no fuso local (sem conversão UTC que altera o dia)
  useEffect(() => {
    const list: { label: string; dateString: string }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const dateString = `${year}-${month}-${day}`;
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

      // Usa o tipo de sessão salvo no login para decidir o fluxo correto
      const { getUserType } = await import("../services/auth");
      const sessionType = await getUserType();

      if (sessionType === "company") {
        // ── Administrador/Empresa ──────────────────────────────────────
        setUserType("company");

        const companyRes = await authenticatedFetch("/dashboard/company");
        if (companyRes.status === 401) { router.replace("/"); return; }
        if (companyRes.ok) {
          const body = await companyRes.json();
          setCompanyData(body);
        }

        // Também carrega as informações do usuário logado (o administrador)
        const userRes = await authenticatedFetch("/dashboard/user");
        if (userRes.ok) {
          const body = await userRes.json();
          setUserData(body.data);
          setUserPhoto(body.data?.foto || null);
        }
     
        const empRes = await authenticatedFetch("/users");
        if (empRes.ok) {
          const empBody = await empRes.json();
          setEmployees(empBody.data ?? []);
        }
        
        const companyTasksRes = await authenticatedFetch("/tasks/company-tasks");
        if (companyTasksRes.ok) {
          const companyTasksBody = await companyTasksRes.json();
          setTasks(companyTasksBody.data ?? []);
        } else {
          const myTasksRes = await authenticatedFetch("/tasks/my-tasks");
          if (myTasksRes.ok) {
            const myTasksBody = await myTasksRes.json();
            setTasks(myTasksBody.data ?? []);
          }
        }
      } else {
        // ── Funcionário ───────────────────────────────────────────────
        setUserType("user");

        const userRes = await authenticatedFetch("/dashboard/user");
        if (userRes.status === 401) { router.replace("/"); return; }
        if (userRes.ok) {
          const body = await userRes.json();
          setUserData(body.data);
          setUserPhoto(body.data?.foto || null);
        } else {
          // fallback: se o usuário não for reconhecido, redireciona para login
          router.replace("/");
          return;
        }

        const tasksRes = await authenticatedFetch("/tasks/my-tasks");
        if (tasksRes.ok) {
          const tasksBody = await tasksRes.json();
          setTasks(tasksBody.data ?? []);
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

  // ── Ações de Tarefa ────────────────────────────────────────────────────────

  const handleUpdateTaskStatus = async (taskId: number, newStatus: number) => {
    try {
      const response = await authenticatedFetch(`/tasks/${taskId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const label = newStatus === 1 ? "Concluída!" : newStatus === 2 ? "Em Andamento!" : "Pendente!";
        Alert.alert("Sucesso 🎉", `Status da tarefa alterado para ${label}`);
        fetchDashboard();
      } else {
        Alert.alert("Erro", "Não foi possível atualizar o status da tarefa.");
      }
    } catch (e) {
      console.error(e);
      Alert.alert("Erro", "Erro ao conectar com o servidor.");
    }
  };

  const handleLogout = async () => {
    setAccountModalVisible(false);
    await logout();
    router.replace("/");
  };

  const handlePickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permissão negada", "Precisamos de acesso à sua galeria para trocar a foto.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    const base64 = asset.base64;
    if (!base64) return;

    const mimeType = asset.mimeType || 'image/jpeg';
    const photoDataUri = `data:${mimeType};base64,${base64}`;

    // Mostra a foto imediatamente
    setUserPhoto(photoDataUri);

    // Envia pro backend
    setUploadingPhoto(true);
    try {
      const token = await getToken();
      const response = await fetch(`${API_URL}/users/${userData?.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ foto: photoDataUri, foto_func: photoDataUri }),
      });

      if (response.ok) {
        Alert.alert("Sucesso", "Foto atualizada com sucesso!");
      } else {
        const err = await response.json();
        Alert.alert("Erro", err.message || "Erro ao salvar foto.");
      }
    } catch (e) {
      console.error(e);
      Alert.alert("Erro", "Não foi possível enviar a foto.");
    } finally {
      setUploadingPhoto(false);
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

    const year = dueDate.getFullYear();
    const month = String(dueDate.getMonth() + 1).padStart(2, "0");
    const day = String(dueDate.getDate()).padStart(2, "0");
    const dateStringLocal = `${year}-${month}-${day}`;

    try {
      const body: any = {
        tipo_tarefa: taskTitle.trim(),
        validade_tarefa: dateStringLocal,
        prioridade_tarefa: Number(taskPriority),
      };
      if (userType === "company" && selectedEmployeeId) {
        body.fk_id_func = Number(selectedEmployeeId);
      } else if (userData?.id) {
        body.fk_id_func = Number(userData.id);
      }

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

  // ── Filtragem de tarefas por data e prioridade ─────────────────────────────

  const activeTasks = tasks.filter((t) => {
    if (t.status === 1) return false; // descarta concluídas das ativas
    if (!t.dueDate) return true;
    const taskDateOnly = typeof t.dueDate === 'string' && t.dueDate.includes('T')
      ? t.dueDate.split('T')[0]
      : String(t.dueDate);
    return taskDateOnly === selectedDateStr || !selectedDateStr;
  });

  const urgentTasks = activeTasks.filter((t) => t.priority === 1);
  const otherTasks = activeTasks.filter((t) => t.priority === 2);

  // ── Renderização de item de tarefa ─────────────────────────────────────────

  const renderTask = (task: TaskItem) => {
    const isCompany = userType === "company";
    return (
      <View key={task.id} style={styles.taskItem}>
        {/* Indicador de status */}
        <View style={[
          styles.statusDot,
          task.status === 2 && { backgroundColor: "#D97706" },
          task.status === 3 && { backgroundColor: "#94A3B8" },
        ]} />

        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{task.name.charAt(0).toUpperCase()}</Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.taskName}>{task.name}</Text>
          <Text style={{ fontSize: 10, color: task.status === 2 ? "#D97706" : "#94A3B8", marginTop: 1 }}>
            {task.status === 3 ? "Pendente" : task.status === 2 ? "Em andamento" : "Concluída"}
          </Text>
        </View>

        <Text style={styles.taskPoints}>{task.points}+</Text>

        {/* Botões de Alteração de Status */}
        <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
          {/* Em Andamento (Status 2) — exibe se pendente (3) */}
          {task.status === 3 && (
            <TouchableOpacity
              style={[styles.checkButton, { backgroundColor: "#D97706" }]}
              activeOpacity={0.8}
              onPress={() => handleUpdateTaskStatus(task.id, 2)}
            >
              <Ionicons name="time-outline" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          )}

          {/* Concluída (Status 1) — disponível para funcionário em qualquer status,
              para empresa sempre disponível */}
          {(task.status === 3 || task.status === 2) && (
            <TouchableOpacity
              style={styles.checkButton}
              activeOpacity={0.8}
              onPress={() => handleUpdateTaskStatus(task.id, 1)}
            >
              <Ionicons name="checkmark" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          )}

          {/* Empresa pode resetar para Pendente se estava Em Andamento */}
          {isCompany && task.status === 2 && (
            <TouchableOpacity
              style={[styles.checkButton, { backgroundColor: "#94A3B8" }]}
              activeOpacity={0.8}
              onPress={() => handleUpdateTaskStatus(task.id, 3)}
            >
              <Ionicons name="refresh-outline" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container}>
      {/* UI: topo com logo e ícone de conta */}
      <View style={styles.header}>
        <View style={styles.logoBox}>
          <Image source={cooperaLogo} style={styles.logo} resizeMode="contain" />
        </View>

        <TouchableOpacity
          style={styles.headerAccountButton}
          activeOpacity={0.8}
          onPress={() => setAccountModalVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="Informações da conta"
        >
          {userPhoto || userData?.foto ? (
            <Image
              source={{ uri: (userPhoto || userData?.foto) ?? undefined }}
              style={{ width: 32, height: 32, borderRadius: 16 }}
            />
          ) : (
            <Ionicons name="person" size={26} color="#94A3B8" />
          )}
        </TouchableOpacity>
      </View>

      {/* UI: seletor horizontal de datas dinâmico */}
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

      {/* UI: cards de tarefas */}
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

      {/* UI: menu acima do botão + */}
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

      {/* ── Modal: Informações da Conta ───────────────────────────────────────── */}
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

            {/* Avatar com foto */}
            <TouchableOpacity style={styles.accountAvatar} onPress={handlePickPhoto} disabled={uploadingPhoto}>
              {userPhoto || userData?.foto ? (
                <Image
                  source={{ uri: (userPhoto || userData?.foto) ?? undefined }}
                  style={{ width: 72, height: 72, borderRadius: 36 }}
                />
              ) : (
                <Ionicons name="person" size={40} color="#FFFFFF" />
              )}
            </TouchableOpacity>
            {uploadingPhoto && (
              <Text style={{ textAlign: "center", color: "#285A71", fontSize: 12, marginBottom: 8 }}>
                Enviando foto...
              </Text>
            )}

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

                {/* Botão Trocar Foto */}
                <TouchableOpacity
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    backgroundColor: "#ECEFD9",
                    paddingVertical: 12,
                    paddingHorizontal: 24,
                    borderRadius: 14,
                    marginTop: 16,
                    borderWidth: 0.5,
                    borderColor: "#285A71",
                  }}
                  onPress={handlePickPhoto}
                  disabled={uploadingPhoto}
                >
                  <Ionicons name="camera-outline" size={18} color="#285A71" />
                  <Text style={{ color: "#285A71", fontSize: 14, fontWeight: "700" }}>
                    Trocar Foto
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {userType === "company" && companyData && (
              <View style={styles.accountInfo}>
                <Text style={styles.accountName}>{userData?.nome || "Painel Corporativo"}</Text>
                <Text style={styles.accountEmail}>{userData?.email || "Administrador"}</Text>

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

                {/* Botão Trocar Foto para Admin */}
                <TouchableOpacity
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    backgroundColor: "#ECEFD9",
                    paddingVertical: 12,
                    paddingHorizontal: 24,
                    borderRadius: 14,
                    marginTop: 16,
                    borderWidth: 0.5,
                    borderColor: "#285A71",
                  }}
                  onPress={handlePickPhoto}
                  disabled={uploadingPhoto}
                >
                  <Ionicons name="camera-outline" size={18} color="#285A71" />
                  <Text style={{ color: "#285A71", fontSize: 14, fontWeight: "700" }}>
                    Trocar Foto
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Botão de navegação para o perfil — exibido conforme o tipo de sessão */}
            <View style={{ gap: 8, marginTop: 16, marginBottom: 8, width: "100%" }}>
              {/* Colaborador: ver apenas perfil de colaborador */}
              {userType === "user" && (
                <TouchableOpacity
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    backgroundColor: "#285A71",
                    paddingVertical: 12,
                    paddingHorizontal: 18,
                    borderRadius: 12,
                  }}
                  onPress={() => {
                    setAccountModalVisible(false);
                    router.push("/perfilFunc");
                  }}
                >
                  <Ionicons name="person-outline" size={18} color="#FFFFFF" />
                  <Text style={{ color: "#FFFFFF", fontSize: 13, fontWeight: "700" }}>
                    Perfil do Colaborador
                  </Text>
                </TouchableOpacity>
              )}

              {/* Administrador: ver perfil administrativo apenas */}
              {userType === "company" && (
                <TouchableOpacity
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    backgroundColor: "#285A71",
                    paddingVertical: 12,
                    paddingHorizontal: 18,
                    borderRadius: 12,
                  }}
                  onPress={() => {
                    setAccountModalVisible(false);
                    router.push("/perfilAdm");
                  }}
                >
                  <Ionicons name="shield-checkmark-outline" size={18} color="#FFFFFF" />
                  <Text style={{ color: "#FFFFFF", fontSize: 13, fontWeight: "700" }}>
                    Perfil Administrativo
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Botão de logout */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
              <Text style={styles.logoutButtonText}>Sair da Conta</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Modal: Criar Tarefa ───────────────────────────────────────────────── */}
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
                    const sel = selectedEmployeeId === emp.id;
                    return (
                      <TouchableOpacity
                        key={emp.id}
                        style={[styles.employeeRow, sel && styles.employeeRowActive]}
                        onPress={() => setSelectedEmployeeId(emp.id)}
                      >
                        <Text style={[styles.employeeText, sel && styles.employeeTextActive]}>
                          {emp.nome}
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

// ─── Estilos ─────────────────────────────────────────────────────────────────

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
    tintColor: "#66B300",
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

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#16A34A",
    marginRight: 4,
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

  // Modais

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
