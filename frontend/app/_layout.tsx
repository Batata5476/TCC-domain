import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: "#ECEFDA",
          },
          headerTintColor: "#285A71",
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="loginEmpresa" options={{ title: "Empresa" }} />
        <Stack.Screen name="loginFuncionario" options={{ title: "Funcionario" }} />
        <Stack.Screen name="cadastroEmpresa" options={{ title: "Cadastro empresa" }} />
        <Stack.Screen name="cadastroFuncionario" options={{ title: "Cadastro funcionario" }} />
        <Stack.Screen name="dashboard" options={{ title: "Dashboard" }} />
        <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      </Stack>

      <StatusBar style="dark" />
    </>
  );
}
