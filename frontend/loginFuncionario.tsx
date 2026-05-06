import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
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

export default function LoginFuncionario() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Olá! Seja bem vindo(a) de volta</Text>

      <Input placeholder="Nome Completo" />
      <Input placeholder="CPF" />
      <Input placeholder="Senha" secureTextEntry />

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => router.push("/cadastroFuncionario")}
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