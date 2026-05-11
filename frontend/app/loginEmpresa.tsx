import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { loginCompany } from "../services/auth";

type InputProps = {
  placeholder: string;
  secureTextEntry?: boolean;
  value: string;
  onChangeText: (text: string) => void;
};

function Input({ placeholder, secureTextEntry, value, onChangeText }: InputProps) {
  return (
    <TextInput
      placeholder={placeholder}
      secureTextEntry={secureTextEntry}
      value={value}
      onChangeText={onChangeText}
      style={styles.input}
    />
  );
}

export default function LoginEmpresa() {
  const router = useRouter();
  const [cnpj, setCnpj] = useState("");
  const [senha, setSenha] = useState("");

  const handleLogin = async () => {
    if (!cnpj || !senha) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }

    try {
      const response = await loginCompany(cnpj, senha);
      Alert.alert("Sucesso", "Login realizado com sucesso!");
      router.push("/dashboard");
    } catch (error: any) {
      Alert.alert("Erro", error.message || "Falha ao realizar login.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Olá! Seja bem vindo(a) de volta</Text>

      <Input placeholder="CNPJ" value={cnpj} onChangeText={setCnpj} />
      <Input placeholder="Senha (Código)" secureTextEntry value={senha} onChangeText={setSenha} />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => router.push("/cadastroEmpresa")}
      >
        <Text style={styles.secondaryButtonText}>Não tenho conta</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24 },
  title: { textAlign: "center", marginBottom: 20 },
  input: {
    backgroundColor: "#FEFDF9",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#285A71",
    padding: 14,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: { color: "#ECEFDA", textAlign: "center" },
  secondaryButton: {
    backgroundColor: "#ECEFDA",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  secondaryButtonText: {
    textAlign: "center",
    color: "#285A71",
  },
});