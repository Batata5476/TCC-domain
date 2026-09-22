import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import PerfilButton from "./PerfilButton";
import { authenticatedFetch } from "../../services/api";
import PieChartCard from "../common/PieChartCard";

type Occurrence = {
  id: number;
  ocorrencias?: string;
  atestado_func?: string;
  dth_ocorrencia?: string;
};

type PerfilMedicalModalProps = {
  visible: boolean;
  onClose: () => void;
};

export default function PerfilMedicalModal({
  visible,
  onClose,
}: PerfilMedicalModalProps) {
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Formulário de justificativa
  const [justificativa, setJustificativa] = useState("");
  const [atestadoText, setAtestadoText] = useState("");

  const atestadosCount = occurrences.filter((o) => !!o.atestado_func).length;
  const justificativasCount = occurrences.length - atestadosCount;

  const chartData = [
    { label: "Com Atestado Médicos", value: atestadosCount, color: "#16A34A" },
    { label: "Justificativas de Faltas", value: justificativasCount, color: "#3B82F6" },
  ];

  const fetchOccurrences = async () => {
    try {
      setLoading(true);
      const res = await authenticatedFetch("/occurrences");
      if (res.ok) {
        const body = await res.json();
        const list = Array.isArray(body) ? body : body.data ?? [];
        setOccurrences(list);
      }
    } catch (err) {
      console.error("Erro ao buscar ocorrências médicas:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchOccurrences();
    }
  }, [visible]);

  const handleSendJustificativa = async () => {
    if (!justificativa.trim() && !atestadoText.trim()) {
      Alert.alert(
        "Atenção",
        "Preencha o motivo/justificativa ou as informações do atestado."
      );
      return;
    }

    try {
      setSubmitting(true);
      const res = await authenticatedFetch("/occurrences", {
        method: "POST",
        body: JSON.stringify({
          ocorrencias: justificativa.trim() || "Justificativa de ausência",
          atestado_func: atestadoText.trim() || undefined,
        }),
      });

      if (!res.ok) {
        throw new Error("Erro ao registrar justificativa médica.");
      }

      Alert.alert("Sucesso", "Justificativa/Atestado registrado com sucesso!");
      setJustificativa("");
      setAtestadoText("");
      fetchOccurrences();
    } catch (err: any) {
      Alert.alert("Erro", err.message || "Não foi possível enviar.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          {/* Cabeçalho */}
          <View style={styles.modalHeader}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Ionicons name="medkit" size={20} color="#285A71" />
              <Text style={styles.modalTitle}>Histórico Médico & Ausências</Text>
            </View>

            <TouchableOpacity onPress={onClose} disabled={submitting}>
              <Ionicons name="close-outline" size={24} color="#263238" />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ maxHeight: 440 }} showsVerticalScrollIndicator={false}>
            {/* Gráfico de Estatísticas de Ausências e Atestados */}
            <PieChartCard
              title="Resumo de Ocorrências Médicas"
              subtitle="Distribuição entre atestados e justificativas salvas"
              data={chartData}
              size={130}
            />

            {/* Lista de Registros */}
            <Text style={styles.sectionLabel}>Registros Anteriores</Text>

            {loading ? (
              <ActivityIndicator color="#285A71" style={{ marginVertical: 12 }} />
            ) : occurrences.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="checkmark-circle-outline" size={28} color="#16A34A" />
                <Text style={styles.emptyText}>Nenhuma falta ou ocorrência registrada.</Text>
              </View>
            ) : (
              occurrences.map((item, idx) => (
                <View key={item.id || idx} style={styles.occurrenceCard}>
                  <Ionicons name="document-text-outline" size={20} color="#285A71" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.occurrenceTitle}>
                      {item.ocorrencias || "Ausência/Justificativa"}
                    </Text>
                    {item.atestado_func && (
                      <Text style={styles.occurrenceDetail}>
                        Atestado: {item.atestado_func}
                      </Text>
                    )}
                  </View>
                </View>
              ))
            )}

            {/* Formulário de Envio */}
            <View style={styles.formArea}>
              <Text style={styles.sectionLabel}>Anexar Justificativa ou Atestado</Text>

              <Text style={styles.inputLabel}>Motivo / Justificativa:</Text>
              <TextInput
                value={justificativa}
                onChangeText={setJustificativa}
                placeholder="Ex: Consulta médica de rotina / Falta justificada"
                placeholderTextColor="#7A7A7A"
                style={styles.textInput}
              />

              <Text style={styles.inputLabel}>Número ou Descrição do Atestado:</Text>
              <TextInput
                value={atestadoText}
                onChangeText={setAtestadoText}
                placeholder="Ex: Atestado CRM-12345 (2 dias de repouso)"
                placeholderTextColor="#7A7A7A"
                style={styles.textInput}
              />
            </View>
          </ScrollView>

          {/* Botões do Modal */}
          <View style={styles.modalButtons}>
            {submitting ? (
              <ActivityIndicator color="#285A71" />
            ) : (
              <>
                <PerfilButton text="fechar" type="cancel" onPress={onClose} />
                <PerfilButton
                  text="enviar justificativa"
                  type="confirm"
                  onPress={handleSendJustificativa}
                />
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(38, 50, 56, 0.40)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalBox: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#285A71",
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#285A71",
    marginTop: 8,
    marginBottom: 8,
  },
  emptyState: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F0FDF4",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 12,
    color: "#166534",
    fontWeight: "500",
  },
  occurrenceCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  occurrenceTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1E293B",
  },
  occurrenceDetail: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },
  formArea: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 4,
    marginTop: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: "#1E293B",
    backgroundColor: "#F8FAFC",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 16,
    gap: 8,
  },
});
