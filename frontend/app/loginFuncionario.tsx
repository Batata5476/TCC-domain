import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { generateEmployeeToken, saveToken } from "../services/auth";

export default function LoginFuncionario() {
  const router = useRouter();
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [token, setToken] = useState("");

  const handleGenerateToken = async () => {
    if (!cpf || !senha) {
      Alert.alert("Erro", "Informe CPF e senha para gerar o token.");
      return;
    }

    try {
      const generatedToken = await generateEmployeeToken(cpf, senha);
      setToken(generatedToken);
      Alert.alert("Sucesso", "Token gerado com sucesso.");
    } catch (error: any) {
      Alert.alert("Erro", error.message || "Nao foi possivel gerar o token.");
    }
  };

  const handleLoginWithToken = async () => {
    const cleanToken = token.trim();

    if (!cleanToken) {
      Alert.alert("Erro", "Informe ou gere um token.");
      return;
    }

    try {
      await saveToken(cleanToken);
      Alert.alert("Sucesso", "Login realizado com sucesso!");
      router.push("/dashboard");
    } catch (error: any) {
      Alert.alert("Erro", error.message || "Nao foi possivel entrar.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Entrar como funcionario</Text>

      <Text style={styles.sectionTitle}>1. Gerar token</Text>

      <TextInput
        placeholder="CPF"
        value={cpf}
        onChangeText={setCpf}
        keyboardType="numeric"
        style={styles.input}
      />

      <TextInput
        placeholder="Senha"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={handleGenerateToken}>
        <Text style={styles.buttonText}>Gerar Token</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>2. Entrar com token</Text>

      <TextInput
        placeholder="Token JWT gerado"
        value={token}
        onChangeText={setToken}
        autoCapitalize="none"
        autoCorrect={false}
        multiline
        style={styles.tokenInput}
      />

      <TouchableOpacity style={styles.button} onPress={handleLoginWithToken}>
        <Text style={styles.buttonText}>Entrar com Token</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton} onPress={() => router.back()}>
        <Text style={styles.secondaryButtonText}>Voltar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#FEFDF9",
  },
  title: {
    color: "#285A71",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    color: "#285A71",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 14,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FEFDF9",
    borderColor: "#285A71",
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  tokenInput: {
    backgroundColor: "#FEFDF9",
    borderColor: "#285A71",
    borderWidth: 1,
    minHeight: 120,
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: "#285A71",
    padding: 14,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: {
    color: "#ECEFDA",
    textAlign: "center",
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "#ECEFDA",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  secondaryButtonText: {
    textAlign: "center",
    color: "#285A71",
    fontWeight: "600",
  },
});
