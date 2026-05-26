import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { API_URL } from "../services/config";

type InputProps = {
  placeholder: string;
  secureTextEntry?: boolean;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
};

function Input({ placeholder, secureTextEntry, value, onChangeText, keyboardType }: InputProps) {
  return (
    <TextInput
      placeholder={placeholder}
      secureTextEntry={secureTextEntry}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      style={styles.input}
    />
  );
}

export default function CadastroFuncionario() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [setor, setSetor] = useState("");
  const [cargo, setCargo] = useState("");
  const [codEmpresa, setCodEmpresa] = useState("");
  const [senha, setSenha] = useState("");

  const handleRegister = async () => {
    if (!nome || !cpf || !email || !setor || !cargo || !codEmpresa) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome_func: nome,
          cpf_func: cpf,
          email_func: email,
          senha_func: senha,
          fk_id_setor: Number(setor),
          fk_id_cargo: Number(cargo),
          fk_cod_empresa: Number(codEmpresa),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Sucesso", "Funcionário cadastrado com sucesso!");
        router.push("/loginFuncionario");
      } else {
        Alert.alert("Erro", data.message || "Falha ao cadastrar funcionário.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível conectar ao servidor.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Cadastro Funcionário</Text>

      <Input placeholder="Nome Completo" value={nome} onChangeText={setNome} />
      <Input placeholder="CPF" value={cpf} onChangeText={setCpf} keyboardType="numeric" />
      <Input placeholder="E-mail" value={email} onChangeText={setEmail} keyboardType="email-address" />
      <Input placeholder="ID do Setor (Número)" value={setor} onChangeText={setSetor} keyboardType="numeric" />
      <Input placeholder="ID do Cargo (Número)" value={cargo} onChangeText={setCargo} keyboardType="numeric" />
      <Input placeholder="Código da Empresa" value={codEmpresa} onChangeText={setCodEmpresa} keyboardType="numeric" />
      <Input placeholder="Senha" value={senha} onChangeText={setSenha} secureTextEntry={true} />

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Cadastrar</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.secondaryButton}
        onPress={() => router.push("/loginFuncionario")}
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
    textAlign: "center" 
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