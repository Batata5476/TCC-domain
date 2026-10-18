import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { authenticatedFetch } from "../../services/api";

type BackupItem = {
  filename: string;
  sizeBytes: number;
  sizeFormatted: string;
  createdAt: string;
  formattedDate: string;
};

type PerfilBackupModalProps = {
  visible: boolean;
  onClose: () => void;
};

export default function PerfilBackupModal({
  visible,
  onClose,
}: PerfilBackupModalProps) {
  const [backups, setBackups] = useState<BackupItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [restoringFile, setRestoringFile] = useState<string | null>(null);

  const fetchBackups = async () => {
    try {
      setLoading(true);
      const res = await authenticatedFetch("/backup/list");
      if (res.ok) {
        const json = await res.json();
        setBackups(json.data || []);
      }
    } catch (e: any) {
      console.error("Erro ao listar backups:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchBackups();
    }
  }, [visible]);

  const latestBackup = backups.length > 0 ? backups[0] : null;

  const handleCreateBackup = async () => {
    try {
      setCreating(true);
      const res = await authenticatedFetch("/backup/create", {
        method: "POST",
      });

      const json = await res.json();

      if (res.ok) {
        Alert.alert(
          "Backup Concluído",
          `Cópia de segurança gerada com sucesso!\n\nData: ${json.data.formattedDate}\nTamanho: ${json.data.sizeFormatted}`
        );
        await fetchBackups();
      } else {
        Alert.alert(
          "Falha no Backup",
          json.message || "Não foi possível gerar a cópia de segurança."
        );
      }
    } catch (e: any) {
      Alert.alert(
        "Erro de Conexão",
        e.message || "Não foi possível conectar ao servidor."
      );
    } finally {
      setCreating(false);
    }
  };

  const handleConfirmRestore = (item: BackupItem) => {
    Alert.alert(
      "Confirmar Restauração",
      `Deseja restaurar o banco de dados a partir desta cópia?\n\nData: ${item.formattedDate}\nTamanho: ${item.sizeFormatted}\n\nOs dados atuais serão substituídos pelo conteúdo deste backup.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Restaurar",
          style: "destructive",
          onPress: () => executeRestore(item.filename),
        },
      ]
    );
  };

  const executeRestore = async (filename: string) => {
    try {
      setRestoringFile(filename);
      const res = await authenticatedFetch("/backup/restore", {
        method: "POST",
        body: JSON.stringify({ filename }),
      });

      const json = await res.json();

      if (res.ok) {
        Alert.alert(
          "Restauração Concluída",
          "O banco de dados foi restaurado com sucesso."
        );
        await fetchBackups();
      } else {
        Alert.alert(
          "Falha na Restauração",
          json.message || "Erro ao restaurar o backup."
        );
      }
    } catch (e: any) {
      Alert.alert(
        "Erro",
        e.message || "Falha na comunicação com o servidor durante a restauração."
      );
    } finally {
      setRestoringFile(null);
    }
  };

  const isBusy = creating || !!restoringFile;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerTitleRow}>
              <View style={styles.iconCircle}>
                <Ionicons name="server-outline" size={20} color="#285A71" />
              </View>
              <View>
                <Text style={styles.modalTitle}>Backup da Empresa</Text>
                <Text style={styles.modalSubtitle}>
                  Cópias de segurança e restauração
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={onClose}
              disabled={isBusy}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 16 }}
          >
            {/* Card Último Backup */}
            <View style={styles.lastBackupCard}>
              <View style={styles.lastBackupHeader}>
                <View style={styles.cloudBadge}>
                  <Ionicons
                    name={latestBackup ? "cloud-done" : "cloud-outline"}
                    size={28}
                    color="#285A71"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.lastBackupLabel}>Último Backup</Text>
                  <Text style={styles.lastBackupTime}>
                    {latestBackup ? latestBackup.formattedDate : "Nenhum backup encontrado"}
                  </Text>
                  {latestBackup && (
                    <Text style={styles.lastBackupMeta}>
                      Tamanho: {latestBackup.sizeFormatted}
                    </Text>
                  )}
                </View>
              </View>

              <View
                style={[
                  styles.statusPill,
                  { backgroundColor: latestBackup ? "#ECFDF5" : "#FFFBEB" },
                ]}
              >
                <Ionicons
                  name={
                    latestBackup
                      ? "checkmark-circle"
                      : "alert-circle-outline"
                  }
                  size={15}
                  color={latestBackup ? "#059669" : "#D97706"}
                />
                <Text
                  style={[
                    styles.statusPillText,
                    { color: latestBackup ? "#059669" : "#D97706" },
                  ]}
                >
                  {latestBackup
                    ? "Cópia disponível para restauração"
                    : "Nenhum backup registrado"}
                </Text>
              </View>
            </View>

            {/* Ações Principais */}
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity
                style={[styles.primaryActionBtn, creating && styles.btnDisabled]}
                onPress={handleCreateBackup}
                disabled={isBusy}
                activeOpacity={0.8}
              >
                {creating ? (
                  <View style={styles.btnLoadingRow}>
                    <ActivityIndicator color="#FFFFFF" size="small" />
                    <Text style={styles.primaryActionText}>
                      Gerando backup...
                    </Text>
                  </View>
                ) : (
                  <View style={styles.btnRow}>
                    <Ionicons name="cloud-upload" size={18} color="#FFFFFF" />
                    <Text style={styles.primaryActionText}>Fazer Backup Agora</Text>
                  </View>
                )}
              </TouchableOpacity>

              {latestBackup && (
                <TouchableOpacity
                  style={[
                    styles.restoreLatestBtn,
                    restoringFile === latestBackup.filename && styles.btnDisabled,
                  ]}
                  onPress={() => handleConfirmRestore(latestBackup)}
                  disabled={isBusy}
                  activeOpacity={0.8}
                >
                  {restoringFile === latestBackup.filename ? (
                    <View style={styles.btnLoadingRow}>
                      <ActivityIndicator color="#DC2626" size="small" />
                      <Text style={styles.restoreLatestText}>
                        Restaurando banco...
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.btnRow}>
                      <Ionicons name="arrow-undo" size={18} color="#DC2626" />
                      <Text style={styles.restoreLatestText}>
                        Restaurar Último Backup
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}
            </View>

            {/* Histórico de backups */}
            <View style={styles.historyHeader}>
              <Text style={styles.historyTitle}>
                Histórico de Backups
              </Text>
              <TouchableOpacity onPress={fetchBackups} disabled={loading || isBusy}>
                <Ionicons name="refresh" size={17} color="#285A71" />
              </TouchableOpacity>
            </View>

            {loading ? (
              <ActivityIndicator
                size="small"
                color="#285A71"
                style={{ marginVertical: 16 }}
              />
            ) : backups.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="folder-open-outline" size={32} color="#94A3B8" />
                <Text style={styles.emptyText}>
                  Nenhum backup disponível.
                </Text>
              </View>
            ) : (
              backups.map((item, index) => {
                const isRestoringThis = restoringFile === item.filename;
                const isLatest = index === 0;

                return (
                  <View key={item.filename} style={styles.historyCard}>
                    <View style={{ flex: 1, paddingRight: 8 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                        <Ionicons
                          name="time-outline"
                          size={15}
                          color="#285A71"
                        />
                        <Text style={styles.historyCardDate}>
                          {item.formattedDate}
                        </Text>
                        {isLatest && (
                          <View style={styles.latestTag}>
                            <Text style={styles.latestTagText}>Mais Recente</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.historyCardSize}>
                        {item.sizeFormatted} • {item.filename}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.historyRestoreBtn,
                        isRestoringThis && styles.btnDisabled,
                      ]}
                      onPress={() => handleConfirmRestore(item)}
                      disabled={isBusy}
                      activeOpacity={0.7}
                    >
                      {isRestoringThis ? (
                        <ActivityIndicator size="small" color="#285A71" />
                      ) : (
                        <Text style={styles.historyRestoreBtnText}>
                          Restaurar
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </ScrollView>

          {/* Botão Fechar */}
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            disabled={isBusy}
            activeOpacity={0.7}
          >
            <Text style={styles.closeBtnText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  modalBox: {
    width: "100%",
    maxHeight: "90%",
    backgroundColor: "#FEFDF9",
    borderRadius: 22,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#E2EDF3",
    justifyContent: "center",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1E293B",
  },
  modalSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 1,
  },
  lastBackupCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 14,
    marginBottom: 14,
  },
  lastBackupHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cloudBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E0F2FE",
    justifyContent: "center",
    alignItems: "center",
  },
  lastBackupLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  lastBackupTime: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    marginTop: 2,
  },
  lastBackupMeta: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 10,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },
  actionButtonsContainer: {
    gap: 10,
    marginBottom: 20,
  },
  primaryActionBtn: {
    backgroundColor: "#285A71",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#285A71",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  restoreLatestBtn: {
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#FECACA",
    paddingVertical: 13,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  btnRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  btnLoadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  primaryActionText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  restoreLatestText: {
    color: "#DC2626",
    fontSize: 13,
    fontWeight: "700",
  },
  btnDisabled: {
    opacity: 0.65,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    marginTop: 4,
  },
  historyTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  historyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 12,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  historyCardDate: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1E293B",
  },
  latestTag: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  latestTagText: {
    color: "#15803D",
    fontSize: 10,
    fontWeight: "700",
  },
  historyCardSize: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },
  historyRestoreBtn: {
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  historyRestoreBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#285A71",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 18,
    gap: 6,
  },
  emptyText: {
    fontSize: 12,
    color: "#94A3B8",
  },
  closeBtn: {
    marginTop: 12,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
  },
  closeBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
  },
});
