import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import PerfilAction from "../components/perfil/PerfilAction";
import PerfilAvatar from "../components/perfil/PerfilAvatar";
import PerfilHeader from "../components/perfil/perfilHeader";
import PerfilInfo from "../components/perfil/PerfilInfo";
import PerfilMeetingModal from "../components/perfil/PerfilMeetingModal";
import PerfilMedicalModal from "../components/perfil/PerfilMedicalModal";
import PerfilPointsModal from "../components/perfil/PerfilPointsModal";
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

export default function PerfilAdm() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Estados dos Modais
  const [meetingOpen, setMeetingOpen] = useState(false);
  const [medicalOpen, setMedicalOpen] = useState(false);
  const [pointsOpen, setPointsOpen] = useState(false);
  const [subject, setSubject] = useState("");

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await authenticatedFetch("/dashboard/user");
      if (res.ok) {
        const body = await res.json();
        setUser(body.data);
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

        {/* FERRAMENTAS DO COLABORADOR */}
        <Text style={styles.sectionTitle}>ferramentas & gestão</Text>

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
});