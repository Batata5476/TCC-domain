import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { generateCompanyToken } from "../services/auth";



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
        const generatedToken = await generateCompanyToken(cnpj, senha);
        Alert.alert("Sucesso", "Token gerado com sucesso.");
        router.push({
          pathname: "/inserirTokenEmpresa",
          params: { token: generatedToken },
        });
      } catch (error: any) {
        Alert.alert("Erro", error.message || "Nao foi possivel gerar o token.");
      }
    };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Olá! Seja bem vindo(a) de volta</Text>
     
    <View style={styles.card}>
      <Text style={styles.label}>CNPJ</Text>
      <Input placeholder="Value" value={cnpj} onChangeText={setCnpj} />

      <Text style={styles.label}>Senha</Text>
      <Input
        placeholder="Value"
        secureTextEntry
        value={senha}
        onChangeText={setSenha}
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Enviar token</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => router.push("/cadastroEmpresa")}
      >
        <Text style={styles.secondaryButtonText}>Primeiro acesso</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24 },
  title: { textAlign: "center", marginBottom: 20 },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  label: {
    marginBottom: 6,
    color: "#333",
  },
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
