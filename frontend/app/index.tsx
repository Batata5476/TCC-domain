import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Como você quer entrar?</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/loginEmpresa")}
      >
        <Text style={styles.buttonText}>Sou Empresa</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/loginFuncionario")}
      >
        <Text style={styles.buttonText}>Sou Funcionário</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#FEFDF9",
  },
  title: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 30,
    color: "#285A71",
  },
  button: {
    backgroundColor: "#285A71",
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
  },
  buttonText: {
    color: "#ECEFDA",
    textAlign: "center",
    fontWeight: "600",
  },
});