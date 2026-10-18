import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, StyleSheet, Text, View, } from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import PerfilAction from "../components/perfil/PerfilAction";
import PerfilAvatar from "../components/perfil/PerfilAvatar";
import PerfilHeader from "../components/perfil/perfilHeader";
import PerfilInfo from "../components/perfil/PerfilInfo";
import PerfilMeetingModal from "../components/perfil/PerfilMeetingModal";
import PerfilMedicalModal from "../components/perfil/PerfilMedicalModal";
import PerfilPointsModal from "../components/perfil/PerfilPointsModal";
import PerfilBackupModal from "../components/perfil/PerfilBackupModal";
import PieChartCard from "../components/common/PieChartCard";
import EmotionsPieChartCard from "../components/common/EmotionsPieChartCard";
import { authenticatedFetch } from "../services/api";

type UserProfile = {
  id: number;
  nome: string;
  email: string;
  cpf?: string;
  telefone?: string;
  foto?: string | null;
  pontos?: number;
};
// Tipo parar armazenar latitude e longitude da empresa de tipo número ou string
type CompanyLocation = {
  id: number;
  latitude: number | string | null;
  longitude: number | string | null;
};

export default function PerfilAdm() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [companyLocation, setCompanyLocation] = useState<CompanyLocation | null>(null);
  const [savingCompanyLocation, setSavingCompanyLocation] = useState(false);


  const [tasks, setTasks] = useState<any[]>([]);

  // Estados dos Modais
  const [meetingOpen, setMeetingOpen] = useState(false);
  const [medicalOpen, setMedicalOpen] = useState(false);
  const [pointsOpen, setPointsOpen] = useState(false);
  const [backupOpen, setBackupOpen] = useState(false);
  const [subject, setSubject] = useState("");

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await authenticatedFetch("/dashboard/user");
      if (res.ok) {
        const body = await res.json();
        setUser(body.data);
      }

      const tasksRes = await authenticatedFetch("/tasks/my-tasks");
      if (tasksRes.ok) {
        const tasksBody = await tasksRes.json();
        setTasks(tasksBody.data ?? []);
      }


      // Carrega a localização da empresa do usuário logado
      const companyRes = await authenticatedFetch("/company");
      if (companyRes.ok) {
        const companyBody = await companyRes.json();
        setCompanyLocation(companyBody.data?.[0] ?? null);
      }
    } catch (err) {
      console.error("Erro ao carregar perfil adm:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // Estatísticas calculadas dinamicamente com base nas tarefas reais do banco
  const concluidasCount = tasks.filter((t) => t.status === 1).length;
  const emAndamentoCount = tasks.filter((t) => t.status === 2).length;
  const pendentesCount = tasks.filter((t) => t.status === 3).length;

  const taskChartData = [
    { label: "Concluídas", value: concluidasCount, color: "#10B981" },
    { label: "Em Andamento", value: emAndamentoCount, color: "#3B82F6" },
    { label: "Pendentes", value: pendentesCount, color: "#EF4444" },
  ];

  // Upload e Salvar Foto de Perfil
  const handlePickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permissão negada", "Precisamos de acesso à galeria para alterar sua foto.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (result.canceled || !result.assets?.[0]?.base64 || !user?.id) return;

    const asset = result.assets[0];
    const mimeType = asset.mimeType || "image/jpeg";
    const photoDataUri = `data:${mimeType};base64,${asset.base64}`;

    setUser((prev) => (prev ? { ...prev, foto: photoDataUri } : null));
    setUploadingPhoto(true);

    try {
      const res = await authenticatedFetch(`/users/${user.id}`, {
        method: "PATCH",
        body: JSON.stringify({ foto: photoDataUri, foto_func: photoDataUri }),
      });

      if (!res.ok) {
        throw new Error("Erro ao salvar foto no banco.");
      }
      Alert.alert("Sucesso", "Foto de perfil atualizada com sucesso!");
    } catch (err: any) {
      Alert.alert("Atenção", err.message || "Não foi possível salvar a foto.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Função para salvar a localização da empresa com latitudo e longitude atuais do GPS do dispositivo
  const handleSaveCompanyLocation = async () => {
    if (savingCompanyLocation) return;

    if (!companyLocation?.id) {
      Alert.alert("Empresa não encontrada", "Recarregue o perfil e tente novamente.");
      return;
    }

    setSavingCompanyLocation(true);
    // Solicita a permissão de localização e obtém a posição atual do dispositivo
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        throw new Error("Permita o acesso à localização para continuar.");
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      // Envia a latitude e longitutde atuais para o Backend para atualizar a localização da empresa no banco de dados
      const response = await authenticatedFetch(`/company/${companyLocation.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }),
      });
      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(body.message || "Não foi possível salvar a localização.");
      }

      // Atualiza o estado local com a Localização
      setCompanyLocation(body.data);
      Alert.alert("Localização salva", "A localização da empresa foi atualizada.");
    } catch (error) {
      Alert.alert(
        "Erro",
        error instanceof Error ? error.message : "Não foi possível obter o GPS.",
      );
    } finally {
      setSavingCompanyLocation(false);
    }
  };
  // Verifica se está definida a loc da empresa
  const companyLocationIsSet = companyLocation?.latitude !== null
    && companyLocation?.latitude !== undefined
    && companyLocation?.longitude !== null
    && companyLocation?.longitude !== undefined;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <PerfilHeader />

        {/* TÍTULO */}
        <Text style={styles.title}>Perfil Administrativo</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#285A71" style={{ marginVertical: 30 }} />
        ) : (
          <>
            <PerfilAvatar
              fotoUrl={user?.foto}
              onPickPhoto={handlePickPhoto}
              uploading={uploadingPhoto}
            />

            <View style={styles.nameHeaderCard}>
              <Text style={styles.userName}>{user?.nome || "Administrador Master"}</Text>
              <Text style={styles.userRole}>Gestor Corporativo</Text>
            </View>

            <PerfilInfo
              email={user?.email}
              cpf={user?.cpf}
              telefone={user?.telefone}
            />
          </>
        )}

        {/* GRÁFICO DE ESTATÍSTICAS DO ADM */}
        <PieChartCard
          title="Status das Atividades Gerais"
          subtitle="Acompanhamento em tempo real das tarefas da equipe"
          data={taskChartData}
          size={140}
        />

        {/* GRÁFICO DE EMOÇÕES DA EQUIPE (totais agregados) */}
        <EmotionsPieChartCard />

        {/* FERRAMENTAS DO COLABORADOR */}
        <Text style={styles.sectionTitle}>ferramentas & gestão</Text>

        {/* Botão para definir a localização da empresa */}
        <PerfilAction
          icon="location-outline"
          text={savingCompanyLocation ? "salvando localização..." : "definir localização da empresa"}
          onPress={handleSaveCompanyLocation}
          showAdd={false}
        />
        <Text style={styles.locationHint}>
          {companyLocationIsSet
            ? `Local salvo: ${Number(companyLocation?.latitude).toFixed(5)}, ${Number(companyLocation?.longitude).toFixed(5)}`
            : "Defina o local presencialmente na empresa. O ponto aceita até 50 metros de distância."}
        </Text>

        <PerfilAction
          icon="calendar-outline"
          text="solicitar reunião"
          onPress={() => setMeetingOpen(true)}
          showAdd={false}
        />

        <PerfilAction
          icon="wallet-outline"
          text="salário e banco de horas"
          onPress={() => router.push("/DadosTrabalhistas")}
          showAdd={false}
        />

        <PerfilAction
          icon="trophy-outline"
          text="sistema de pontuações"
          onPress={() => setPointsOpen(true)}
          showAdd={false}
        />

        <PerfilAction
          icon="medkit-outline"
          text="histórico médico e ausências"
          onPress={() => setMedicalOpen(true)}
          showAdd={false}
        />

        <PerfilAction
          icon="people-outline"
          text="gestão de funcionários"
          onPress={() => router.push("/dashboard")}
          showAdd={false}
        />

        <PerfilAction
          icon="happy-outline"
          text="registro de humor & bem-estar"
          onPress={() => router.push("/bemEstar")}
          showAdd={false}
        />

        <PerfilAction
          icon="cloud-upload-outline"
          text="backup e restauração da empresa"
          onPress={() => setBackupOpen(true)}
          showAdd={false}
        />
      </ScrollView>

      {/* Modais */}
      <PerfilMeetingModal
        visible={meetingOpen}
        onClose={() => setMeetingOpen(false)}
        subject={subject}
        setSubject={setSubject}
      />

      <PerfilMedicalModal
        visible={medicalOpen}
        onClose={() => setMedicalOpen(false)}
      />

      <PerfilPointsModal
        visible={pointsOpen}
        onClose={() => setPointsOpen(false)}
        pontos={user?.pontos ?? 0}
      />

      <PerfilBackupModal
        visible={backupOpen}
        onClose={() => setBackupOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  title: {
    marginHorizontal: 20,
    marginTop: 6,
    marginBottom: 12,
    fontSize: 20,
    fontWeight: "700",
    color: "#285A71",
  },
  nameHeaderCard: {
    marginHorizontal: 20,
    marginTop: 4,
    alignItems: "center",
  },
  userName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
  },
  userRole: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
    fontWeight: "500",
  },
  sectionTitle: {
    marginHorizontal: 20,
    marginTop: 22,
    marginBottom: 10,
    fontSize: 13,
    color: "#285A71",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  locationHint: {
    marginHorizontal: 24,
    marginTop: -4,
    marginBottom: 14,
    fontSize: 12,
    color: "#64748B",
  },
});