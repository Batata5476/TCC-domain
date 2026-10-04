import React, { useEffect, useState } from "react";
import * as Location from "expo-location";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { authenticatedFetch } from "../services/api";

type WorkRecord = {
  pk_id_ponto: number;
  data_ponto: string;
  entrada: string;
  saida: string;
  total_dia: string;
};

function getLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getCurrentTime(date: Date) {
  return [date.getHours(), date.getMinutes(), date.getSeconds()]
    .map((part) => String(part).padStart(2, "0"))
    .join(":");
}

function timeToSeconds(time: string) {
  const [hours, minutes, seconds = 0] = time.split(":").map(Number);
  return hours * 3600 + minutes * 60 + seconds;
}

export default function PontoE() {
  const [horaAtual, setHoraAtual] = useState(new Date());
  const [registro, setRegistro] = useState<WorkRecord | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const intervaloHora = setInterval(() => {
      setHoraAtual(new Date());
    }, 1000);

    return () => clearInterval(intervaloHora);
  }, []);

  useEffect(() => {
    let ativo = true;

    async function carregarRegistroDoDia() {
      try {
        const response = await authenticatedFetch("/work");
        const body = await response.json();
        if (!response.ok) {
          throw new Error(body.message || "Não foi possível consultar o registro de ponto.");
        }

        const hoje = getLocalDate(new Date());
        const registroHoje = (body.data as WorkRecord[]).find(
          (item) => item.data_ponto.slice(0, 10) === hoje,
        );
        if (ativo) setRegistro(registroHoje ?? null);
      } catch (error) {
        if (ativo) {
          setErro(error instanceof Error ? error.message : "Erro ao carregar o registro de ponto.");
        }
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregarRegistroDoDia();
    return () => {
      ativo = false;
    };
  }, []);

  const formatarTempo = (totalSegundos: number) => {
    const horas = Math.floor(totalSegundos / 3600);
    const minutos = Math.floor((totalSegundos % 3600) / 60);
    const segundos = totalSegundos % 60;

    return [
      String(horas).padStart(2, "0"),
      String(minutos).padStart(2, "0"),
      String(segundos).padStart(2, "0"),
    ].join(":");
  };

  const registrarPonto = async () => {
    setEnviando(true);
    setErro("");

    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") {
        throw new Error("Permita o acesso à localização para registrar o ponto.");
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const localizacao = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      const agora = new Date();

      if (!registro) {
        const response = await authenticatedFetch("/work", {
          method: "POST",
          body: JSON.stringify({
            entrada: getCurrentTime(agora),
            saida: getCurrentTime(agora),
            data_ponto: getLocalDate(agora),
            ...localizacao,
          }),
        });
        const body = await response.json();
        if (!response.ok) {
          throw new Error(body.message || "Não foi possível registrar a entrada.");
        }
        setRegistro(body.data);
      } else {
        const response = await authenticatedFetch(`/work/${registro.pk_id_ponto}`, {
          method: "PATCH",
          body: JSON.stringify({ saida: getCurrentTime(agora), ...localizacao }),
        });
        const body = await response.json();
        if (!response.ok) {
          throw new Error(body.message || "Não foi possível registrar a saída.");
        }
        setRegistro(body.data);
      }
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível registrar o ponto.");
    } finally {
      setEnviando(false);
    }
  };

  const pontoEmAndamento = registro !== null && registro.entrada === registro.saida;
  const pontoConcluido = registro !== null && !pontoEmAndamento;
  const tempoDecorrido = pontoEmAndamento
    ? Math.max(0, timeToSeconds(getCurrentTime(horaAtual)) - timeToSeconds(registro.entrada))
    : registro
      ? timeToSeconds(registro.total_dia)
      : 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ponto-E</Text>

      <Text style={styles.hora}>
        {horaAtual.toLocaleTimeString("pt-BR", { hour12: false })}
      </Text>

      <Text style={styles.label}>Horas trabalhadas</Text>
      <Text style={styles.contador}>{formatarTempo(tempoDecorrido)}</Text>

      {registro && (
        <Text style={styles.status}>
          {pontoEmAndamento
            ? `Entrada registrada às ${registro.entrada}`
            : `Jornada concluída às ${registro.saida}`}
        </Text>
      )}

      {erro ? <Text style={styles.error}>{erro}</Text> : null}

      <TouchableOpacity
        style={[styles.button, (carregando || enviando || pontoConcluido) && styles.buttonDisabled]}
        onPress={registrarPonto}
        disabled={carregando || enviando || pontoConcluido}
      >
        {carregando || enviando ? <ActivityIndicator color="#FFFFFF" /> : (
          <Text style={styles.buttonText}>
            {pontoConcluido ? "Ponto concluído" : pontoEmAndamento ? "Registrar saída" : "Registrar entrada"}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#F8FAFC",
  },
  title: {
    color: "#285A71",
    fontSize: 28,
    fontWeight: "700",
  },
  label: {
    marginTop: 36,
    fontSize: 14,
    color: "#52616B",
  },
  hora: {
    marginTop: 20,
    fontSize: 28,
    color: "#1F2937",
    fontWeight: "700",
  },
  contador: {
    marginTop: 12,
    fontSize: 42,
    color: "#285A71",
    fontWeight: "800",
  },
  status: {
    marginTop: 16,
    color: "#52616B",
    fontSize: 14,
  },
  error: {
    marginTop: 20,
    color: "#B42318",
    fontSize: 14,
    textAlign: "center",
  },
  button: {
    marginTop: 28,
    paddingHorizontal: 26,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#285A71",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});