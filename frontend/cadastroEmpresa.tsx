import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";


type InputProps = {
  placeholder: string;
  secureTextEntry?: boolean;
};

function Input({ placeholder, secureTextEntry }: InputProps) {
  return (
    <TextInput
      placeholder={placeholder}
      secureTextEntry={secureTextEntry}
      style={styles.input}
    />
  );
}
export default function CadastroEmpresa() {
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Olá! Seja bem vindo(a)!</Text>

      <Input placeholder="Nome da empresa" />
      <Input placeholder="CNPJ" />
      <Input placeholder="E-mail empresarial" />
      <Input placeholder="Tipo de empresa" />
      <Input placeholder="Código da empresa" />
      <Input placeholder="Confirmar código da empresa" />

      <TouchableOpacity style={styles.button}>
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