import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";


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
export default function CadastroEmpresa() {
  const router = useRouter();
  
  const [nome, setNome] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [email, setEmail] = useState("");
  const [tipo, setTipo] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const handleRegister = async () => {
    if (!nome || !cnpj || !email || !tipo || !senha) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }

    if (senha !== confirmarSenha) {
      Alert.alert("Erro", "As senhas não coincidem.");
      return;
    }

    try {
      const response = await fetch("http://192.168.0.103:3000/company", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome_empresa: nome,
          cnpj_empresa: cnpj,
          email_empresa: email,
          tipo_empresa: tipo,
          senha_empresa: senha,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Sucesso", "Empresa cadastrada com sucesso!");
        router.push("/loginEmpresa");
      } else {
        Alert.alert("Erro", data.message || "Falha ao cadastrar empresa.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível conectar ao servidor.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Olá! Seja bem vindo(a)!</Text>

      <Input placeholder="Nome da empresa" value={nome} onChangeText={setNome} />
      <Input placeholder="CNPJ" value={cnpj} onChangeText={setCnpj} />
      <Input placeholder="E-mail empresarial" value={email} onChangeText={setEmail} />
      <Input placeholder="Tipo de empresa" value={tipo} onChangeText={setTipo} />
      <Input placeholder="Código da empresa (Senha)" secureTextEntry value={senha} onChangeText={setSenha} />
      <Input placeholder="Confirmar código" secureTextEntry value={confirmarSenha} onChangeText={setConfirmarSenha} />

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Cadastrar</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => router.push("/loginEmpresa")}
      >
        <Text style={styles.secondaryButtonText}>Voltar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: "center", padding: 24 },
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
  buttonText: { 
    color: "#ECEFDA", 
    textAlign: "center",
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
  },
});